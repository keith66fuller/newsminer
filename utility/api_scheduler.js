// get the request counter for today from the database
// if it isn't there, create it
// For each source
//
//     if we already got page 1 from this source
//         get the next page
//     else
//         query for todays results and get the total number
//         calculate the number of pages to retrieve
//             total / 100 rounded down to nearest whole number because we already got the first page

//     increment request counter for today

//     if request counter for today <1000
//         schedule the next run of this function in 90 seconds.
//     else
//         schedule the next run of this function for tomorrow at 00:00

const db = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const moment = require("moment");
const todayOnly = moment().format('YYYY-MM-DD');
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(process.env.NEWSAPIKEY);
const today = moment().format('YYYY-MM-DD 23:59:59');
const UPDATE = true;
const util = require("util");




function updateApiCounters(intervalObj) {
    // Update the API call counter in DB
    // If we reach hourly (250) or daily (1000) api call limits, cancel the setInterval
    const today = moment().utc().format('YYYY-MM-DD');
    const hour = moment().utc().format('YYYY-MM-DD HH:00:00');
    [
        {
            obj: db.ApiCounterD,
            temporal: today,
            where: { date: today },
            limit: 1000,
            handle: "Daily"
        },
        {
            obj: db.ApiCounterH,
            temporal: hour,
            where: { hour: hour },
            limit: 250,
            handle: "Hourly"
        }
    ].forEach(e => {
        e.obj.findOrCreate({
            where: e.where,
            defaults: {
                counter: 0
            }
        }).spread((obj, created) => {
            console.log((created ? "New" : "Existing") + " API " + e.handle + " call counter for " + e.temporal + " is " + obj.counter);
            obj.increment('counter', { by: 1 })
                .then(obj => {
                    if (obj.counter >= e.limit) {
                        console.log("WARNING: " + e.handle + " call limit exceeded!")
                        clearInterval(intervalObj)
                    }
                })
        })
    })
}

function callApi(intervalObj, source, startAt, page) {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////                          call the news api                                   //////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////

    process.env.APICALLED = true
    updateApiCounters(intervalObj);
    if (UPDATE) {
        newsapi.v2.everything({
            sources: source,
            pageSize: 100,
            page: 1,
            from: startAt,
            sortBy: 'publishedAt'
        }).then(response => {
            // console.log("API response: "+JSON.stringify(response, null, 2))
            if (response.status == "ok" && response.totalResults) {
                console.log("SOURCE: " + source + " PAGE: " + page + " TOTAL RESULTS: " + response.totalResults + " -- " + Math.round(response.totalResults / 100) + " more requests are needed today");
                if (typeof response.articles[0] != 'undefined') {
                    db.SourceRetrieval.update({
                        startAt: response.articles[response.articles.length - 1].publishedAt,
                        totalArticles: response.totalResults
                    }, {
                            where: {
                                source: source,
                                date: today
                            }
                        }).then(function () {
                            (response.articles).forEach(article => {
                                article.SourceId = article.source.id
                                article.source = article.source.id
                                console.log(article.publishedAt, article.title)
                                db.Article.create(article).catch(error => { })
                            });
                        })
                } else {
                    console.log("Response articles is UNDEFINED")
                }
            } else {
                console.log("BAD response to api call ==> " + JSON.stringify(response, null, 2));
            }
        })
    }
}




module.exports = function apiScheduler() {
    let sourceIdx = 0;
    db.Source.findAll().then(function (dbSources) {
        let apiSchedulerInterval = setInterval(function (dbSources) {
            const now = moment().utc()
            const oneHourAgo = moment().utc().subtract(1,'h');
            let dbSource = dbSources[sourceIdx]
            console.log("Querying Source " + dbSource.id + " " + sourceIdx + "/" + dbSources.length +" TODAY: " + now.format('YYYY-MM-DD') + " HOUR: " + now.format('YYYY-MM-DD HH:00:00'))
            db.SourceRetrieval.findOrCreate({
                where: {
                    date: now.format('YYYY-MM-DD'),
                    source: dbSource.id
                },
                defaults: {
                    totalArticles: 0,
                    totalPages: 0,
                    pagesRetrieved: 0,
                    startAt: oneHourAgo
                }
            }).spread((dbSourceRetrieval, created) => {
                console.log("dbSourceRetrieval " + JSON.stringify(dbSourceRetrieval, null, 2))
                const getPagesCount = created ? 1 : ++dbSourceRetrieval.pagesRetrieved;
                const startAt = dbSourceRetrieval.startAt
                const whatPass = created ? "first" : "subsequent";
                console.log("Getting a " + whatPass + " pass at " + dbSource.id + " starting at  " + startAt)
                callApi(apiSchedulerInterval, dbSource.id, startAt, getPagesCount);

                // TODO: update sourceRetrieval with most recent article got.

            }).then(function () {
                if (sourceIdx < dbSources.length - 1) {
                    sourceIdx++;
                    console.log("Go to next source");
                } else {
                    sourceIdx = 0;
                    console.log(dbSource.id + "=================================== Done with all sources");
                }
            })
        }, process.env.API_INTERVAL, dbSources)
    })

}
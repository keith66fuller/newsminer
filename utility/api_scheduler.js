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


function updateApiCounter(obj1) {
    return new Promise((resolve, reject) => {
        obj1.obj.findOrCreate({
            where: obj1.where,
            defaults: {
                counter: 0
            }
        }).spread((obj, created) => {
            obj.increment('counter', { by: 1 })
                .then(obj => {
                    if (obj.counter >= obj1.limit) {
                        return reject("WARNING: " + obj1.handle + " call limit exceeded!")
                    } else {
                        resolve((created ? "New" : "Existing") + " API " + obj1.handle + " call counter for " + obj1.temporal + " is " + obj.counter)
                    }
                })
        })
    })
}


function updateApiCounters(intervalObj) {
    // Update the API call counter in DB
    // If we reach hourly (250) or daily (1000) api call limits, cancel the setInterval
    return new Promise(async function (resolve, reject) {
        const today = moment().utc().format('YYYY-MM-DD');
        const hour = moment().utc().startOf('hour').toISOString();
        errFlag = false;

        var p1 = await updateApiCounter({
            obj: db.ApiCounterH,
            temporal: hour,
            where: { hour: hour },
            limit: 250,
            handle: "Hourly"
        })
            .catch(err => { console.log(err); errFlag = true })
            .then(data => { console.log(data) })


        var p2 = await updateApiCounter({
            obj: db.ApiCounterD,
            temporal: today,
            where: { date: today },
            limit: 1000,
            handle: "Daily"
        })
            .catch(err => { console.log(err); errFlag = true })
            .then(data => { console.log(data) })

        if (!errFlag) {
            resolve()
        } else {
            return reject("WARNING: One or more api counters exceeded!")
        }
    })
}

function callApi(intervalObj, source, startAt, page) {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////                          call the news api                                   //////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////

    process.env.APICALLED = true;
    var newStartAt = moment(startAt).toISOString();
    updateApiCounters(intervalObj)
        .then(() => {
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
                            (response.articles).forEach(article => {
                                article.SourceId = article.source.id
                                article.source = article.source.id
                                db.Article.create(article)
                                    .catch(error => {
                                        // console.log("ERROR: "+error+" " + article.publishedAt, article.title)
                                    })
                                    .then(() => {
                                        // console.log("TEST " + article.publishedAt + " " + newStartAt + " " + article.title)
                                        console.log("ADDED: " + article.publishedAt, article.title)
                                        if (moment(article.publishedAt).isSameOrAfter(startAt) && moment(article.publishedAt).isSameOrAfter(newStartAt)) {
                                            console.log("New Newest " + article.publishedAt + " " + newStartAt + " " + article.title)
                                            newStartAt = article.publishedAt;
                                            db.Source.update(
                                                { newest: newStartAt },
                                                { where: { id: source } }
                                            )
                                            .then(() => {
                                                console.log("New startAt for " + source + " : " + newStartAt)
                                            })
                                            .catch(err => {
                                                console.log("ERROR updating source: " + err)
                                            })
                                        }
                                    })
                            });
                        } else {
                            console.log("Response articles is UNDEFINED")
                        }
                    } else {
                        console.log("BAD response to api call ==> " + JSON.stringify(response, null, 2));
                    }
                })
            }
        })
        .catch(err => {
            console.log(err)
            // clearInterval(intervalObj)
        })

}




module.exports = function apiScheduler() {
    let sourceIdx = 0;
    db.Source.findAll({
        order: [
            ['oldest', 'DESC']
        ]
    }).then(function (dbSources) {
        let apiSchedulerInterval = setInterval(function (dbSources) {
            const now = moment().utc()
            const oneHourAgo = moment().utc().subtract(1, 'h');
            let dbSource = dbSources[sourceIdx]
            console.log("Querying Source " + dbSource.id + " " + sourceIdx + "/" + dbSources.length + " TODAY: " + now.format('YYYY-MM-DD') + " HOUR: " + now.format('YYYY-MM-DD HH:00:00'))
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
                console.log("dbSource " + JSON.stringify(dbSource, null, 2))
                const getPagesCount = created ? 1 : ++dbSourceRetrieval.pagesRetrieved;
                const startAt = dbSource.newest
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




// db.SourceRetrieval.update({
//     startAt: response.articles[response.articles.length - 1].publishedAt,
//     totalArticles: response.totalResults
// }, {
//         where: {
//             source: source,
//             date: today
//         }
//     }).then(function () {
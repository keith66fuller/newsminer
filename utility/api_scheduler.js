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
const INTERVAL = 10000;

module.exports = function apiScheduler() {
    db.globalSetting.findOne({
        where: {
            id: 'apikey'
        }
    }).then(dbApikey => {
        const NewsAPI = require('newsapi');
        const newsapi = new NewsAPI(dbApikey.value)
        const today = moment().format('YYYY-MM-DD 00:00')

        function callApi(source, fromDate, mostRecent, page) {
            db.ApiCounter.findOne({
                where: {
                    date: fromDate
                }
            }).then(dbApiCounter => {
                if (dbApiCounter >= 1000) {
                    console.log("NO MORE API CALLS FOR "+fromDate)
                } else {
                    console.log("THIS IS API CALL # "+dbApiCounter.counter+" for "+fromDate)
                    newsapi.v2.everything({
                        sources: source,
                        pageSize: 100,
                        page: page,
                        from: fromDate
                    }).then(response => {
                        if (page == 1) {
                            console.log("SOURCE: "+source+" TOTAL RESULTS: " + response.totalResults);
                        } else {
                            console.log("SOURCE: "+source+" PAGE: " + page);
                        }
                        if (response.status == "ok" && response.totalResults) {
                            if (typeof response.articles[response.articles.length - 1] != 'undefined') {
                                db.SourceRetrieval.update({
                                    mostRecent: response.articles[response.articles.length - 1].date
                                },
                                {where : {
                                    source: source,
                                    date: fromDate
                                }}).then(function() {
                                    (response.articles).forEach(article => {
                                        article.SourceId = article.source.id
                                        article.source = article.source.id
                                        db.Article.create(article).catch(error =>{})
                                    });
                                })
                            }
                        } else {
                            console.log("BAD response to api call ==> "+JSON.stringify(response, null, 2));
                        }
                    })
        
                    // Update our API call counter in DB
                    db.ApiCounter.increment('counter', { where: { date: fromDate }});
                }
            })
        }

        console.log("Date is " + today)
        db.ApiCounter.findOrCreate({
                where: {
                    date: today
                },
                defaults: {
                    counter: 0
                }
            })
            .spread((dbApiCounter, created) => {
                const reqCtr = dbApiCounter.counter
                console.log((created ? "New" : "Existing") + " API call counter for " + today + " is " + reqCtr);


                /////////////////////////////////////////////////////////////////////////////////////////////////////////////
                /////////////                          loop through sources                                //////////////////
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////

                //For every source in the database, query newsapi to get the number of results
                db.Source.findAll().then(function (dbSources) {
                    // console.log(JSON.stringify(dbSources, null, 2))
                    // console.log("Querying Source " + JSON.stringify(dbSource.id, null, 2))
                    let sourceIdx = 0;

                    let apiSchedulerTimeout = setInterval(function (dbSources) {
                        let updatedSomeSources = 0;
                        let dbSource = dbSources[sourceIdx]
                        console.log("Querying Source " + dbSource.id + " " + sourceIdx + "/" + dbSources.length)
                        const ta = Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000
                        db.SourceRetrieval.findOrCreate({
                            where: {
                                source: dbSource.id
                            },
                            defaults: {
                                date: today,
                                totalArticles: ta,
                                totalPages: Math.round(ta / 100),
                                pagesRetrieved: 0,
                                mostRecent: today
                            }
                        }).spread((dbSourceRetrieval, created) => {
                            if (created) {
                                console.log("Getting a first pass at " + dbSource.id)
                                callApi(dbSource.id, today, dbSource.mostRecent, 1);
                                updatedSomeSources++;
                            } else {
                                if (dbSourceRetrieval.pagesRetrieved < dbSourceRetrieval.totalPages) {
                                    console.log("MOMENT: "+moment(dbSourceRetrieval.updatedAt).format('YYYY-MM-DD HH:mm:ss'))
                                    callApi(dbSource.id, moment(dbSourceRetrieval.updatedAt).format('YYYY-MM-DD HH:mm:ss'), dbSource.mostRecent, ++dbSourceRetrieval.pagesRetrieved);
                                    console.log("Getting a subsequent pass at " + dbSource.id + " with " + dbSourceRetrieval.pagesRetrieved + " pages retrieved so far")
                                    db.SourceRetrieval.update({
                                        pagesRetrieved: dbSourceRetrieval.pagesRetrieved
                                    }, {
                                        where: {
                                            source: dbSource.id,
                                            date: today
                                        }
                                    })
                                    updatedSomeSources++;
                                } else {
                                    console.log(dbSource.id + " is up to date for " + today)
                                }
                            }
                        }).then(function () {
                            if (sourceIdx < dbSources.length - 1) {
                                sourceIdx++;
                                console.log("Not Done Yet - Go to next source");
                            } else {
                                sourceIdx = 0;
                                console.log(dbSource.id + "=================================== Done with all sources - go to next page");
                            }
                        })
                    }, INTERVAL, dbSources)
                })
            })
    })
}
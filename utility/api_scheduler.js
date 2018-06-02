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

        const NewsAPI = require('newsapi');
        const newsapi = new NewsAPI(process.env.NEWSAPIKEY)
        const today = moment().format('YYYY-MM-DD 23:59:59')
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /////////////                          call the api                                        //////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////
        function callApi(source, mostRecent, page) {
            db.ApiCounter.findOne({
                where: {
                    date: today
                }
            }).then(dbApiCounter => {
                if (dbApiCounter >= 1000) {
                    console.log("NO MORE API CALLS FOR " + today)
                } else {
                    console.log("THIS IS API CALL # " + dbApiCounter.counter + " for " + today)
                    newsapi.v2.everything({
                        sources: source,
                        pageSize: 100,
                        page: 1,
                        to: mostRecent,
                        sortBy: 'publishedAt'
                    }).then(response => {
                        // Update our API call counter in DB
                        db.ApiCounter.increment('counter', {
                            where: {
                                date: today
                            }
                        }).then(function() {
                            // console.log("API response: "+JSON.stringify(response, null, 2))
                            if (response.status == "ok" && response.totalResults) {
                                console.log("SOURCE: " + source + " PAGE: " + page + " TOTAL RESULTS: " + response.totalResults + " -- "+Math.round(response.totalResults/100)+" more requests are needed today");
                                if (typeof response.articles[0] != 'undefined') {
                                    db.SourceRetrieval.update({
                                        mostRecent: response.articles[response.articles.length -1 ].publishedAt,
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
                                            db.Article.create(article).catch(error => {})
                                        });
                                    })
                                } else {
                                        console.log("Response articles is UNDEFINED")
                                }
                            } else {
                                console.log("BAD response to api call ==> " + JSON.stringify(response, null, 2));
                            }
                        })


                    })
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
                        let dbSource = dbSources[sourceIdx]
                        console.log("Querying Source " + dbSource.id + " " + sourceIdx + "/" + dbSources.length)

                        db.SourceRetrieval.findOrCreate({
                            where: {
                                source: dbSource.id
                            },
                            defaults: {
                                date: today,
                                totalArticles: 0,
                                totalPages: 0,
                                pagesRetrieved: 0,
                                mostRecent: today
                            }
                        }).spread((dbSourceRetrieval, created) => {
                            const mr = moment(dbSourceRetrieval.mostRecent).format('YYYY-MM-DD HH:mm:ss');
                            if (created) {
                                console.log("Getting a first pass at " + dbSource.id + " Most Recent: " + mr)
                                callApi(dbSource.id, dbSource.mostRecent, 1);
                            } else {
                                    
                                    console.log("Getting a subsequent pass at " + dbSource.id + " with " + dbSourceRetrieval.pagesRetrieved + " pages retrieved so far and Most Recent: " + mr)
                                    callApi(dbSource.id, mr, ++dbSourceRetrieval.pagesRetrieved);
                                    db.SourceRetrieval.update({
                                        pagesRetrieved: dbSourceRetrieval.pagesRetrieved
                                    }, {
                                        where: {
                                            source: dbSource.id,
                                            date: today
                                        }
                                    })
                            }
                        }).then(function () {
                            if (sourceIdx < dbSources.length - 1) {
                                sourceIdx++;
                                console.log("Go to next source");
                            } else {
                                sourceIdx = 0;
                                console.log(dbSource.id + "=================================== Done with all sources");
                            }
                        })
                    }, INTERVAL, dbSources)
                })
            })

}
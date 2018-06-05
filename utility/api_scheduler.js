const db = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const moment = require("moment");
const todayOnly = moment().format('YYYY-MM-DD');
const today = moment().format('YYYY-MM-DD 23:59:59');
const UPDATE = process.env.APISCHEDULER;
const util = require("util");
const cTable = require('console.table');

if (UPDATE) {
    const NewsAPI = require('newsapi');
    const newsapi = new NewsAPI(process.env.NEWSAPIKEY);
}

function updateApiCounter(obj1) {
    return new Promise((resolve, reject) => {
        obj1.obj.findOrCreate({
                where: obj1.where,
                defaults: {
                    counter: 0,
                    exceeded: false
                }
            })
            .spread((obj, created) => {
                if (obj.exceeded) {
                    return reject("WARNING: " + obj1.handle + " call limit exceeded!")
                } else {
                    obj.increment('counter', {
                            by: 1
                        })
                        .then(obj => {
                            if (obj.counter >= obj1.limit) {
                                obj.update({ exceeded: true })
                                .then(() => {
                                    return reject("WARNING: " + obj1.handle + " call limit exceeded!")
                                })
                                
                            } else {
                                resolve((created ? "New" : "Existing") + " API " + obj1.handle + " call counter for " + obj1.temporal + " is " + obj.counter)
                            }
                        })
                }
            })
    })
}

function updateApiCounters(intervalObj) {
    // Update the API call counter in DB
    // If we reach hourly (250) or daily (1000) api call limits, cancel the setInterval
    return new Promise(async function (resolve, reject) {
        const today = moment().utc().format('YYYY-MM-DD');
        const dayStart = moment().utc().startOf('day');
        let q1 = moment().utc().diff(dayStart, 's');
        const qPeriod = dayStart.add(q1 - q1 % 21600, 's').toISOString();
        console.log("QPERIOD: " + qPeriod)
        errFlag = false;

        var p1 = await updateApiCounter({
                obj: db.ApiCounterQ,
                temporal: qPeriod,
                where: {
                    qPeriod: qPeriod
                },
                limit: 250,
                handle: "6 Hoursly"
            })
            .catch(err => {
                console.log(err);
                errFlag = true
            })
            .then(data => {
                console.log(data)
            })


        var p2 = await updateApiCounter({
                obj: db.ApiCounterD,
                temporal: today,
                where: {
                    date: today
                },
                limit: 1000,
                handle: "Daily"
            })
            .catch(err => {
                console.log(err);
                errFlag = true
            })
            .then(data => {
                console.log(data)
            })

        if (!errFlag) {
            resolve()
        } else {
            return reject("WARNING: One or more api counters exceeded!")
        }
    })
}

function updateSourceNewestTime(source, time) {
    db.Source.update({
            newest: time
        }, {
            where: {
                id: source
            }
        })
        .then((dbSource) => {
            console.log("New newest for " + source + " : " + time)
        })
        .catch(err => {
            console.log("ERROR updating source " + source + ": " + err)
        })
}

function callApi(intervalObj, source, startAt, pageNum, dbSr) {
    startAt = moment(startAt).format("YYYY-MM-DD HH:mm:SS");
    var newStartAt = startAt;
    console.log("CALLAPI startAt: " + startAt)
    updateApiCounters(intervalObj)
        .then(() => {
            if (UPDATE) {
                newsapi.v2.everything({
                    sources: source,
                    pageSize: 100,
                    page: pageNum,
                    from: startAt,
                    sortBy: 'publishedAt'
                }).then(response => {
                    // console.log("API response: "+JSON.stringify(response, null, 2))
                    if (response.status == "ok" && response.totalResults) {
                        var totalPages = Math.floor(response.totalResults / 100)
                        console.log("SOURCE: " + source + " PAGE: " + pageNum + " TOTAL RESULTS: " + response.totalResults + " -- " + totalPages + " more requests are needed.");

                        if (pageNum == 1 && totalPages > 0) {
                            console.log("FIRST PAGE FOR SOURCE")
                            db.SourceRetrieval.create({
                                    source: source,
                                    date: startAt,
                                    totalArticles: response.totalResults,
                                    totalPages: totalPages,
                                    pagesRetrieved: 1,
                                    startAt: startAt
                                })
                                .catch(err => {
                                    console.log("ERROR: Creating SourceRetrieval")
                                })
                        } else if (dbSr) {
                            console.log("INCREMENTING PAGECOUNT FOR SOURCE")
                            dbSr.increment('pagesRetrieved', {
                                    by: 1
                                })
                                .then(() => {
                                    if (dbSr.pagesRetrieved >= dbSr.totalPages) {
                                        console.log("DESTROYING SR")
                                        dbSr.destroy();
                                        if (typeof response.articles[0] != 'undefined') {
                                            console.log("UPDATING TIME TO " + response.articles[0].publishedAt)
                                            updateSourceNewestTime(source, response.articles[0].publishedAt)
                                        }
                                    }
                                })
                        }
                        if (typeof response.articles[0] != 'undefined') {
                            (response.articles).forEach(article => {
                                article.SourceId = article.source.id
                                article.source = article.source.id
                                db.Article.create(article)
                                    .then(() => {
                                        // console.log("TEST " + article.publishedAt + " " + newStartAt + " " + article.title)
                                        console.log("ADDED: " + article.publishedAt, article.title)
                                        if (moment(article.publishedAt).isSameOrAfter(startAt) && moment(article.publishedAt).isSameOrAfter(newStartAt)) {
                                            newStartAt = article.publishedAt;
                                            updateSourceNewestTime(source, newStartAt)
                                        }
                                    })
                                    .catch(error => {
                                        // These are validation errors because the row already exists.
                                        // console.log("ERROR: "+error+" " + article.publishedAt, article.title)
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
            clearInterval(intervalObj)
        })
}




module.exports = function apiScheduler() {
    let sourceIdx = 0;
    db.Source.findAll({
        order: [
            ['oldest', 'ASC']
        ]
    }).then(function (dbSources) {
        let apiSchedulerInterval = setInterval(function (dbSources) {
            const now = moment().utc()
            let dbSource = dbSources[sourceIdx]
            let startAt = dbSource.newest
            console.log("########################################################################################################")
            console.log("Querying Source " + dbSource.id + " " + sourceIdx + "/" + dbSources.length + " TODAY: " + now.format('YYYY-MM-DD') + " HOUR: " + now.format('YYYY-MM-DD HH:00:00') + " starting at  " + moment(startAt).toISOString())
            console.table(dbSource.dataValues);
            db.SourceRetrieval.findOne({
                    where: {
                        source: dbSource.id
                    }
                })
                .then(dbSr => {
                    callApi(apiSchedulerInterval, dbSource.id, dbSr.startAt, dbSr.pagesRetrieved + 1, dbSr);
                })
                .catch(err => {
                    callApi(apiSchedulerInterval, dbSource.id, startAt, 1);
                })
                .then(() => {
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
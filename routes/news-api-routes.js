const db = require("../models");
module.exports = function (app) {
  db.globalSetting.findOne({
    where: {
      id: 'apikey'
    }
  }).then(dbApikey => {
    const NewsAPI = require('newsapi');
    const newsapi = new NewsAPI(dbApikey.value)
    // For every source in the database, query newsapi to get the number of results
    // db.Source.findAll().then(function (dbSources) {
    //   // console.log(JSON.stringify(dbSources, null, 2))
    //   dbSources.forEach(dbSource => {
    //     console.log("Querying Source " + JSON.stringify(dbSource.id, null, 2))
    //     newsapi.v2.everything({
    //       sources: dbSource.id,
    //       pageSize: 100
    //     }).then(response => {
    //       console.log("TOTAL RESULTS: " + response.totalResults + " " + response.totalResults / 100)
    //     })
    //   })
    // })


    // For every source in the database, get the date of the oldest and newest article we have
    // and update each source
    // db.Source.findAll().then(function (dbSources) {
    //   // console.log(JSON.stringify(dbSources, null, 2))
    //   dbSources.forEach(dbSource => {
    //     db.Article.findAll({
    //       where: {
    //         SourceId: dbSource.id
    //       },
    //       order: [
    //         ['publishedAt', 'ASC']
    //       ],
    //       limit: 1
    //     }).then(dbArticle => {
    //       db.Source.update({
    //         oldest: dbArticle[0].publishedAt
    //       }, {
    //         where: {
    //           name: dbSource.name
    //         }
    //       }).then(function (dbArticle2) {
    //         console.log(dbSource.name, dbArticle[0].publishedAt)


    //         db.Article.findAll({
    //           where: {
    //             SourceId: dbSource.id
    //           },
    //           order: [
    //             ['publishedAt', 'DESC']
    //           ],
    //           limit: 1
    //         }).then(dbArticle => {
    //           db.Source.update({
    //             newest: dbArticle[0].publishedAt
    //           }, {
    //             where: {
    //               name: dbSource.name
    //             }
    //           }).then(function (dbArticle2) {
    //             console.log(dbSource.name, dbArticle[0].publishedAt)
    //           })
    //         })
    //       })
    //     })
    //   })
    // })



    // This is a test of retrieving pages of results
    // if (response.totalResults) {
    //   for (let i = 1; i < response.totalResults / 100; i++) {
    //     console.log("I: " + i)
    //   }
    // }


    // if (response.status == "ok" && response.totalResults) {
    //   (response.articles).forEach(article => {
    //     article.SourceId = article.source.id
    //     article.source = article.source.id
    //     // console.log(article)
    //     // process.exit()
    //     db.Article.create(article)
    //       .then(
    //         console.log(article)
    //       )
    //       .catch(error => {
    //         throw (error)
    //         process.exit()
    //       })
    //   });
    // } else {
    //   console.log(JSON.stringify(response, null, 2));
    //   process.exit();
    // }

  }).catch(error => {
    console.log(error)
    throw (error)
  })

}
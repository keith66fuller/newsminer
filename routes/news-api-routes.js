const async = require('async');

const db = require("../models");
module.exports = function (app) {
  db.globalSetting.findOne({
    where: {
      id: 'apikey'
    }
  }).then(dbApikey => {
    const NewsAPI = require('newsapi');
    const newsapi = new NewsAPI(dbApikey.value)


    app.get("/api/source/:id", function (req, res) {
      console.log("Querying Source " + JSON.stringify(req.params.id, null, 2))
      var d = new Date(Math.abs(new Date() -86400000));
      console.log(d);
      if (req.query.range) {
        console.log(req.query.range)
      }
      db.Source.findOne({
        where: {
          id: req.params.id
        }
      }).then(function (dbSource) {
        console.log("Newest article we have is from "+dbSource.newest)
        let passes = 6.9;
        let currentPage = 2;
        async function bbb() {
          console.log("PASSES is now "+passes--)
          console.log("PAGE is now "+currentPage++)
          return 
        }
        while (passes >= 0) {
          async function ttt() {
            await bbb();
          }
        }
          // async.doWhilst (
          //   function(callback) {
          //     console.log("PASSES is now "+passes--)
          //     console.log("PAGE is now "+currentPage++)
          //   },
          //   function(callback) {return passes >= 0}
          // )
        
        // newsapi.v2.everything({
        //   sources: req.params.id,
        //   pageSize: 100,
        //   from: dbSource.newest
        // }).then(response => {
        //   let currentPage = 2;
        //   let passes = response.totalResults / 100;
        //   console.log("TOTAL RESULTS: " + response.totalResults + " " + passes);
        //   if (response.status == "ok" && response.totalResults) {
        //       (response.articles).forEach(article => {
        //         article.SourceId = article.source.id
        //         article.source = article.source.id
        //         // db.Article.create(article)
        //         //   .then(
        //         //     console.log(article.title)
        //         //   )
        //       });
        //     } else {
        //       console.log(JSON.stringify(response, null, 2));
        //       process.exit();
        //     }

        //   async.doWhilst (
        //     function(callback) {
        //       console.log("PASSES is now "+passes--)
        //       console.log("PAGE is now "+currentPage++)
        //     },
        //     function(callback) {return passes >= 0}
        //   )
        // })
  
      });

    });

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


   
  }).catch(error => {
    console.log(error)
    throw (error)
  })

}
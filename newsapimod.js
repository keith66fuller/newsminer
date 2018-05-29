var db = require("./models");

db.globalSetting.findOne({
  where: {
    id: 'apikey'
  }
}).then(function (dbApikey) {
  console.log('APIKEY' + dbApikey.value)
  apikey = dbApikey.value
  const NewsAPI = require('newsapi');
  const newsapi = new NewsAPI(apikey);
  db.Source.findAll().then(function (dbSources) {
    // console.log(JSON.stringify(dbSources, null, 2))
    dbSources.forEach(dbSource => {
      console.log("Querying Source "+JSON.stringify(dbSource, null, 2))
      newsapi.v2.everything({
        sources: dbSource.id,
        pageSize: 100
      }).then(response => {
        // console.log(JSON.stringify(response, null, 2));
        if (response.status == "ok") {
          (response.articles).forEach(article => {
            article.SourceId = article.source.id
            article.source = article.source.id
            console.log(article)
            // process.exit()
            db.Article.create(article).then(console.log(article)).catch(err => {
              throw (err)
              process.exit()
            })
          });
        } else {
          console.log(JSON.stringify(response, null, 2));
          process.exit();
        }
      }).catch(err => {
        console.log(err)
        throw (err)
      })
    });

  })
})



// var newsQuery = {
//   q: 'bitcoin',
//   sources: 'bbc-news,the-verge',
//   domains: 'bbc.co.uk, techcrunch.com',
//   from: '2017-12-01',
//   to: '2017-12-12',
//   language: 'en',
//   sortBy: 'relevancy',
//   page: 2
// }
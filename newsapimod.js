const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('aaa06c5b808049bab494e222bec1381f');

var db = require("./models");

var newsQuery = {
  q: 'bitcoin',
  sources: 'bbc-news,the-verge',
  domains: 'bbc.co.uk, techcrunch.com',
  from: '2017-12-01',
  to: '2017-12-12',
  language: 'en',
  sortBy: 'relevancy',
  page: 2
}


db.Source.findAll().then(function (dbSources) {
  console.log(JSON.stringify(dbSources, null, 2))
  dbSources.forEach(dbSource => {
    newsapi.v2.everything({
      sources: dbSource.id,
      from: "2018-05-01"
    }).then(response => {
      // console.log(JSON.stringify(response, null, 2));
      if (response.status == "ok") {
        (response.articles).forEach(article => {
          article.SourceId = article.source.id
          article.source = article.source.id
          console.log(article)
          // process.exit()
          db.Article.create(article).then(console.log(article))
        });
      } else {
        console.log(JSON.stringify(response, null, 2));
        process.exit();
      }


    });
  });

})
var db = require("./models");
var apikey = ''

db.globalSetting.findOne({
  where: {
    id: 'apikey'
  },
  include: [db.globalSetting]
}).then(function(dbApikey) {
  console.log('APIKEY'+dbApikey.value)
  apikey = dbApikey.value
  process.exit();
  const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(apikey);

})



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

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

db.Source.findAll().then(function (dbSources) {
  console.log(JSON.stringify(dbSources, null, 2))
  dbSources.forEach(dbSource => {
    newsapi.v2.everything({
      sources: dbSource.id,
      from: "2018-05-02",
      to: "2018-05-02"
    }).then(response => {
      // console.log(JSON.stringify(response, null, 2));
      if (response.status == "ok") {
        (response.articles).forEach(article => {
          article.SourceId = article.source.id
          article.source = article.source.id
          console.log(article)
          // process.exit()
          db.Article.create(article).then(console.log(article)).catch(err => {
            throw(err)
            process.exit()
          })
        });
      } else {
        console.log(JSON.stringify(response, null, 2));
        process.exit();
      }


    }).catch(err => {
      console.log(err)
      throw(err)
    })
  });

})
var seedUrl = 'http://www.chicagotribune.com/business/'
var request = require("request")
const cheerio = require('cheerio')
var nodeScraper = require("node-scraper")
var scraper = nodeScraper(seedUrl, {
  selectors: ['.trb_outfit_relatedListTitle']
});
var scrape = require('html-metadata');
scraper.scrape().on('done', function (err, statusCode, content) {
  if (err) {
    console.error(err);
  } else {
    content.forEach(item => {
      (item.content).forEach(element => {
        var c = cheerio.load(element.html)
        var targetUrl = 'http://www.chicagotribune.com' + c('a').attr('href')
        targetUrl = targetUrl.split('#')[0]
        request(targetUrl, function (error, response, body) {
          if (!error && response.statusCode === 200) {
            scrape(targetUrl, function (error, metadata) {
              var author=metadata.general.author
              var item = ((metadata.schemaOrg.items).find(function(element) {
                if (element.properties.datePublished != null) {
                  return element.properties.datePublished
                }
              }))
              var datePublished=item.properties.datePublished[0]
              var headline=item.properties.headline[0]
              console.log(datePublished,author,headline)
            });
          }
        })
      })
    });

  }
});
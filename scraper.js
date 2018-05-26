const seedUrl = 'https://www.washingtonexaminer.com/news'
const selectors = ['.HeroTextBelow-media', '.TextSimplePromo-title', '.TextDescriptionPromo-title']

const request = require("request")
const cheerio = require('cheerio')
const nodeScraper = require("node-scraper")
const scraper = nodeScraper(seedUrl, {
    selectors: selectors
});
const scrape = require('html-metadata');
scraper.scrape().on('done', function (err, statusCode, content) {
    if (err) {
        console.error(err);
    } else {
        content.forEach(item => {
            (item.content).forEach(element => {
                var c = cheerio.load(element.html)
                var targetUrl = c('a').attr('href')
                targetUrl = targetUrl.split('#')[0]
                request(targetUrl, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        scrape(targetUrl, function (error, metadata) {
                            // console.log(JSON.stringify(metadata, null, 4))
                            // process.exit()
                            var author = item.openGraph.author
                            var datePublished = item.openGraph.published_time[0]
                            var title = item.openGraph.title[0]
                            var url = item.openGraph.url[0]
                            console.log(datePublished, author, title,url)
                        });
                    }
                })
            })
        });
    }
});
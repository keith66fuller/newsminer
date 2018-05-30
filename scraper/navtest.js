const Build = require('newspaperjs').Build;
const Article = require('newspaperjs').Article




let input = {
    name: "Washington Examiner",
    seedUrl: 'https://www.washingtonexaminer.com',
    selectors: ['.NavigationLink{href}']
}



const seedUrl = input.seedUrl
const selectors = input.selectors
const host = seedUrl.match(/https?:\/\/([^\/]+)/gi)

const request = require("request")
const cheerio = require('cheerio')
const nodeScraper = require("node-scraper")
const scraper = nodeScraper(seedUrl, {
    selectors: selectors
});
const scrape = require('html-metadata');
scraper.scrape().on('done', function (err, statusCode, scrapeContent) {
    if (err) {
        console.error(err);
    } else {
        console.log("CONTENT: "+JSON.stringify(scrapeContent, null, 2))
        scrapeContent.forEach(item => {
            // console.log("CONTENT: "+JSON.stringify(item.content, null, 2))
            var ic = item.content
            ic.forEach(element => {
                console.log("ELEMENT: "+JSON.stringify(element.attributes.href, null, 2))
                // var c = cheerio.load(element.html)
                // console.log("C: "+JSON.stringify(c, null, 2))
                // var targetUrl = c('a').attr('href').split('#')[0]
                // if (!targetUrl.match(/^http/)) {
                //     targetUrl = host + targetUrl
                // }
                // console.log("NAVURL: "+JSON.stringify(targetUrl, null, 2))
            })
        });
    }
})
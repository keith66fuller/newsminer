// var seedUrl = 'https://slate.com/culture/2018/05/american-sitcoms-are-dealing-more-openly-with-race-but-not-always-getting-it-right.html'
// var seedUrl = 'http://www.foxnews.com/us/2018/05/27/police-launch-probe-after-video-shows-officer-punching-woman.html'
// var seedUrl = 'https://www.nytimes.com/2018/05/27/technology/router-fbi-reboot-malware.html'
// var seedUrl = 'http://www.latimes.com/politics/la-na-pol-essential-washington-updates-trump-says-he-is-still-hopeful-of-a-1527257325-htmlstory.html'
var seedUrl = 'https://www.washingtonexaminer.com/news/george-h-w-bush-hospitalized-in-maine'
var request = require("request")
const cheerio = require('cheerio')
var nodeScraper = require("node-scraper")
var scraper = nodeScraper(seedUrl, {
  selectors: ['.story-body']
});
var scrape = require('html-metadata');

var options =  {
    url: seedUrl,
    jar: request.jar(), // Cookie jar
    headers: {
        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
    }
};

scrape(options, function(error, metadata){
    console.log("METADATA: "+JSON.stringify(metadata, null, 2));

    for (p in metadata) {
        console.log("METADATA: "+p)
    }

    // items = metadata.schemaOrg.items
    // console.log(JSON.stringify(metadata, null, 2));
    // items.forEach(element => {
    //     if (element.id == seedUrl) {
    //         console.log("META: "+JSON.stringify(element, null, 2))
    //     }
    // });
});
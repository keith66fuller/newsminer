// const seedUrl = 'https://www.washingtonexaminer.com/news'
// const selectors = ['.HeroTextBelow-media', '.TextSimplePromo-title', '.TextDescriptionPromo-title']


// const seedUrl   = 'https://chicago.suntimes.com/section/news/'
// const selectors = ['.cst_article']

// const seedUrl   = 'https://www.nytimes.com/section/us?action=click&pgtype=Homepage&region=TopBar&module=HPMiniNav&contentCollection=U.S.&WT.nav=page'
// const selectors = ['.story-body']

const seedUrl = 'http://www.chicagotribune.com/business/'
const selectors = ['.trb_outfit_relatedListTitle']

const host = seedUrl.match(/https?:\/\/([^\/]+)/gi)

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
                if (!targetUrl.match(/^http/)) {
                    targetUrl = host + targetUrl
                }
                request(targetUrl, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        scrape(targetUrl, function (error, metadata) {
                            // console.log(JSON.stringify(metadata, null, 4))
                            // process.exit()


                            var author = findId(metadata, "author")
                            var date = findId(metadata, "published_time")
                            var title = findId(metadata, "title")
                            var url = findId(metadata, "url")

                            // date = (typeof date === 'undefined') ? metadata.openGraph.published : date;

                            // try {
                            //     author = (typeof author === 'undefined') ? ((metadata.schemaOrg.items)[0].properties.author)[0].properties.name : author
                            // }
                            // catch(err) {
                            //     author = (typeof author === 'undefined') ? (metadata.schemaOrg.items)[0].properties.author : author
                            // }

                            // if (url == null) {
                            //     url = metadata.general.canonical
                            // }

                            // if (title == null) {
                            //     title = metadata.general.title
                            // }

                            console.log(date, author, title, url)
                            if (author != null && date != null && title != null && url != null) {

                            }
                            // process.exit()
                        });
                    }
                })
            })
        });
    }
});


function findId(obj, id) {
    console.log("OBJ: "+obj)
    console.log("ID: "+JSON.stringify(id))
    if (obj.id === id) {
        return obj;
    }
    var result;
    for (var p in obj) {
        if (typeof obj[p] === 'object') {
            result = findId(obj[p], id);
            if (result) {
                return result;
            }
        }
    }

    return result;
}
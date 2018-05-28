const Build = require('newspaperjs').Build;
const Article = require('newspaperjs').Article

// Article('https://www.nytimes.com/2018/05/26/us/the-unofficial-history-of-memorial-day.html')
// .then(result=>{
//     console.log(result);
//     process.exit();
// }).catch(reason=>{
//     console.log(reason);
//     process.exit();
// })


let inputs = [
    {   name: "Washingtom Examiner",
        seedUrl: 'https://www.washingtonexaminer.com/news',
        sections: [''],
        selectors: ['.HeroTextBelow-media', '.TextSimplePromo-title', '.TextDescriptionPromo-title']
    },
    {
        seedUrl: 'https://www.washingtonexaminer.com/news/white-house',
        selectors: ['.HeroTextBelow-media', '.TextSimplePromo-title', '.TextDescriptionPromo-title']
    },
    {
        seedUrl: 'https://www.washingtonexaminer.com/news/congress',
        selectors: ['.HeroTextBelow-media', '.TextSimplePromo-title', '.TextDescriptionPromo-title']
    },
    {
        seedUrl: 'https://www.washingtonexaminer.com/news/campaigns',
        selectors: ['.HeroTextBelow-media', '.TextSimplePromo-title', '.TextDescriptionPromo-title']
    },
    {
        seedUrl: 'https://www.washingtonexaminer.com/policy',
        selectors: ['.HeroTextBelow-media', '.TextSimplePromo-title', '.TextDescriptionPromo-title']
    },
    {
        seedUrl: 'https://www.washingtonexaminer.com/policy/energy',
        selectors: ['.HeroTextBelow-media', '.TextSimplePromo-title', '.TextDescriptionPromo-title']
    },
    {
        seedUrl: 'https://www.washingtonexaminer.com/policy/healthcare',
        selectors: ['.HeroTextBelow-media', '.TextSimplePromo-title', '.TextDescriptionPromo-title']
    },
    {
        seedUrl: 'https://www.washingtonexaminer.com/policy/economy',
        selectors: ['.HeroTextBelow-media', '.TextSimplePromo-title', '.TextDescriptionPromo-title']
    },
    {
        seedUrl: 'https://www.washingtonexaminer.com/policy/technology',
        selectors: ['.HeroTextBelow-media', '.TextSimplePromo-title', '.TextDescriptionPromo-title']
    },
    {
        seedUrl: 'https://www.washingtonexaminer.com/policy/budgets-deficits',
        selectors: ['.HeroTextBelow-media', '.TextSimplePromo-title', '.TextDescriptionPromo-title']
    },
    {
        seedUrl: 'https://www.washingtonexaminer.com/policy/courts',
        selectors: ['.HeroTextBelow-media', '.TextSimplePromo-title', '.TextDescriptionPromo-title']
    },
    {
        seedUrl: 'https://www.washingtonexaminer.com/policy/foreign',
        selectors: ['.HeroTextBelow-media', '.TextSimplePromo-title', '.TextDescriptionPromo-title']
    },
    {
        seedUrl: 'https://www.washingtonexaminer.com/policy/defense-national-security',
        selectors: ['.HeroTextBelow-media', '.TextSimplePromo-title', '.TextDescriptionPromo-title']
    },
    {
        seedUrl: 'https://chicago.suntimes.com/section/news/',
        selectors: ['.cst_article']
    },
    {
        seedUrl: 'https://www.nytimes.com/section/us',
        selectors: ['.story-body']
    },
    {
        seedUrl: 'https://www.nytimes.com/section/world',
        selectors: ['.story-body']
    },
    {
        seedUrl: 'https://www.nytimes.com/section/policy/AAAAAA',
        selectors: ['.story-body']
    },
    {
        seedUrl: 'https://www.nytimes.com/section/business',
        selectors: ['.story-body']
    },
    {
        seedUrl: 'https://www.nytimes.com/section/technology',
        selectors: ['.story-body']
    },
    {
        seedUrl: 'https://www.nytimes.com/section/science',
        selectors: ['.story-body']
    },
    {
        seedUrl: 'https://www.nytimes.com/section/health',
        selectors: ['.story-body']
    },
    {
        seedUrl: 'https://www.nytimes.com/section/opinion',
        selectors: ['.story-body']
    },
    // {
    //     seedUrl: 'http://www.chicagotribune.com/business/',
    //     selectors: ['.trb_outfit_relatedListTitle']
    // }
]

shuffle(inputs).forEach(element => {
    getSite(element)
});

async function metascraper(url) {
    let article = {
        author: [],
        headline: null,
        url: url,
        imageUrl: null,
        keyWords: []
    }

    var whoCares1 = await Article(url)
        .then(result => {
            //console.log("####RESULT:  "+JSON.stringify(result, null, 2))
            article.author   = result.author
            article.headline = result.title
            article.imageUrl = result.topImage
            article.keyWords = result.keywords
            article.date     = result.date

            for (var p in article) {
                console.log("P=== "+p)
                if (article[p] == "") {
                    fbArticle = fallBackScrape(url)
                    console.log("183",JSON.stringify(article, null, 2))
                    console.log("184",JSON.stringify(fbArticle, null, 2))
                    process.exit()
                    for (var p in article) {
                        if (article[p] == null) {
                            if (fbArticle[p] != null) {
                                article[p] = fbArticle[p]
                            }
                        }
                    }
                    break
                }
            }

            // process.exit();
        }).catch(reason => {
            console.log(reason);
            
        })
}

async function fallBackScrape(url) {
    let article = {}
    console.log("115",url)
    await request(url, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            scrape(url, function (error, metadata) {

                // process.exit()

                console.log("METADATA: "+JSON.stringify(metadata))
                article.author   = findId(metadata, ["author"])
                article.date     = findId(metadata, ["published", "datePublished", "published_time", "modified", "dateModified", "modified_time"])
                article.headline = findId(metadata, ["title", "headline"])
                article.url      = findId(metadata, ["url", "canonical"])

                console.log(statusCode,JSON.stringify(article))
            });
        } else {
            console.log(statusCode,JSON.stringify(error))
        }
        return article
    })
    
}


function getSite(siteObj) {
    const seedUrl   = siteObj.seedUrl
    const selectors = siteObj.selectors
    const host = seedUrl.match(/https?:\/\/([^\/]+)/gi)

    const request     = require("request")
    const cheerio     = require('cheerio')
    const nodeScraper = require("node-scraper")
    const scraper     = nodeScraper(seedUrl, {
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
                    var targetUrl = c('a').attr('href').split('#')[0]
                    if (!targetUrl.match(/^http/)) {
                        targetUrl = host + targetUrl
                    }

                    let article  = metascraper(targetUrl)

                    
                })
            });
        }
    })
}


function findId(obj, id) {
    var result
    for (var p in obj) {
        // console.log("P: "+p+" ID: "+id+" == "+JSON.stringify(obj[p]))
        if (id.indexOf(p) != -1) {
            return obj[p]
        }
        if (typeof obj[p] == 'object') {
            result = findId(obj[p], id)
            if (result) {
                return result
            }

        }
    }
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }
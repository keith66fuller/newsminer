var seedUrl = 'https://www.nytimes.com/section/us'
var request = require("request")
const cheerio = require('cheerio')
var nodeScraper = require("node-scraper")
var scraper = nodeScraper(seedUrl, {
  selectors: ['.story-body']
});
var scrape = require('html-metadata');
scraper.scrape().on('done', function (err, statusCode, content) {
    console.log("CONTENT: "+JSON.stringify(content, null, 2))
  if (err) {
    console.error(err);
  } else {
    content.forEach(item => {
      (item.content).forEach(element => {
        var c = cheerio.load(element.html)
        
        // Sample
        // "html": " <a class=\"story-link\" data-rref=\"\" href=\"https://www.nytimes.com/2018/05/26/world/americas/american-citizen-held-in-venezuela-released-trump-announces.html\"> <div class=\"story-meta\"> <h2 class=\"headline\" itemprop=\"headline\"> Joshua Holt, an
        // American Held in a Venezuelan Jail for 2 Years, Is Back in the U.S. </h2> <p class=\"summary\" itemprop=\"description\">President Trump welcomed Mr. Holt home on Saturday from what Mr. Trump called a &#x201C;tough situation.&#x201D; Mr. Holt&#x2019;s release appeared to
        // be a step to try to lower tensions between Washington and Venezuela.</p> <p class=\"byline\" itemprop=\"author\">By MICHAEL D. SHEAR and NICHOLAS CASEY</p> </div><!-- close story-meta --> <div class=\"wide-thumb\"> <img role=\"presentation\" src=\"https://static01.nyt.co
        // m/images/2018/05/27/world/27prexy/27hostage-mediumThreeByTwo210.jpg\" alt=\"\" itemprop=\"thumbnailUrl\"> </div><!-- close wide-thumb --> </a> "
        
        var headline = c(".headline").text().trim()
        var url      = c("a").attr("href")
        var author   = c(".byline").text("href")
        console.log("HEADLINE: "+headline)
        console.log("URL:      "+url)
        console.log("AUTHOR:   "+author)

        let article = {}

        request(url, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                scrape(url, function (error, metadata) {
    
                    // process.exit()
    
                    console.log("METADATA: "+JSON.stringify(metadata))
                    article.author   = findId(metadata, ["author"])
                    article.date     = findId(metadata, ["published", "datePublished", "published_time", "modified", "dateModified", "modified_time"])
                    article.headline = findId(metadata, ["title", "headline"])
                    article.url      = findId(metadata, ["url", "canonical"])
    
                    console.log("ARTICLE: "+json.stringify(article, null, 2))
                });
            } else {
                console.log(statusCode,JSON.stringify(error))
            }
            
        })




        process.exit()

      })
    });
  }
});
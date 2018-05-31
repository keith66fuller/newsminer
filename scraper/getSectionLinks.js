const request = require("request")
const cheerio = require("cheerio")
const sources = require("./sources")
const debug   = false

var links = [];

sources.forEach(function(source) {
    const seedUrl       = source.seedUrl
    const selector      = source.selector
    const scheme        = seedUrl.match(/(https?):/i)[1]
    const host          = seedUrl.match(/:\/\/([^\/]+)/i)[1]
    const include       = source.include
    const relativeLinks = source.relativeLinks
    
    if (debug) { console.log("HOST: "+host) }
    request(seedUrl, function (error, response, body) {
        if (error) {
            console.log(JSON.stringify(error))
        } else {
            const c = cheerio.load(body)
            // if (debug) { console.log('body:', body) }
            c(selector).each( function(i,elem) {
                // if (debug) { console.log("ELEM: "+JSON.stringify(elem, null, 2)) }
                let link = cheerio(this).attr("href")
                if (debug) { console.log("LINK CANDIDATE: "+JSON.stringify(link, null, 2)) }
                if (! link.match("://")) {
                    link = scheme + '://' + host + link
                }
                include.forEach(element => {
                    let matcher = relativeLinks ? (host+element) : element
                    if (link.match(matcher)) {
                        link = link.replace(/#.+/,"").replace(/\?.+/,"")
                        if (debug) { console.log("LINK: "+JSON.stringify(link, null, 2)) }
                        // link is a page where we will gather article links.
                        links.push(link)
                        request(link, function (error, response, body) {
                            if (error) {
                                console.log(JSON.stringify(error))
                            } else {
                                console.log(body)
                            }                    
                        })
                    }                
                });
            })
        }
    });    
});



const db = require("../models");
const Sequelize = require("sequelize");

const Op = Sequelize.Op;

const utility = require("../utility/excludedWords")
const excludedWords = utility.excludedWords

function sortByCount(arr, objCounts) {
  // arr:       an array of scalar values
  // objCounts: an object where each property corresponds to an element in arr and has an integer value
  //
  // Return an array of the elements of arr, sorted by their corresponding values in objCounts
  //
  // Example
  //  arr = ['foo', 'bar', 'baz', 'foobar', 'barfoo']
  //  objCounts = {
  //    foo: 5,
  //    baz: 12,
  //    foobar: 114,
  //    bar: -50,
  //    barfoo: 13
  //  }
  // Output = [{'foobar':114},{},{},{}]

  if (wordCount[a] > wordCount[b])
    return -1;
  if (wordCount[a] < wordCount[b])
    return 1;
  return 0;

}

function processCounts(objArr) {
  let arrResult = []
  for (var p in objArr) {
    arrResult.push([p, objArr[p]])
  }
  return arrResult.sort(sortByCount)
}

function sortWords(obj, limit) {
  let retVal = [];
  Object.keys(obj).sort((a,b) => {
    return obj[b] - obj[a]
  }).forEach(e => {
    retVal.push( { key: e, value: obj[e] } )
  })
  return retVal.slice(0,limit)
}
function makeWordCloud(objArr) {
  let arrResult = []
  for (var p in objArr) {
    arrResult.push({
      key: p,
      value: objArr[p]
    })
  }
  return arrResult
}

function sortByCount(a, b) {
  if (a[1] > b[1])
    return -1;
  if (a[1] < b[1])
    return 1;
  return 0;
}

function incObj(obj, p) {
  obj[p] = (typeof obj[p] === "undefined") ? 1 : ++obj[p]
}

module.exports = function (app) {

  app.post("/api/query", function (req, res) {
    console.log(req.body)
    res.send(JSON.stringify(req.body.params, null, 2))
  })

  // POST route for getting all of the articles filtered by "query" which is in the JSON POST body.
  app.post("/api/articles", function (req, res) {
    console.log("REQUEST: " + JSON.stringify(req.body, null, 2))

    let where = {}
    
    let wclimit = req.body.wclimit?req.body.wclimit:100

    if (req.body.sources) {
      where.SourceId = req.body.sources
      // where.SourceId = { [Op.or]: req.body.sources }
    }

    if (req.body.authors) {
      where.author = req.body.authors
      // where.author = { [Op.or]: req.body.authors }
    }

    if (req.body.words) {
      // where.title = { [Op.like]: '%'+req.body.words+'%' }
      where.title = { [Op.regexp]: '.+'+req.body.words+'.+' }
    }

    console.log("WHERE str: " + JSON.stringify(where, null, 2) + "\nWHERE o: " + where)


    db.Article.findAll({
      where: where
    }).then(function (dbArticle) {
      // console.log("DBARTICLE: "+JSON.stringify(dbArticle, null, 2))
      let articles = []

      let wordsObj = {}
      let authorsObj = {}

      let sourcesObj = {}

      dbArticle.forEach(article => {
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Process Words
        // console.log(article.title)
        article.title.split(" ").forEach(function (word) {
          // console.log("WORD: "+word)

          //trim punctuation from word
          word = word.replace(/^[^a-z]+|[^a-z]+$/gi, "");
          if (excludedWords.indexOf(word.toLowerCase()) == -1 && word.match(/[a-z]+/i)) {
            incObj(wordsObj, word)
          }
        })

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Process Authors
        //  Split authors string on commas, dashes, "by", and "and"
        if (typeof article.author != 'undefined' && article.author != null) {
          // console.log("ORIGINAL AUTHOR: " + article.author)
          article.author.split(/ +(at|and|by) +/i).forEach(a => {
            a.split(/ +- +| *, */).forEach(author => {
              author = author.trim()
              if (author == "") {
                // Reject blank author
                return
              }
              if (author.toLowerCase() == article.SourceId.toLowerCase()) {
                //reject author that is the same as source
                return
              }
              if (!author.match(/[a-z]+/i)) {
                //reject author with no alpha characters
                return
              }
              if (["a", "at", "by", "and"].indexOf(author.toLowerCase()) != -1) {
                //reject bogus parts of speech authors
                return
              }
              // console.log("\tAUTHOR: " + author)
              incObj(authorsObj, author)
            })
          });
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Process Sources
        incObj(sourcesObj, article.SourceId)


        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Process article
        articles.push(article)

      });


      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // Response Object

      res.json({
        articles: articles,
        words:   processCounts(wordsObj),
        authors: processCounts(authorsObj),
        sources: processCounts(sourcesObj),
        wordcloud: sortWords(wordsObj, wclimit)
      });
    });
  });

  // Get route for retrieving a single article
  app.get("/api/articles/:id", function (req, res) {
    db.Article.findOne({
      where: {
        sourceId: req.params.id
      },
      include: [db.Source]
    }).then(function (dbArticle) {
      res.json(dbArticle);
    });
  });
};
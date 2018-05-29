const db = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const utility = require("../utility/excludedWords")
const excludedWords = utility.excludedWords
var wordCount = {}
var authorCount = {}

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
}

module.exports = function (app) {

  app.post("/api/query", function (req, res) {
    console.log(req.body)
    res.send(JSON.stringify(req.body.params, null, 2))
  })

  function wordSort(a, b) {
    if (wordCount[a] > wordCount[b])
      return -1;
    if (wordCount[a] < wordCount[b])
      return 1;
    return 0;
  }
  function authorSort(a, b) {
    if (authorCount[a] > authorCount[b])
      return -1;
    if (authorCount[a] < authorCount[b])
      return 1;
    return 0;
  }
  // GET route for getting all of the articles
  // Filtered by "query" which is in the JSON POST body.
  app.post("/api/articles", function (req, res) {
    var authors = {}
    var query = req.body
    console.log("QUERY: "+JSON.stringify(query, null, 2))
    // var query = {
    //   SourceId: {
    //     [Op.or]: ["cnn", "bbc-news"]
    //   },
    //   author: {
    //     [Op.or]: ["Laura Hudson",
    //     "Brian Stelter",
    //     "Analysis by Chris Cillizza, CNN Editor-at-large",
    //     "Rebecca Berg, CNN",
    //     "Alex Marquardt And Lawrence Crook Iii",
    //     "Analysis by Oren Liebermann, CNN",
    //     "macamilarinc",
    //     "Kaitlan Collins, Sarah Westwood, Pamela Brown and Juana Summers, CNN",
    //     "BBC News"
    //     ]
    //   }
    // };
    db.Article.findAll({
      where: query
    }).then(function (dbArticle) {
      // console.log("DBARTICLE: "+JSON.stringify(dbArticle, null, 2))
      var wordsObj = {}
      var tempWords = []
      var words = []

      var authorsObj = {}
      var tempAuthors = []
      var authors = []
      dbArticle.forEach(article => {
        //
        // Process Words
        // console.log(article.title)
        article.title.split(" ").forEach(function (word) {
          // console.log("WORD: "+word)
          if (excludedWords.indexOf(word.toLowerCase()) == -1 && word.match(/[a-z]+/i)) {
            wordCount[word] = (typeof wordCount[word] === "undefined") ? 1 : ++wordCount[word]
            wordsObj[word] = wordCount[word]
          }
        })

        //
        // Process Authors
        //  Split authors string on commas, dashes, "by", and "and"
        if (typeof article.author != 'undefined' && article.author != null) {
          console.log("ORIGINAL AUTHOR: "+article.author)
          article.author.split(/ +(at|and|by) +/i).forEach(a => {
          a.split(/ +- +| *, */).forEach(author => {
              author.trim()
              if (author == "") { return }
              if (author.toLowerCase() == article.SourceId.toLowerCase()) { return }
              if (! author.match(/[a-z]+/i)) { return }
              if (["a","at","by", "and"].indexOf(author.toLowerCase()) != -1) { return }
              console.log("\tAUTHOR: "+author)
              authorCount[author] = (typeof authorCount[author] === "undefined") ? 1 : ++authorCount[author]
              authorsObj[author] = authorCount[author]
            })
          });
          
        }



        //
        // Process Sources


      });
      for (var p in wordsObj) {
        tempWords.push(p)
      }
      tempWords.sort(wordSort)
      for (var i = 0; i<tempWords.length; i++) {
        // console.log(tempWords[i],wordCount[tempWords[i]])
        words.push({
          word: tempWords[i],
          count: wordCount[tempWords[i]]
        })
      }

      for (var p in authorsObj) {
        tempAuthors.push(p)
      }
      tempAuthors.sort(authorSort)
      for (var i = 0; i<tempAuthors.length; i++) {
        // console.log(tempauthors[i],authorCount[tempauthors[i]])
        authors.push({
          author: tempAuthors[i],
          count: authorCount[tempAuthors[i]]
        })
      }




      res.json({
        words: words,
        authors: authors
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
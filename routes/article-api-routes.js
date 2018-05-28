// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================

// Requiring our models
var db = require("../models");

// Routes
// =============================================================
module.exports = function(app) {

  // GET route for getting all of the articles
  app.get("/api/articles", function(req, res) {
    var query = {};
    if (req.query.source_id) {
      query.SourceId = req.query.source_id;
    }
    // Here we add an "include" property to our options in our findAll query
    // We set the value to an array of the models we want to include in a left outer join
    // In this case, just db.Source
    db.Article.findAll({
      where: query,
      include: [db.Source]
    }).then(function(dbArticle) {
      res.json(dbArticle);
    });
  });

  // Get route for retrieving a single article
  app.get("/api/articles/:id", function(req, res) {
    // Here we add an "include" property to our options in our findOne query
    // We set the value to an array of the models we want to include in a left outer join
    // In this case, just db.Source
    db.Article.findOne({
      where: {
        id: req.params.id
      },
      include: [db.Source]
    }).then(function(dbArticle) {
      res.json(dbArticle);
    });
  });

  // POST route for saving a new article
  app.article("/api/articles", function(req, res) {
    db.Article.create(req.body).then(function(dbArticle) {
      res.json(dbArticle);
    });
  });

  // DELETE route for deleting articles
  app.delete("/api/articles/:id", function(req, res) {
    db.Article.destroy({
      where: {
        id: req.params.id
      }
    }).then(function(dbArticle) {
      res.json(dbArticle);
    });
  });

  // PUT route for updating articles
  app.put("/api/articles", function(req, res) {
    db.Article.update(
      req.body,
      {
        where: {
          id: req.body.id
        }
      }).then(function(dbArticle) {
      res.json(dbArticle);
    });
  });
};

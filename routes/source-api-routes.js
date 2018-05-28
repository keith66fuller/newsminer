var db = require("../models");

module.exports = function(app) {
  app.get("/api/sources", function(req, res) {
    // Here we add an "include" property to our options in our findAll query
    // We set the value to an array of the models we want to include in a left outer join
    // In this case, just db.Article
      include: [db.Article]
    db.Source.findAll({
    }).then(function(dbSource) {
      res.json(dbSource);
    });
  });

  app.get("/api/sources/:id", function(req, res) {
    // Here we add an "include" property to our options in our findOne query
    // We set the value to an array of the models we want to include in a left outer join
    // In this case, just db.Article
    db.Source.findOne({
      where: {
        id: req.params.id
      },
      include: [db.Article]
    }).then(function(dbSource) {
      res.json(dbSource);
    });
  });

  app.post("/api/sources", function(req, res) {
    db.Source.create(req.body).then(function(dbSource) {
      res.json(dbSource);
    });
  });

  app.delete("/api/sources/:id", function(req, res) {
    db.Source.destroy({
      where: {
        id: req.params.id
      }
    }).then(function(dbSource) {
      res.json(dbSource);
    });
  });

};

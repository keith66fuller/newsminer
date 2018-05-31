var db = require("../models");

module.exports = function(app) {
  app.get("/api/sources", function(req, res) {
      include: [db.Article]
    db.Source.findAll({
    }).then(function(dbSources) {
      res.json(dbSources);
    });
  });

  app.get("/api/sources/:id", function(req, res) {
    db.Source.findOne({
      where: {
        id: req.params.id
      },
      include: [db.Article]
    }).then(function(dbSource) {
      res.json(dbSource);
    });
  });

};

var db = require("../models");

module.exports = function(app) {
  app.get("/source/:id", function(req, res) {
    console.log("Serving articles page for source "+req.params.id)
    db.Article.findAll({
        where: {
            SourceId: req.params.id
        }
    }).then(function(dbArticles) {
      res.render("articles", { articles: dbArticles } )
    });
  });

};

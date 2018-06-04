// *****************************************************************************
// Server.js - This file is the initial starting point for the Node/Express server.
//
// ******************************************************************************
// *** Dependencies
// ============================================================= 
var express = require("express");
var bodyParser = require("body-parser");

// Sets up the Express App
// =============================================================
var app = express();
var PORT = process.env.PORT || 8080;

// Requiring our models for syncing
var db = require("./models");

// Sets up the Express app to handle data parsing

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());

// Static directory
app.use(express.static("public"));
app.use('/bower_components',express.static("bower_components"));

// Handlebars
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Routes
// =============================================================
require("./routes/html-routes.js")(app);
require("./routes/source-api-routes.js")(app);
require("./routes/article-api-routes.js")(app);
require("./routes/user-api-routes.js")(app);
require("./routes/source-routes.js")(app);

// Start he API retrieval scheduler
const apiScheduler = require("./utility/api_scheduler");



// Syncing our sequelize models and then starting our Express app
// =============================================================
db.sequelize.sync().then(function() {
  app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
  });
  if (process.env.APISCHEDULER == "true") {
    apiScheduler();
  }
});





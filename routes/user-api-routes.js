const db = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = function (app) {

    app.get("/api/user/all", function (req, res) {
        db.User.findAll({}).then(function (dbUsers) {
            res.send(dbUsers)
        })
    })

    app.get("/api/user/:username", function (req, res) {
        db.User.findOne({
            where: {
                username: req.params.username
            }
        }).then(function (dbUser) {
            res.send(dbUser)
        })
    })

    app.post("/api/user", function (req, res) {
        db.User.create(req.body).then(function (dbUser) {
            res.json(dbUser)
        })
    })

    app.delete("/api/user/:username", function (req, res) {
        db.User.destroy({
            where: {
                id: req.params.username
            }
        }).then(function (dbUser) {
            res.json(dbUser);
        });
    });
}
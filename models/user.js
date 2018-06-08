module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define("User", {
    uid: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    username: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    sources: DataTypes.JSON,
    customExcludedWords: DataTypes.STRING,
    customInitialTimeRange: DataTypes.STRING,
    maxWords: DataTypes.STRING,
    maxArticles: DataTypes.STRING,
    maxAuthors: DataTypes.STRING
  }, {
    timestamps: false,
  });

  return User;
};
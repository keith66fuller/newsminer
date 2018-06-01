module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    sources: DataTypes.STRING,
    customExcludedWords: DataTypes.STRING,
    customInitialTimeRange: DataTypes.STRING,
    maxWords: DataTypes.STRING,
    maxArticles: DataTypes.STRING,
    maxAuthors: DataTypes.STRING
  }, {
    timestamps: false,
    indexes: [{
      unique: true,
      fields: ['email']
    }]
  });

  return User;
};
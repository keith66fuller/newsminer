module.exports = function (sequelize, DataTypes) {
  var Article = sequelize.define("Article", {
    source: DataTypes.STRING,
    author: DataTypes.STRING,
    title: DataTypes.STRING,
    url: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    urlToImage: DataTypes.STRING,
    publishedAt: DataTypes.DATE
  }, {
    timestamps: false
  });

  Article.associate = function(models) {
    Article.belongsTo(models.Source, {
      foreignKey: {
        allowNull: false
      }
    });
  };
  return Article;
};
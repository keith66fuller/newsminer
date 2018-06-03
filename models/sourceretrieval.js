module.exports = function (sequelize, DataTypes) {
  var SourceRetrieval = sequelize.define("SourceRetrieval", {
    source: {
      type: DataTypes.STRING
    },
    date: DataTypes.DATEONLY,
    totalArticles: {
      type: DataTypes.INTEGER
    },
    totalPages: {
      type: DataTypes.INTEGER
    },
    pagesRetrieved: {
      type: DataTypes.INTEGER
    },
    startAt: DataTypes.DATE
  }, {
    timestamps: true,
    indexes: [ { unique: true, fields: [ 'source', 'date' ] } ]
  });

  return SourceRetrieval;
};
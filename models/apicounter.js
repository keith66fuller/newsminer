module.exports = function (sequelize, DataTypes) {
  var ApiCounter = sequelize.define("ApiCounter", {
    date: {
      type: DataTypes.DATEONLY,
      primaryKey: true
    },
    counter: {
      type: DataTypes.INTEGER,
      default: 0
    },
  }, {
    timestamps: true
  });

  return ApiCounter;
};
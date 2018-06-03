module.exports = function (sequelize, DataTypes) {
  var ApiCounterD = sequelize.define("ApiCounterD", {
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

  return ApiCounterD;
};
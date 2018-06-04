module.exports = function (sequelize, DataTypes) {
  var ApiCounterH = sequelize.define("ApiCounterH", {
    hour: {
      type: DataTypes.TIME,
      primaryKey: true
    },
    counter: {
      type: DataTypes.INTEGER,
      default: 0
    },
  }, {
    timestamps: true
  });

  return ApiCounterH;
};
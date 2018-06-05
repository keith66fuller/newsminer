module.exports = function (sequelize, DataTypes) {
  var ApiCounterQ = sequelize.define("ApiCounterQ", {
    qPeriod: {
      type: DataTypes.DATE,
      primaryKey: true
    },
    counter: {
      type: DataTypes.INTEGER,
      default: 0
    },
    exceeded: {
      type: DataTypes.BOOLEAN,
      default: false
    }
  }, {
    timestamps: true
  });

  return ApiCounterQ;
};
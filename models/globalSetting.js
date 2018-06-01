module.exports = function (sequelize, DataTypes) {
  var globalSetting = sequelize.define("globalSetting", {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    value: DataTypes.STRING
  }, {
    timestamps: false
  });

  return globalSetting;
};
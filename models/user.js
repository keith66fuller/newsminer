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
    password: DataTypes.STRING
  }, {
    timestamps: false,
    indexes: [{
      unique: true,
      fields: ['email']
    }]
  });

  User.associate = function(models) {
    User.hasMany(models.Source, {
      onDelete: "cascade"
    });
  };

  return User;
};
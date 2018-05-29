module.exports = function (sequelize, DataTypes) {
    var Source = sequelize.define("Source", {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        name: DataTypes.STRING
    }, {
        timestamps: false
    });

    Source.associate = function(models) {
        Source.hasMany(models.Article, {
          onDelete: "cascade"
        });
      };
      
      return Source;
};
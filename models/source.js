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

    return Source;
};
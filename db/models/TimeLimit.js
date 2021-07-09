'use strict';
module.exports = (sequelize, DataTypes) => {
  const TimeLimit = sequelize.define(
    'TimeLimit',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      value: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: false,
      paranoid: true,
    }
  );

  TimeLimit.associate = function (models) {
    TimeLimit.hasMany(models.Question, {
      foreignKey: 'timeLimitId',
      target: 'id',
      onDelete: 'cascade',
    });
  };

  return TimeLimit;
};

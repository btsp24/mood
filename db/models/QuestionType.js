'use strict';
module.exports = (sequelize, DataTypes) => {
  const QuestionType = sequelize.define(
    'QuestionType',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      value: {
        type: DataTypes.STRING(20),
      },
    },
    {
      timestamps: false,
      paranoid: true,
    }
  );

  QuestionType.associate = function (models) {
    QuestionType.hasMany(models.Question, {
      foreignKey: 'questionTypeId',
      target: 'id',
      onDelete: 'cascade',
    });
  };

  return QuestionType;
};

'use strict';
module.exports = (sequelize, DataTypes) => {
  const Answer = sequelize.define(
    'Answer',
    {
      questionId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(75),
      },
      isCorrect: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );

  Answer.associate = function (models) {
    Answer.belongsTo(models.Question, {
      foreignKey: 'questionId',
      target: 'id',
    });

    Answer.hasMany(models.PlayerAnswer, {
      foreignKey: 'questionId',
      target: 'questionId',
    });

    Answer.hasMany(models.PlayerAnswer, {
      foreignKey: 'answerId',
      target: 'id',
    });
  };

  return Answer;
};

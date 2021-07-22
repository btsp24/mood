'use strict';
module.exports = (sequelize, DataTypes) => {
  const Answer = sequelize.define(
    'Answer',
    {
      questionId: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      text: {
        type: DataTypes.STRING(75),
      },
      answerOrder: {
        type: DataTypes.INTEGER,
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

    Answer.belongsToMany(models.Player, {
      foreignKey: 'answerId',
      target: 'id',
      through: 'PlayerAnswer',
      constraints: false,
    });
  };

  return Answer;
};

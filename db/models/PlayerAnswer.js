'use strict';
module.exports = (sequelize, DataTypes) => {
  const PlayerAnswer = sequelize.define(
    'PlayerAnswer',
    {
      playerId: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      gameId: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      questionId: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      answerId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      questionScore: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );

  PlayerAnswer.associate = function (models) {
    PlayerAnswer.belongsTo(models.Answer, {
      foreignKey: 'answerId',
      target: 'id',
    });

    PlayerAnswer.belongsTo(models.Question, {
      foreignKey: 'questionId',
      target: 'id',
    });

    PlayerAnswer.belongsTo(models.Player, {
      foreignKey: 'playerId',
      target: 'playerId',
    });

    PlayerAnswer.belongsTo(models.Player, {
      foreignKey: 'gameId',
      target: 'gameId',
    });
  };

  return PlayerAnswer;
};

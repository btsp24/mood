'use strict';
module.exports = (sequelize, DataTypes) => {
  const PlayerAnswer = sequelize.define(
    'PlayerAnswer',
    {
      playerId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      questionId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      answerId: {
        type: DataTypes.UUID,
        allowNull: true,
        defaultValue: DataTypes.UUIDV4,
      },
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );

  PlayerAnswer.associate = function (models) {
    PlayerAnswer.belongsTo(models.PlayerQuestion, {
      foreignKey: 'playerId',
      target: 'playerId',
      constraints: false,
    });

    PlayerAnswer.belongsTo(models.PlayerQuestion, {
      foreignKey: 'questionId',
      target: 'questionId',
      constraints: false,
    });

    PlayerAnswer.belongsTo(models.Player, {
      foreignKey: 'playerId',
      target: 'id',
      constraints: false,
    });

    PlayerAnswer.belongsTo(models.Answer, {
      foreignKey: 'answerId',
      target: 'id',
      constraints: false,
    });
  };

  return PlayerAnswer;
};

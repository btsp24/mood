'use strict';
module.exports = (sequelize, DataTypes) => {
  const PlayerQuestion = sequelize.define(
    'PlayerQuestion',
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
      questionScore: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );

  PlayerQuestion.associate = function (models) {
    PlayerQuestion.belongsTo(models.Player, {
      foreignKey: 'playerId',
      target: 'id',
      constraints: false,
    });

    PlayerQuestion.belongsTo(models.Question, {
      foreignKey: 'questionId',
      target: 'id',
      constraints: false,
    });
  };

  return PlayerQuestion;
};

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
    /* empty */
    /*     PlayerQuestion.hasMany(models.PlayerAnswer, {
      foreignKey: 'questionId',
      target: 'questionId',
    });

    PlayerQuestion.hasMany(models.PlayerAnswer, {
      foreignKey: 'playerId',
      target: 'playerId',
    }); */
  };

  return PlayerQuestion;
};

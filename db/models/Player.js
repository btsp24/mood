'use strict';
module.exports = (sequelize, DataTypes) => {
  const Player = sequelize.define(
    'Player',
    {
      gameId: {
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
      nickName: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      gameScore: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );

  Player.associate = function (models) {
    Player.belongsTo(models.Game, {
      foreignKey: 'gameId',
      target: 'id',
    });

    Player.belongsToMany(models.Question, {
      foreignKey: 'playerId',
      target: 'id',
      through: 'PlayerQuestion',
      constraints: false,
    });

    Player.belongsToMany(models.Answer, {
      foreignKey: 'playerId',
      target: 'id',
      through: 'PlayerAnswer',
      constraints: false,
    });

    Player.hasMany(models.PlayerQuestion, {
      foreignKey: 'playerId',
      target: 'id',
      constraints: false,
    });

    Player.hasMany(models.PlayerAnswer, {
      foreignKey: 'playerId',
      target: 'id',
      constraints: false,
    });
  };

  return Player;
};

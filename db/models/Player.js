'use strict';
module.exports = (sequelize, DataTypes) => {
  const Player = sequelize.define(
    'Player',
    {
      gameId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      playerId: {
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
      foreignKey: {
        name:'gameId',
        type: DataTypes.UUID
      },
      target: 'id',
    });

    Player.hasMany(models.PlayerAnswer, {
      foreignKey: {
        name: 'playerId',
        type: DataTypes.UUID
      },
      target: 'playerId',
    });

    Player.hasMany(models.PlayerAnswer, {
      foreignKey: {
        name: 'gameId',
        type: DataTypes.UUID
      },
      target: 'gameId',
    });
  };

  return Player;
};

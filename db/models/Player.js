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
      foreignKey: 'gameId',
      target: 'id',
    });

    Player.hasMany(models.PlayerAnswer, {
      foreignKey: 'playerId',
      target: 'playerId',
      onDelete: 'cascade',
    });

    Player.hasMany(models.PlayerAnswer, {
      foreignKey: 'gameId',
      target: 'gameId',
      onDelete: 'cascade',
    });
  };

  return Player;
};

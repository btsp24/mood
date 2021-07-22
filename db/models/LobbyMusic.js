'use strict';
module.exports = (sequelize, DataTypes) => {
  const LobbyMusic = sequelize.define(
    'LobbyMusic',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(40),
      },
      audioURL: {
        type: DataTypes.STRING(2000),
      },
      audioCredit: {
        type: DataTypes.STRING(1000),
      },
    },
    {
      timestamps: false,
      paranoid: true,
    }
  );

  LobbyMusic.associate = function (models) {
    LobbyMusic.hasMany(models.Quiz, {
      foreignKey: 'lobbyMusicId',
      target: 'id',
    });
  };

  return LobbyMusic;
};

'use strict';
module.exports = (sequelize, DataTypes) => {
  const Quiz = sequelize.define(
    'Quiz',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      title: {
        type: DataTypes.STRING(95),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(280),
      },
      composerId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      isVisible: {
        type: DataTypes.BOOLEAN,
      },
      isDraft: {
        type: DataTypes.BOOLEAN,
      },
      lobbyMusicId: {
        type: DataTypes.INTEGER,
      },
      imgURL: {
        type: DataTypes.STRING(2000),
      },
      imgAltText: {
        type: DataTypes.STRING(100),
      },
      imgCredit: {
        type: DataTypes.STRING(1000),
      },
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );

  Quiz.associate = function (models) {
    Quiz.belongsTo(models.User, {
      foreignKey: 'composerId',
      target: 'id',
    });

    Quiz.belongsTo(models.LobbyMusic, {
      foreignKey: 'lobbyMusicId',
      target: 'id',
    });

    Quiz.hasMany(models.Game, {
      foreignKey: 'quizId',
      target: 'id',
    });

    Quiz.hasMany(models.Question, {
      foreignKey: 'quizId',
      target: 'id',
    });
  };

  return Quiz;
};

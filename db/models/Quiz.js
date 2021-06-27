'use strict';
const Question = require('./Question');
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
      imgURL: {
        type: DataTypes.STRING(2000),
      },
      imgAltText: {
        type: DataTypes.STRING(100),
      },
      imgCredit: {
        type: DataTypes.STRING(1000),
      },
      lobbyVideo: {
        type: DataTypes.STRING,
      },
      lobbyMusicId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      isDraft: {
        type: DataTypes.BOOLEAN,
      },
      /* questionCount: {
        type: DataTypes.VIRTUAL,
        get() {
          return `${this.getQuestionCount().questionCount}`;
        },
      }, */
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );
  /*   Quiz.getQuestionCount = async function () {
    return await Question.findAll({
      where: {
        quizId: this.id,
      },
      attributes: [[sequelize.fn('COUNT', sequelize.col('id')), 'questionCount']],
      group: ['quizId'],
    });
  }; */

  Quiz.associate = function (models) {
    Quiz.belongsTo(models.User, {
      foreignKey: {
        name: 'composerId',
        type: DataTypes.UUID,
      },
      target: 'id',
    });

    Quiz.belongsTo(models.LobbyMusic, {
      foreignKey: 'lobbyMusicId',
      target: 'id',
    });

    Quiz.hasMany(models.Game, {
      foreignKey: {
        name: 'quizId',
        type: DataTypes.UUID,
      },
      target: 'id',
    });

    Quiz.hasMany(models.Question, {
      foreignKey: {
        name: 'quizId',
        type: DataTypes.UUID,
      },
      target: 'id',
    });
  };

  return Quiz;
};

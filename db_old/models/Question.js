'use strict';
module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define(
    'Question',
    {
      quizId: {
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
      questionTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      text: {
        type: DataTypes.STRING(120),
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
      timeLimitId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      questionOrder: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );

  Question.associate = function (models) {
    Question.hasMany(models.Answer, {
      foreignKey: 'questionId',
      target: 'id',
    });

    Question.belongsTo(models.QuestionType, {
      foreignKey: 'questionTypeId',
      target: 'id',
    });

    Question.belongsTo(models.TimeLimit, {
      foreignKey: 'timeLimitId',
      target: 'id',
    });

    Question.belongsTo(models.Quiz, {
      foreignKey: 'quizId',
      target: 'id',
    });
  };

  return Question;
};
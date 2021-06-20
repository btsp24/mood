'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      email: {
        type: DataTypes.STRING(254),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      userName: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(30),
      },
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );

  User.associate = function (models) {
    User.hasMany(models.Game, {
      foreignKey: 'hostedBy',
      target: 'id',
    });

    User.hasMany(models.Quiz, {
      foreignKey: 'composerId',
      target: 'id',
    });
  };

  return User;
};

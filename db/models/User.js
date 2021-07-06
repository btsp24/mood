const bCrypt = require('bcryptjs');
const bcrypt = require('bcryptjs/dist/bcrypt');
('use strict');
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
        type: DataTypes.STRING(30),
        allowNull: false,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      hooks: {
        beforeCreate: async function (user) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        },
      },
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

  User.prototype.validPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  return User;
};

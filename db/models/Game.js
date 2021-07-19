'use strict';
module.exports = (sequelize, DataTypes) => {
const Game = sequelize.define(
'Game', { 
   id: {
      type: DataTypes.UUID, 
      primaryKey:true, 
      allowNull:false,
      defaultValue: DataTypes.UUIDV4
   }, 
   quizId: {
      type: DataTypes.UUID, 
      allowNull:false,
      defaultValue: DataTypes.UUIDV4
   }, 
   hostedBy: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
   }, 
   playedAt: {
      type: DataTypes.DATE
   }, 
   PIN: {
      type: DataTypes.INTEGER
   }
}, { 
  timestamps: true,
  paranoid: true
  }
);

Game.associate = function(models) {
Game.belongsTo(models.User, {
 foreignKey: 'hostedBy',
 target: 'id'
});

Game.hasMany(models.Player, {
 foreignKey: 'gameId',
 target: 'id'
});

Game.belongsTo(models.Quiz, {
 foreignKey: 'quizId',
 target: 'id'
});


}

return Game;
};

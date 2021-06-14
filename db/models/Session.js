'use strict';
module.exports = (sequelize, DataTypes) => {
const Session = sequelize.define(
'Session', { 
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
      allowNull:false,
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

Session.associate = function(models) {
Session.belongsTo(models.User, {
 foreignKey: 'hostedBy',
 target: 'id'
});

Session.hasMany(models.Player, {
 foreignKey: 'sessionId',
 target: 'id'
});

Session.belongsTo(models.Quiz, {
 foreignKey: 'quizId',
 target: 'id'
});


}

return Session;
};

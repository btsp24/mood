'use strict';
module.exports = (sequelize, DataTypes) => {
const PlayerAnswer = sequelize.define(
'PlayerAnswer', { 
   playerId: {
      type: DataTypes.UUID, 
      primaryKey:true,
      defaultValue: DataTypes.UUIDV4
   }, 
   answerId: {
      type: DataTypes.UUID, 
      primaryKey:true,
      defaultValue: DataTypes.UUIDV4
   }, 
   questionScore: {
      type: DataTypes.INTEGER
   }
}, { 
  timestamps: true,
  paranoid: true
  }
);

return PlayerAnswer;
};

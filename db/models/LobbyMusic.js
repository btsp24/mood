'use strict';
module.exports = (sequelize, DataTypes) => {
const LobbyMusic = sequelize.define(
'LobbyMusic', { 
   id: {
      type: DataTypes.INTEGER, 
      primaryKey:true, 
      allowNull:false, 
      unique:'DataTypes.UUIDV4'
   }, 
   audioURL: {
      type: DataTypes.STRING
   }
}, { 
  timestamps: false,
  paranoid: true
  }
);

LobbyMusic.associate = function(models) {
LobbyMusic.hasMany(models.Quiz, {
 foreignKey: 'lobbyMusicId',
 target: 'id'
});


}

return LobbyMusic;
};

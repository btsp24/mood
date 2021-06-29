class Players {
  constructor() {
    this.players = [];
  }

  addPlayer(hostId, playerId, name, gameData) {
    const player = { hostId, playerId, name, gameData };
    this.players.push(player);
    return player;
  }

  removePlayer(playerId) {
    const player = this.getPlayer(playerId);

    if (player) {
      this.players = this.players.filter(player => player.playerId !== playerId);
    }
    return player;
  }

  getPlayer(playerId) {
    return this.players.filter(player => player.playerId === playerId)[0];
  }

  getPlayers(hostId) {
    return this.players.filter(player => player.hostId === hostId);
  }
}

module.exports = { Players };

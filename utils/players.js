class Players {
  constructor() {
    this.players = [];
  }

  addPlayer(hostId, playerId, name, values) {
    const player = { hostId, playerId, name, values };
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

  count() {
    return this.players.length;
  }
}

module.exports = { Players };

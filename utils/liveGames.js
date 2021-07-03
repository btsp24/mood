class LiveGames {
  constructor() {
    this.games = [];
  }

  addGame(pin, hostId, gameLive, values) {
    const game = { pin, hostId, gameLive, values };
    this.games.push(game);
    return game;
  }

  removeGame(hostId) {
    const game = this.getGame(hostId);

    if (game) {
      this.games = this.games.filter(game => game.hostId !== hostId);
    }
    return game;
  }

  getGame(hostId) {
    return this.games.filter(game => game.hostId === hostId)[0];
  }
}

module.exports = { LiveGames };

// Original Version https://github.com/1Computer1/kaado/blob/master/src/games/PokerGame.js
const Discord = require("discord.js");
const Deck = require("./poker/deck.js");
const { Hand } = require("pokersolver");

module.exports = (client) => {
  class PokerUtil {
    constructor() {
      this.maxPlayers = 8;
    }
  }

  client.pokerUtil = new PokerUtil();
};
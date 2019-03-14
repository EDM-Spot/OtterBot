// Original Version https://github.com/1Computer1/kaado/blob/master/src/games/PokerGame.js
const Discord = require("discord.js");
const Deck = require("./poker_utils/deck.js");
const { Hand } = require("pokersolver");

module.exports = (client) => {
  class PokerUtil {
    constructor() {
      this.deck = new Deck().fill().shuffle();

      this.players = [];
      this.startingPlayers = [];
      this.started = false;
      this.minPlayers = 2,
      this.maxPlayers = 8,

      this.currentRound = 0;
      this.tableCards = [];
      this.tableMoney = 0;

      this.currentTurn = 0;
      this.turnTimer = null;
      this.playerCards = new Map();
      this.playerBalances = new Map();
      this.allInPlayers = new Set();

      this.totalBets = new Map();
      this.roundBets = new Map();
      this.previousBets = [];

      this.channel = "485927387079639051";
    }
  }

  client.pokerUtil = new PokerUtil();
};
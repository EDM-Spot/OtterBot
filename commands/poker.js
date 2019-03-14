// Original Version https://github.com/1Computer1/kaado/blob/master/src/games/PokerGame.js
const Command = require("../base/Command.js");
const { isNil, isNaN } = require("lodash");
const moment = require("moment");
require("moment-timer");

class Poker extends Command {
  constructor(client) {
    super(client, {
      name: "poker",
      description: "Start Poker Game",
      usage: "['start', 'join', 'bet', 'check', 'fold', 'skip', 'allin']",
      permLevel: "Bot Admin"
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    try {
      message.delete();
      
      if (!args.length) { return; }

      const params = ["start", "join", "bet", "check", "fold", "skip", "allin"];
      const param = `${args.shift()}`.toLowerCase();

      if (!params.includes(param)) {
        return false;
      }

      const price = 20;

      const userDB = await this.client.db.models.users.findOne({
        where: {
          discord: message.author.id,
        },
      });

      if (isNil(userDB)) {
        return message.reply("You need to link your account first! Read how here: http://prntscr.com/ls539m");
      }

      const [inst] = await this.client.db.models.users.findOrCreate({ where: { id: userDB.get("id") }, defaults: { id: userDB.get("id") } });

      const userID = userDB.get("discord");

      switch (param) {
        case "start": {
          const cooldown = await this.client.redis.getCommandOnCoolDown("discord", "poker@play", "perUse");

          if (cooldown != -2) {
            //return message.reply("Hold on! Poker runned " + Math.floor((3600 - cooldown) / 60) + " minute(s) ago, you must wait " + Math.ceil(cooldown / 60) + " minute(s) to play again.");
          }

          if (isNaN(price) || price < 1 || price > 20) {
            return false;
          }

          message.reply([
            "A new poker game has been created.",
            `A maximum of ${this.client.pokerUtil.maxPlayers} players can play.`,
            "The game will start in 5 minutes.",
            "Join the game with `-poker join`!"
          ]);

          this.timer = new moment.duration(5, "minutes").timer({loop: false, start: true}, async () => {
            this.client.pokerUtil.started = true;
            this.client.pokerUtil.startGame();
          });

          await this.client.redis.placeCommandOnCooldown("discord", "poker@play", "perUse", 3600);

          return true;
        }
        case "join": {
          if (this.client.pokerUtil.started) {
            return message.reply("Poker already started!");
          }

          if (this.client.pokerUtil.startingPlayers.includes(userID)) return true;

          const props = inst.get("props");

          if (props < price) {
            return message.reply("You don't have enough props.");
          }

          await inst.decrement("props", { by: 0 });

          this.client.pokerUtil.players.push(userID);
          this.client.pokerUtil.startingPlayers.push(userID);
          await this.client.guilds.get("485173051432894489").members.get(message.author.id).addRole("512635547320188928").catch(console.error);

          return message.reply("Joined Poker.");
        }
        case "bet": {
          if (!this.client.pokerUtil.started) {
            return message.reply("Poker is not running!");
          }
          
          const amount = parseInt(args.pop(), 10);

          if (isNaN(amount)) {
            return false;
          }

          if (this.client.pokerUtil.playerBalances.get(this.client.pokerUtil.currentPlayer.id) + (this.client.pokerUtil.roundBets.get(this.client.pokerUtil.currentPlayer.id) || 0) - amount < 0) {
            return message.reply("You do not have enough Props to bet!");
          }

          if (amount !== this.client.pokerUtil.previousBet && amount < this.client.pokerUtil.previousBet * 2) {
            return message.reply(`You need to bet equal or at least twice the previous bet of **${this.client.pokerUtil.previousBet}** Props`);
          }

          return this.client.pokerUtil.bet(amount);
        }
        case "check": {
          if (!this.client.pokerUtil.started) {
            return message.reply("Poker is not running!");
          }
          
          if (this.client.pokerUtil.previousBet) {
            return message.reply("You can only bet, fold, or go all-in at this point!");
          }

          return this.client.pokerUtil.check();
        }
        case "fold": {
          if (!this.client.pokerUtil.started) {
            return message.reply("Poker is not running!");
          }
          
          return this.client.pokerUtil.fold();
        }
        case "skip": {
          if (!this.client.pokerUtil.started) {
            return message.reply("Poker is not running!");
          }
          
          if (!this.client.pokerUtil.allInPlayers.has(this.client.pokerUtil.currentPlayer.id)) {
            return message.reply("You cannot skip unless you have gone all-in.");
          }

          return this.client.pokerUtil.skip();
        }
        case "allin": {
          if (!this.client.pokerUtil.started) {
            return message.reply("Poker is not running!");
          }
          
          return this.client.pokerUtil.allIn();
        }
        default:
          return false;
      }
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Poker;

// Original Version https://github.com/1Computer1/kaado/blob/master/src/commands/games/poker.js
const Command = require("../base/Command.js");
const { isNil, isNaN, isObject } = require("lodash");
const { ROLE } = require("miniplug");
const moment = require("moment");
require("moment-timer");

class Uno extends Command {
  constructor(client) {
    super(client, {
      name: "uno",
      description: "Start a Uno Game",
      usage: "['start', 'join', 'table', 'play <colour> <value>', 'pick', 'hand', 'reset'. 'exit']"
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    try {
      //message.delete();

      if (!args.length) { return; }

      const params = ["start", "join", "table", "play", "pick", "hand", "reset", "exit"];
      const param = `${args.shift()}`.toLowerCase();

      if (!params.includes(param)) {
        return message.reply(`Invalid Param: ${param}`);
      }

      const price = 0;

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
          const cooldown = await this.client.redis.getCommandOnCoolDown("discord", "uno@play", "perUse");

          if (cooldown != -2) {
            return message.reply("Hold on! Uno runned " + Math.floor((3600 - cooldown) / 60) + " minute(s) ago, you must wait " + Math.ceil(cooldown / 60) + " minute(s) to play again.");
          }

          if (isNaN(price)) {
            return false;
          }

          if (await this.client.roulette.check() || await this.client.russianRoulette.check() || this.client.triviaUtil.check() || this.client.unoUtil.checkGame() || this.client.unoUtil.checkGame()) {
            return message.reply("There's a Game running already!");
          }

          let startMessage = `A new Uno Game has been created. Entry Fee: ${price} Prop. \n`;
          startMessage += "You will be warned 30 seconds before it starts. \n";
          startMessage += `A maximum of ${this.client.unoUtil.maxPlayers} players can play. \n`;
          startMessage += "The game will start in 1 minute. Join the game with `-uno join` \n";
          startMessage += "Good Luck!";
          message.channel.send(startMessage);

          this.client.plug.chat("Discord Uno Game will start in 1 minute in channel #" + message.channel.name + "!");
          this.client.plug.chat("Join EDM Spot's Official Discord: https://discord.gg/QvvD8AC");

          this.client.unoUtil.running = true;

          //new moment.duration(270000, "milliseconds").timer({loop: false, start: true}, async () => {
          //message.channel.send("<@&512635547320188928> 30 Seconds left until start!");
          //});

          new moment.duration(1, "minutes").timer({ loop: false, start: true }, async () => {
            if (this.client.unoUtil.players.size < this.client.unoUtil.minPlayers) {
              message.channel.send(`Not enough players (${this.client.unoUtil.minPlayers} required) to play this game.`);
              await this.client.unoUtil.end();
            } else {
              await this.client.unoUtil.start();
            }
          });

          await this.client.redis.placeCommandOnCooldown("discord", "uno@play", "perUse", 3600);

          return true;
        }
        case "join": {
          if (!this.client.unoUtil.checkGame() && !this.client.unoUtil.started) {
            return message.reply("Uno is not running!");
          } else if (this.client.unoUtil.players.size >= this.client.unoUtil.maxPlayers) {
            return message.reply("The game is Full!");
          }

          const props = inst.get("props");

          if (props < price) {
            return message.reply("You don't have enough props.");
          }

          await inst.decrement("props", { by: price });
          await this.client.db.models.users.increment("props", { by: price, where: { id: "40333310" } });

          this.client.unoUtil.addPlayer(message.author);
          await this.client.guilds.cache.get("485173051432894489").members.cache.get(message.author.id).roles.add("512635547320188928").catch(console.error);

          return message.reply("Joined Uno.");
        }
        // case "bet": {
        //   if (!this.client.unoUtil.started) {
        //     return message.reply("Poker is not running!");
        //   }

        //   const amount = parseInt(args.pop(), 10);

        //   if (isNaN(amount)) {
        //     return false;
        //   }

        //   if (this.client.unoUtil.currentPlayer.id != userID) {
        //     return message.reply("It's not your turn!");
        //   } else if (this.client.unoUtil.allInPlayers.has(this.client.unoUtil.currentPlayer.id)) {
        //     return message.reply("You gone all-in! You can only skip at this point!");
        //   } else if (this.client.unoUtil.playerBalances.get(this.client.unoUtil.currentPlayer.id) + (this.client.unoUtil.roundBets.get(this.client.unoUtil.currentPlayer.id) || 0) - amount < 0) {
        //     return message.reply("You do not have enough Props to bet!");
        //   } else if (amount !== this.client.unoUtil.previousBet && amount < this.client.unoUtil.previousBet * 2) {
        //     return message.reply(`You need to bet equal or at least twice the previous bet of **${this.client.unoUtil.previousBet}** Props`);
        //   }

        //   return this.client.unoUtil.bet(amount);
        // }
        // case "call": {
        //   if (!this.client.unoUtil.started) {
        //     return message.reply("Poker is not running!");
        //   }

        //   const amount = this.client.unoUtil.previousBet;

        //   if (isNaN(amount)) {
        //     return false;
        //   }

        //   if (this.client.unoUtil.currentPlayer.id != userID) {
        //     return message.reply("It's not your turn!");
        //   } else if (this.client.unoUtil.allInPlayers.has(this.client.unoUtil.currentPlayer.id)) {
        //     return message.reply("You gone all-in! You can only skip at this point!");
        //   } else if (this.client.unoUtil.playerBalances.get(this.client.unoUtil.currentPlayer.id) + (this.client.unoUtil.roundBets.get(this.client.unoUtil.currentPlayer.id) || 0) - amount < 0) {
        //     return message.reply("You do not have enough Props to bet!");
        //   } else if (amount !== this.client.unoUtil.previousBet && amount < this.client.unoUtil.previousBet * 2) {
        //     return message.reply(`You need to bet equal or at least twice the previous bet of **${this.client.unoUtil.previousBet}** Props`);
        //   }

        //   return this.client.unoUtil.bet(amount);
        // }
        // case "check": {
        //   if (!this.client.unoUtil.started) {
        //     return message.reply("Poker is not running!");
        //   }

        //   if (this.client.unoUtil.currentPlayer.id != userID) {
        //     return message.reply("It's not your turn!");
        //   } else if (this.client.unoUtil.allInPlayers.has(this.client.unoUtil.currentPlayer.id)) {
        //     return message.reply("You gone all-in! You can only skip at this point!");
        //   } else if (this.client.unoUtil.previousBet) {
        //     return message.reply("You can only bet, fold, or go all-in at this point!");
        //   }

        //   return this.client.unoUtil.check();
        // }
        // case "fold": {
        //   if (!this.client.unoUtil.started) {
        //     return message.reply("Poker is not running!");
        //   } else if (this.client.unoUtil.currentPlayer.id != userID) {
        //     return message.reply("It's not your turn!");
        //   }

        //   return this.client.unoUtil.fold();
        // }
        // case "skip": {
        //   if (!this.client.unoUtil.started) {
        //     return message.reply("Poker is not running!");
        //   } else if (this.client.unoUtil.currentPlayer.id != userID) {
        //     return message.reply("It's not your turn!");
        //   } else if (!this.client.unoUtil.allInPlayers.has(this.client.unoUtil.currentPlayer.id)) {
        //     return message.reply("You cannot skip unless you have gone all-in.");
        //   }

        //   return this.client.unoUtil.skip();
        // }
        // case "allin": {
        //   if (!this.client.unoUtil.started) {
        //     return message.reply("Poker is not running!");
        //   } else if (this.client.unoUtil.currentPlayer.id != userID) {
        //     return message.reply("It's not your turn!");
        //   } else if (this.client.unoUtil.allInPlayers.has(this.client.unoUtil.currentPlayer.id)) {
        //     return message.reply("You gone all-in! You can only skip at this point!");
        //   }

        //   const props = inst.get("props");

        //   if (props == 0) {
        //     message.reply("You have 0 props.");
        //     return this.client.unoUtil.exit();
        //   }

        //   return this.client.unoUtil.allIn();
        // }
        // case "exit": {
        //   if (!this.client.unoUtil.checkGame() && !this.client.unoUtil.started) {
        //     return message.reply("Poker is not running!");
        //   } else if (!this.client.unoUtil.started) {
        //     this.client.unoUtil.startingPlayers.delete(userID);

        //     await this.client.guilds.cache.get("485173051432894489").members.cache.get(userID).roles.remove("512635547320188928").catch(console.warn);

        //     return message.reply("You left the table!");
        //   }

        //   if (this.client.unoUtil.currentPlayer.id != userID) {
        //     return message.reply("It's not your turn!");
        //   }

        //   return this.client.unoUtil.exit();
        // }
        // case "reset": {
        //   const user = this.client.plug.user(userDB.get("id"));

        //   if (!isObject(user) || await this.client.utils.getRole(user) <= ROLE.MANAGER) return false;

        //   await this.client.redis.removeCommandFromCoolDown("discord", "poker@play", "perUse");

        //   return message.reply("The cooldown for poker has been reset!");
        // }
        default:
          return false;
      }
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Uno;

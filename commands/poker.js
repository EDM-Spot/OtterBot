// Original Version https://github.com/1Computer1/kaado/blob/master/src/commands/games/poker.js
const Command = require("../base/Command.js");
const { isNil, isNaN, isObject } = require("lodash");
const { ROOM_ROLE } = require("plugapi");
const moment = require("moment");
require("moment-timer");

class Poker extends Command {
  constructor(client) {
    super(client, {
      name: "p",
      description: "Start a Texas Hold'em Poker Game",
      usage: "['start', 'join', 'bet', 'check', 'fold', 'skip', 'allin']"
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    try {
      message.delete();
      
      if (!args.length) { return; }

      const params = ["start", "join", "bet", "check", "fold", "skip", "allin", "reset", "exit"];
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
          const cooldown = await this.client.redis.getCommandOnCoolDown("discord", "poker@play", "perUse");

          if (cooldown != -2) {
            return message.reply("Hold on! Poker runned " + Math.floor((3600 - cooldown) / 60) + " minute(s) ago, you must wait " + Math.ceil(cooldown / 60) + " minute(s) to play again.");
          }

          if (isNaN(price)) {
            return false;
          }

          if (await this.client.roulette.check() || await this.client.russianRoulette.check() || this.client.triviaUtil.check() || this.client.pokerUtil.checkGame()) {
            return message.reply("There's a Game running already!");
          }

          let startMessage = `A new Texas Hold'em Poker Game has been created. Entry Fee: ${price} Prop. \n`;
          startMessage += "You will be warned 30 seconds before it starts. \n";
          startMessage += `A maximum of ${this.client.pokerUtil.maxPlayers} players can play. \n`;
          startMessage += "The game will start in 1 minute. Join the game with `-p join` \n";
          startMessage += "Good Luck!";
          message.channel.send(startMessage);

          await this.client.plug.sendChat("Discord Texas Hold'em Poker will start in 1 minute in channel #" + message.channel.name + "!");
          await this.client.plug.sendChat("Join EDM Spot's Official Discord: https://discord.gg/GETaTWm");

          this.client.pokerUtil.running = true;

          //new moment.duration(270000, "milliseconds").timer({loop: false, start: true}, async () => {
            //message.channel.send("<@&512635547320188928> 30 Seconds left until start!");
          //});

          new moment.duration(1, "minutes").timer({loop: false, start: true}, async () => {
            if (this.client.pokerUtil.startingPlayers.size < this.client.pokerUtil.minPlayers) {
              message.channel.send(`Not enough players (${this.client.pokerUtil.minPlayers} required) to play this game.`);
              await this.client.pokerUtil.end();
            } else {
              this.client.pokerUtil.started = true;
              await this.client.pokerUtil.startGame();
            }
          });

          await this.client.redis.placeCommandOnCooldown("discord", "poker@play", "perUse", 3600);

          return true;
        }
        case "join": {
          if (!this.client.pokerUtil.checkGame() && !this.client.pokerUtil.started) {
            return message.reply("Poker is not running!");
          } else if (this.client.pokerUtil.startingPlayers.size >= this.client.pokerUtil.maxPlayers) {
            return message.reply("The game is Full!");
          }

          if (this.client.pokerUtil.startingPlayers.has(userID)) return true;

          const props = inst.get("props");

          if (props < price) {
            return message.reply("You don't have enough props.");
          }

          await inst.decrement("props", { by: price });
          await this.client.db.models.users.increment("props", { by: price, where: { id: "40333310" } });

          if (!this.client.pokerUtil.started) {
            this.client.pokerUtil.players.add(userID);
          }

          this.client.pokerUtil.startingPlayers.add(userID);
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

          if (this.client.pokerUtil.currentPlayer.id != userID) {
            return message.reply("It's not your turn!");
          } else if (this.client.pokerUtil.allInPlayers.has(this.client.pokerUtil.currentPlayer.id)) {
            return message.reply("You gone all-in! You can only skip at this point!");
          } else if (this.client.pokerUtil.playerBalances.get(this.client.pokerUtil.currentPlayer.id) + (this.client.pokerUtil.roundBets.get(this.client.pokerUtil.currentPlayer.id) || 0) - amount < 0) {
            return message.reply("You do not have enough Props to bet!");
          } else if (amount !== this.client.pokerUtil.previousBet && amount < this.client.pokerUtil.previousBet * 2) {
            return message.reply(`You need to bet equal or at least twice the previous bet of **${this.client.pokerUtil.previousBet}** Props`);
          }

          return this.client.pokerUtil.bet(amount);
        }
        case "call": {
          if (!this.client.pokerUtil.started) {
            return message.reply("Poker is not running!");
          }
          
          const amount = this.client.pokerUtil.previousBet;

          if (isNaN(amount)) {
            return false;
          }

          if (this.client.pokerUtil.currentPlayer.id != userID) {
            return message.reply("It's not your turn!");
          } else if (this.client.pokerUtil.allInPlayers.has(this.client.pokerUtil.currentPlayer.id)) {
            return message.reply("You gone all-in! You can only skip at this point!");
          } else if (this.client.pokerUtil.playerBalances.get(this.client.pokerUtil.currentPlayer.id) + (this.client.pokerUtil.roundBets.get(this.client.pokerUtil.currentPlayer.id) || 0) - amount < 0) {
            return message.reply("You do not have enough Props to bet!");
          } else if (amount !== this.client.pokerUtil.previousBet && amount < this.client.pokerUtil.previousBet * 2) {
            return message.reply(`You need to bet equal or at least twice the previous bet of **${this.client.pokerUtil.previousBet}** Props`);
          }

          return this.client.pokerUtil.bet(amount);
        }
        case "check": {
          if (!this.client.pokerUtil.started) {
            return message.reply("Poker is not running!");
          }

          if (this.client.pokerUtil.currentPlayer.id != userID) {
            return message.reply("It's not your turn!");
          } else if (this.client.pokerUtil.allInPlayers.has(this.client.pokerUtil.currentPlayer.id)) {
            return message.reply("You gone all-in! You can only skip at this point!");
          } else if (this.client.pokerUtil.previousBet) {
            return message.reply("You can only bet, fold, or go all-in at this point!");
          }

          return this.client.pokerUtil.check();
        }
        case "fold": {
          if (!this.client.pokerUtil.started) {
            return message.reply("Poker is not running!");
          } else if (this.client.pokerUtil.currentPlayer.id != userID) {
            return message.reply("It's not your turn!");
          }
          
          return this.client.pokerUtil.fold();
        }
        case "skip": {
          if (!this.client.pokerUtil.started) {
            return message.reply("Poker is not running!");
          } else if (this.client.pokerUtil.currentPlayer.id != userID) {
            return message.reply("It's not your turn!");
          } else if (!this.client.pokerUtil.allInPlayers.has(this.client.pokerUtil.currentPlayer.id)) {
            return message.reply("You cannot skip unless you have gone all-in.");
          }

          return this.client.pokerUtil.skip();
        }
        case "allin": {
          if (!this.client.pokerUtil.started) {
            return message.reply("Poker is not running!");
          } else if (this.client.pokerUtil.currentPlayer.id != userID) {
            return message.reply("It's not your turn!");
          } else if (this.client.pokerUtil.allInPlayers.has(this.client.pokerUtil.currentPlayer.id)) {
            return message.reply("You gone all-in! You can only skip at this point!");
          }

          const props = inst.get("props");

          if (props == 0) {
            message.reply("You have 0 props.");
            return this.client.pokerUtil.exit();
          }
          
          return this.client.pokerUtil.allIn();
        }
        case "exit": {
          if (!this.client.pokerUtil.checkGame() && !this.client.pokerUtil.started) {
            return message.reply("Poker is not running!");
          } else if (!this.client.pokerUtil.started) {
            this.client.pokerUtil.startingPlayers.delete(userID);

            await this.client.guilds.get("485173051432894489").members.get(userID).removeRole("512635547320188928").catch(console.warn);

            return message.reply("You left the table!");
          }

          if (this.client.pokerUtil.currentPlayer.id != userID) {
            return message.reply("It's not your turn!");
          }
          
          return this.client.pokerUtil.exit();
        }
        case "reset": {
          const user = this.client.plug.getUser(userDB.get("id"));

          if (!isObject(user) || await this.client.utils.getRole(user) <= ROOM_ROLE.MANAGER) return false;

          await this.client.redis.removeCommandFromCoolDown("discord", "poker@play", "perUse");

          return message.reply("The cooldown for poker has been reset!");
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

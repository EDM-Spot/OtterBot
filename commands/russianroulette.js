// Original Version https://github.com/1Computer1/kaado/blob/master/src/commands/games/poker.js
const Command = require("../base/Command.js");
const { isNil, isNaN, isObject } = require("lodash");
const { ROLE } = require("miniplug");
const moment = require("moment");
require("moment-timer");

class DiscordRussianRoulette extends Command {
  constructor(client) {
    super(client, {
      name: "rr",
      description: "Start a Russian Roulette Game",
      usage: "['start', 'join <props>', 'reset']"
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    try {
      //message.delete();

      if (!args.length) { return; }

      const params = ["start", "join", "reset"];
      const param = `${args.shift()}`.toLowerCase();

      if (!params.includes(param)) {
        return message.reply(`Invalid Param: ${param}`);
      }

      const userDB = await this.client.db.models.users.findOne({
        where: {
          discord: message.author.id,
        },
      });

      if (isNil(userDB)) {
        return message.reply("You need to link your account first! Read how here: http://prntscr.com/ls539m");
      }

      const userID = userDB.get("discord");

      switch (param) {
        case "start": {
          const cooldown = await this.client.redis.getCommandOnCoolDown("discord", "rr@play", "perUse");

          if (cooldown != -2) {
            return message.reply("Hold on! Russian Roulette runned " + Math.floor((10800 - cooldown) / 60) + " minute(s) ago, you must wait " + Math.ceil(cooldown / 60) + " minute(s) to play again.");
          }

          if (await this.client.roulette.check() || await this.client.russianRoulette.check() || this.client.triviaUtil.check() || this.client.unoUtil.checkGame() || this.client.unoUtil.checkGame()|| this.client.russianRouletteUtil.checkGame()) {
            return message.reply("There's a Game running already!");
          }

          let startMessage = `A new Russian Roulette Game has been created. \n`;
          startMessage += "You will be warned 30 seconds before it starts. \n";
          startMessage += "The game will start in 5 minute. Join the game with `-rr join <props 1-10>` \n";
          startMessage += "If you survive you win your props x2, if you die you lose your props. \n";
          startMessage += "Good Luck! \n";

          message.channel.send(startMessage);

          this.client.plug.chat("Discord Russian Roulette Game will start in 5 minute in channel #" + message.channel.name + "!");
          this.client.plug.chat("Join EDM Spot's Official Discord: https://discord.gg/QvvD8AC");

          this.client.russianRouletteUtil.running = true;

          new moment.duration(270000, "milliseconds").timer({ loop: false, start: true }, async () => {
            message.channel.send("<@&512635547320188928> 30 Seconds left until start!");
          });

          new moment.duration(5, "minutes").timer({ loop: false, start: true }, async () => {
            if (this.client.russianRouletteUtil.players.length < 1) {
              message.channel.send(`No one joined the RR.`);
              await this.client.russianRouletteUtil.end();
            } else {
              message.channel.send("<@&512635547320188928> Russian Roulette will now start!");

              await this.client.russianRouletteUtil.start();
            }
          });

          await this.client.redis.placeCommandOnCooldown("discord", "rr@play", "perUse", 10800);

          return true;
        }
        case "join": {
          if (!this.client.russianRouletteUtil.checkGame() && !this.client.russianRouletteUtil.started) {
            return message.reply("Russian Roulette is not running!");
          }

          if (this.client.russianRouletteUtil.started) {
            return message.reply("Russian Roulette already started!");
          }

          const props = userDB.get("props");

          const bet = parseInt(args.pop(), 10);

          if (isNaN(bet) || bet < 1 || bet > 10) {
            return false;
          }

          if (props < bet) {
            return message.reply("You don't have enough props.");
          }

          await userDB.decrement("props", { by: bet });
          await this.client.db.models.users.increment("props", { by: bet, where: { id: "40333310" } });

          this.client.russianRouletteUtil.addPlayer(userID, bet);
          await this.client.guilds.cache.get("485173051432894489").members.cache.get(message.author.id).roles.add("512635547320188928").catch(console.error);

          return message.reply("Joined Russian Roulette.");
        }
        case "reset": {
          const user = this.client.plug.user(userDB.get("id"));

          if (!isObject(user) || await this.client.utils.getRole(user) <= ROLE.MANAGER) return false;

          await this.client.russianRouletteUtil.end();
          await this.client.redis.removeCommandFromCoolDown("discord", "rr@play", "perUse");

          return message.reply("The cooldown for Russian Roulette has been reset!");
        }
        default:
          return false;
      }
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = DiscordRussianRoulette;

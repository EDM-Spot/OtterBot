const { each } = require("lodash");
const moment = require("moment");
require("moment-timer");
const momentRandom = require("moment-random");

module.exports = function Util(bot) {
  class LotteryUtil {
    constructor() {
      this.players = [];
      this.timer = undefined;
      this.canJoinDate = undefined;
      this.giveTimer = undefined;
      this.acceptedBool = false;
    }
    async start() {
      const startRandom = moment().add(1, "hours");
      const endRandom = moment().add(3, "hours");
      const eventStart = momentRandom(endRandom, startRandom);
      this.canJoinDate = moment(eventStart).subtract(1, "hours");

      const randomTimeDuration = eventStart - moment();

      console.log("Lottery Event Start: " + eventStart.format("LTS"));

      this.timer = moment.duration(randomTimeDuration, "milliseconds").timer({loop: false, start: true}, async () => {
        console.log("Lottery Event Will now Start: " + eventStart.format("LTS"));
        this.acceptedBool = false;
        await this.sort();
      });
    }
    add(id) {
      if (!this.players.includes(id)) {
        this.players.push(id);
        return true;
      }

      return false;
    }
    async multiplier(players, isIn) {
      // multipler for users outside the waitlist
      const outside = [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
      ];
      // multipler for users inside the waitlist
      const inside = [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        3, 3, 3, 3, 3,
      ];

      return isIn ? (inside[players] || 2) : (outside[players] || 3);
    }
    accepted() {
      this.players = [];
      this.timer = undefined;
      this.canJoinDate = undefined;
      this.acceptedBool = true;

      clearTimeout(this.giveTimer);

      return this.start();
    }
    async winner(players) {
      if (this.acceptedBool) return;
      if (bot.plug.getWaitList().length <= 10) return;

      const winner = players[Math.floor(Math.random() * players.length)];
      const user = bot.plug.getUser(winner);

      if (!players.length) {
        this.players = [];
        this.timer = undefined;
        this.canJoinDate = undefined;

        return this.start();
      }

      const position = 5;

      if (!user || typeof user.username !== "string" || !user.username.length) {
        this.winner(players.filter(player => player !== winner));
        return;
      }

      await bot.redis.removeGivePosition(user.id, bot.plug.getSelf().id);

      await bot.plug.sendChat(bot.utils.replace(bot.lang.lotteryWinner, {
        winner: user.username,
        position: position,
      }));

      //bot.queue.add(user, position);
      await bot.redis.registerGivePosition(bot.plug.getSelf().id, user.id, position);

      this.giveTimer = moment.duration(3, "minutes").timer({loop: false, start: true}, async () => {
        await bot.plug.sendChat(bot.lang.notAccepted);
        bot.redis.removeGivePosition(user.id, bot.plug.getSelf().id);
        this.winner(players.filter(player => player !== winner));
      }, (120000));
    
      //this.players = [];
      //this.timer = undefined;
      //this.canJoinDate = undefined;

      //this.start();
    }
    async sort() {
      if (!this.players.length) {
        this.players = [];
        this.timer = undefined;
        this.canJoinDate = undefined;
        
        return this.start();
      }

      const alteredOdds = [];

      each(this.players, (player) => {
        if (bot.plug.getUser(player)) {
          if (bot.plug.getWaitListPosition(player) === -1) {
            alteredOdds.push(...Array(this.multiplier(this.players.length, false)).fill(player));
          } else {
            if (bot.plug.getWaitListPosition(player) > 5) {
              alteredOdds.push(...Array(this.multiplier(this.players.length, true)).fill(player));
            }
          }
        }
      });

      return this.winner(alteredOdds);
    }
  }

  bot.lottery = new LotteryUtil();
};
const { isObject } = require("lodash");
const { ROLE, MUTE_DURATION, MUTE_REASON } = require("miniplug");

module.exports = function Util(bot) {
  class RussianRouletteUtil {
    constructor() {
      this.running = false;
      this.price = undefined;
      this.duration = undefined;
      this.players = [];
    }
    async start(duration, price) {
      this.running = true;
      this.duration = duration;
      this.price = price;

      await bot.redis.placeCommandOnCooldown("plug", "russianroulette@start", "perUse", 1, 10800);

      this.timeout = setTimeout(async () => {
        await this.sort();
      }, duration * 1e3);
    }
    end() {
      this.running = false;
      this.price = undefined;
      this.duration = undefined;
      this.players = [];

      clearTimeout(this.timeout);

      return true;
    }
    async check(cooldown) {
      if (cooldown) {
        return bot.redis.getCommandOnCoolDown("plug", "russianroulette@start", "perUse");
      }

      return this.running;
    }
    add(id) {
      if (!this.players.includes(id)) {
        this.players.push(id);
        return true;
      }

      return false;
    }
    async chooseVictim(players) {
      this.running = false;

      const victim = players[Math.floor(Math.random() * players.length)];
      const user = bot.plug.user(victim);
      const waitlist = bot.plug.waitlist();

      if (!players.length) {
        bot.plug.chat(bot.lang.russianroulette.countOver);
        this.end();
        return;
      }

      if (!isObject(user) || typeof user.username !== "string" || !user.username.length) {
        bot.plug.chat(bot.utils.replace(bot.lang.russianroulette.chicken, {
          user: victim,
        }));

        await bot.redis.removeDisconnection(victim);
        this.chooseVictim(players.filter(player => player !== victim));
        return;
      }

      await bot.wait(3000);
      bot.plug.chat(bot.utils.replace(bot.lang.russianroulette.shot, {
        user: user.username,
      }));
      await bot.wait(5000);

      const randomBool = Math.random() >= 0.5;

      const luckyshot = Math.floor(Math.random() * (waitlist.positionOf(victim) - 5)) + 5;
      const unluckyshot = Math.floor(Math.random() * (waitlist.length - waitlist.positionOf(victim)) + waitlist.positionOf(victim) + 1);

      if (randomBool) {
        bot.plug.chat(bot.utils.replace(bot.lang.russianroulette.luckyshot, {
          user: user.username,
        }));

        if (waitlist.positionOf(victim) === -1) {
          bot.queue.add(user, waitlist.length);

          this.chooseVictim(players.filter(player => player !== victim));
          return;
        }

        bot.queue.add(user, luckyshot);
      } else {
        bot.plug.chat(bot.utils.replace(bot.lang.russianroulette.unluckyshot, {
          user: user.username,
        }));

        if (waitlist.positionOf(victim) === -1) {
          this.chooseVictim(players.filter(player => player !== victim));
          return;
        }

        bot.queue.add(user, unluckyshot);
      }

      this.chooseVictim(players.filter(player => player !== victim));
    }
    async sort() {
      this.running = false;

      const alteredOdds = this.players;

      return this.chooseVictim(alteredOdds);
    }
  }

  bot.russianRoulette = new RussianRouletteUtil();
};
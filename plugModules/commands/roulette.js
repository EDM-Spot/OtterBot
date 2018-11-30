const { isObject, isNaN } = require("lodash");
const { ROOM_ROLE } = require("plugapi");
const moment = require("moment");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["roulette"],
    minimumPermission: 2000,
    cooldownType: "none",
    cooldownDuration: 0,
    parameters: "<check|end|start> [duration] [price]",
    description: "Roulette management command, can check if a roulette can be ran, can end or start a roulette (with specified duration or price, both defaulting to 60 and 1 respectively).",
    async execute(rawData, { args }, lang) {
      if (!args.length) {
        this.reply(lang.roulette.noParams, {}, 6e4);
        return false;
      }

      const params = ["check", "start", "end", "reset"];
      const param = `${args.shift()}`.toLowerCase();

      if (!params.includes(param)) {
        this.reply(lang.roulette.invalidParam, {}, 6e4);
        return false;
      }

      switch (param) {
        case "check": {
          if (await bot.roulette.check()) {
            this.reply(lang.roulette.started, {}, 6e4);
            return true;
          }

          const cooldown = await bot.redis.getCommandOnCoolDown("plug", "roulette@start", "perUse");

          if (cooldown == -2) {
            this.reply(lang.roulette.outOfCooldown, {}, 6e4);
            return true;
          }

          this.reply(lang.roulette.onCooldown, {
            elapsed: Math.floor((3600 - cooldown) / 60),
            remaining: Math.ceil(cooldown / 60),
          });
          return true;
        }
        case "reset": {
          const user = bot.plug.getUser(rawData.from.id);

          if (!isObject(user) || await bot.utils.getRole(user) <= ROOM_ROLE.MANAGER) return false;

          await bot.redis.removeCommandFromCoolDown("plug", "roulette@start", "perUse");
          this.reply(lang.roulette.reset, {}, 6e4);
          return true;
        }
        case "start": {
          const waitlist = bot.plug.getWaitList();
          const day = moment().isoWeekday();
          const isWeekend = (day === 5) || (day === 6) || (day === 7);

          if (await bot.roulette.check()) {
            this.reply(lang.roulette.started, {}, 6e4);
            return true;
          }

          const cooldown = await bot.redis.getCommandOnCoolDown("plug", "roulette@start", "perUse");

          if (cooldown != -2) {
            this.reply(lang.roulette.onCooldown, {
              elapsed: Math.floor((3600 - cooldown) / 60),
              remaining: Math.ceil(cooldown / 60),
            });
            return true;
          }

          if (waitlist.length < 10) {
            this.reply(lang.roulette.invalidWaitlist, {}, 6e4);
            return false;
          }

          let duration = 60;

          if (args.length) {
            const specifiedDuration = parseInt(args.shift(), 10);

            if (isNaN(specifiedDuration) || specifiedDuration < 30 || specifiedDuration > 120) {
              this.reply(lang.roulette.invalidDuration, {}, 6e4);
              return false;
            }

            duration = specifiedDuration;
          }

          let price = 1;

          if (args.length) {
            let specifiedPrice = parseInt(args.shift(), 10);

            if (specifiedPrice === 0) {
              specifiedPrice = 1;
            }

            if (isNaN(specifiedPrice) && specifiedPrice <= 100) {
              this.reply(lang.roulette.invalidPrice, {}, 6e4);
              return false;
            }

            price = specifiedPrice;
          }

          if (isWeekend) {
            price = 0;
          }

          await bot.roulette.start(duration, price);
          
          if (isWeekend) {
            await bot.plug.sendChat(bot.utils.replace(lang.roulette.startingWeekend, {}), duration * 1e3);
          }

          await bot.plug.sendChat(bot.utils.replace(lang.roulette.starting, {}), duration * 1e3);

          await bot.plug.sendChat(bot.utils.replace(lang.roulette.info, {
            duration,
            price: price === 0 ? lang.roulette.free : `${price} prop${price > 1 ? "s" : ""}`,
          }), duration * 1e3);
          return true;
        }
        case "end": {
          if (!await bot.roulette.check()) {
            this.reply(lang.roulette.notStarted, {}, 6e4);
            return false;
          }

          bot.roulette.end();
          this.reply(lang.roulette.stopped, {}, 6e4);
          return true;
        }
        default:
          return false;
      }
    },
  });
};
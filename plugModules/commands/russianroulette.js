const { isObject, isNaN } = require("lodash");
const { ROLE } = require("miniplug");
const moment = require("moment");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["russianroulette", "rr"],
    minimumPermission: 2000,
    cooldownType: "none",
    cooldownDuration: 0,
    parameters: "<check|end|start|force [duration] [price]>",
    description: "Russian Roulette management command, can check if a roulette can be ran, can end or start a roulette (with specified duration or price, both defaulting to 60 and 1 respectively).",
    async execute(rawData, { args }, lang) {
      if (!args.length) {
        this.reply(lang.russianroulette.noParams, {}, 6e4);
        return false;
      }

      const params = ["check", "start", "end", "reset", "force"];
      const param = `${args.shift()}`.toLowerCase();

      if (!params.includes(param)) {
        this.reply(lang.russianroulette.invalidParam, {}, 6e4);
        return false;
      }

      switch (param) {
        case "check": {
          if (await bot.russianRoulette.check()) {
            this.reply(lang.russianroulette.started, {}, 6e4);
            return true;
          }

          const cooldown = await bot.redis.getCommandOnCoolDown("plug", "russianroulette@start", "perUse");

          if (cooldown == -2) {
            this.reply(lang.russianroulette.outOfCooldown, {}, 6e4);
            return true;
          }

          this.reply(lang.russianroulette.onCooldown, {
            elapsed: Math.floor((10800 - cooldown) / 60),
            remaining: Math.ceil(cooldown / 60),
          });
          return true;
        }
        case "reset": {
          const user = bot.plug.user(rawData.uid);

          if (!isObject(user) || await bot.utils.getRole(user) <= ROLE.MANAGER) return false;

          await bot.redis.removeCommandFromCoolDown("plug", "russianroulette@start", "perUse");
          this.reply(lang.russianroulette.reset, {}, 6e4);
          return true;
        }
        case "start": {
          const waitlist = bot.plug.waitlist();
          const day = moment().isoWeekday();
          const isWeekend = (day === 6) || (day === 7);
          const isDecember = (moment().month() === 11);

          if (await bot.roulette.check() || await bot.russianRoulette.check() || bot.triviaUtil.check() || bot.pokerUtil.checkGame() || bot.unoUtil.checkGame() || bot.russianRouletteUtil.checkGame()) {
            this.reply(lang.russianroulette.started, {}, 6e4);
            return true;
          }

          const cooldown = await bot.redis.getCommandOnCoolDown("plug", "russianroulette@start", "perUse");

          if (cooldown != -2) {
            this.reply(lang.russianroulette.onCooldown, {
              elapsed: Math.floor((10800 - cooldown) / 60),
              remaining: Math.ceil(cooldown / 60),
            });
            return true;
          }

          //if (waitlist.length < 20) {
            //this.reply(lang.russianroulette.invalidWaitlist, {}, 6e4);
            //return false;
          //}

          let duration = 120;

          if (args.length) {
            const specifiedDuration = parseInt(args.shift(), 10);

            if (isNaN(specifiedDuration) || specifiedDuration < 10 || specifiedDuration > 120) {
              this.reply(lang.russianroulette.invalidDuration, {}, 6e4);
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
              this.reply(lang.russianroulette.invalidPrice, {}, 6e4);
              return false;
            }

            price = specifiedPrice;
          }

          //if (isWeekend) {
          if (isWeekend || isDecember) {
            price = 0;
          }

          await bot.russianRoulette.start(duration, price);

          //if (isWeekend) {
          if (isWeekend && !isDecember) {
            bot.plug.chat(bot.utils.replace(lang.russianroulette.startingWeekend, {})).delay(duration * 1e3).call("delete");
          }

          if (isDecember) {
            bot.plug.chat(bot.utils.replace(":christmasballs1: Merry Christmas! :christmasballs1:", {})).delay(duration * 1e3).call("delete");
          }
          
          bot.plug.chat(bot.utils.replace(lang.russianroulette.starting, {})).delay(duration * 1e3).call("delete");

          bot.plug.chat(bot.utils.replace(lang.russianroulette.info, {
            duration,
            price: price === 0 ? lang.russianroulette.free : `${price} prop${price > 1 ? "s" : ""}`,
          })).delay(duration * 1e3).call("delete");
          return true;
        }
        case "force": {
          const user = bot.plug.user(rawData.uid);

          if (!isObject(user) || await bot.utils.getRole(user) <= ROLE.MANAGER) return false;

          const day = moment().isoWeekday();
          const isWeekend = (day === 6) || (day === 7);
          const isDecember = (moment().month() === 11);

          if (await bot.roulette.check() || await bot.russianRoulette.check() || bot.triviaUtil.check() || bot.pokerUtil.checkGame() || bot.unoUtil.checkGame() || bot.russianRouletteUtil.checkGame()) {
            this.reply(lang.russianroulette.started, {}, 6e4);
            return true;
          }

          const cooldown = await bot.redis.getCommandOnCoolDown("plug", "russianroulette@start", "perUse");

          if (cooldown != -2) {
            this.reply(lang.russianroulette.onCooldown, {
              elapsed: Math.floor((10800 - cooldown) / 60),
              remaining: Math.ceil(cooldown / 60),
            });
            return true;
          }

          let duration = 120;

          if (args.length) {
            const specifiedDuration = parseInt(args.shift(), 10);

            if (isNaN(specifiedDuration) || specifiedDuration < 10 || specifiedDuration > 120) {
              this.reply(lang.russianroulette.invalidDuration, {}, 6e4);
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
              this.reply(lang.russianroulette.invalidPrice, {}, 6e4);
              return false;
            }

            price = specifiedPrice;
          }

          //if (isWeekend) {
          if (isWeekend || isDecember) {
            price = 0;
          }

          await bot.russianRoulette.start(duration, price);

          //if (isWeekend) {
          if (isWeekend && !isDecember) {
            bot.plug.chat(bot.utils.replace(lang.russianroulette.startingWeekend, {})).delay(duration * 1e3).call("delete");
          }

          if (isDecember) {
            bot.plug.chat(bot.utils.replace(":christmasballs1: Merry Christmas! :christmasballs1:", {})).delay(duration * 1e3).call("delete");
          }
          
          bot.plug.chat(bot.utils.replace(lang.russianroulette.starting, {})).delay(duration * 1e3).call("delete");

          bot.plug.chat(bot.utils.replace(lang.russianroulette.info, {
            duration,
            price: price === 0 ? lang.russianroulette.free : `${price} prop${price > 1 ? "s" : ""}`,
          })).delay(duration * 1e3).call("delete");
          return true;
        }
        case "end": {
          if (!await bot.russianRoulette.check()) {
            this.reply(lang.russianroulette.notStarted, {}, 6e4);
            return false;
          }

          bot.russianRoulette.end();
          this.reply(lang.russianroulette.stopped, {}, 6e4);
          return true;
        }
        default:
          return false;
      }
    },
  });
};
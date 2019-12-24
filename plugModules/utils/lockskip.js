const { isObject } = require("lodash");

module.exports = function Util(bot) {
  const util = {
    name: "lockskip",
    function: user => new Promise((resolve, reject) => {
      const shouldCycle = bot.plug.isCycling();
      const waitList = bot.plug.waitlist();
      const historyEntry = bot.plug.historyEntry();
      const dj = bot.plug.dj();

      const lockSkip = {
        position: 2,
        withCycle: async () => {
          await bot.plug.enableCycle();
          await historyEntry.skip();
          await user.move(lockSkip.position);
          await bot.plug.disableCycle();
          return resolve();
        },
        withoutCycle: async () => {
          await historyEntry.skip();
          await user.move(lockSkip.position);
          return resolve();
        },
        addingDJ: async () => {
          await historyEntry.skip();
          await user.add();
          await user.move(lockSkip.position);
          return resolve();
        },
        onlySkip: async () => {
          await historyEntry.skip();
          return resolve();
        },
        skipOnlyAdd: async () => {
          await historyEntry.skip();
          await user.add();
          return resolve();
        },
        run: function RunLockSkip() {
          try {
            if (!isObject(dj) || !isObject(historyEntry)) {
              return Promise.reject(new Error("[!] No DJ or Media playing."));
            } else if (!waitList.length && shouldCycle) {
              return this.onlySkip();
            } else if (!shouldCycle && waitList.length < this.position) {
              return this.skipOnlyAdd();
            } else if (!shouldCycle && (waitList.length >= 4 && waitList.length <= 45)) {
              return this.addingDJ();
            } else if (shouldCycle && (waitList.length >= 4 && waitList.length <= 45)) {
              return this.withoutCycle();
            } else if (!shouldCycle) {
              return this.withCycle();
            }

            return this.withoutCycle();
          } catch (err) {
            console.error("[!] LockSkip Error");
            console.error(err);
            return reject(err);
          }
        },
      };

      return lockSkip.run();
    }),
  };

  bot.utils.register(util);
};
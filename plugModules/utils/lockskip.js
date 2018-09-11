const { isObject } = require("lodash");

module.exports = function Util(bot) {
  const util = {
    name: "lockskip",
    function: user => new Promise((resolve, reject) => {
      const shouldCycle = false;
      const waitList = bot.plug.getWaitList();
      const historyEntry = bot.plug.getMedia();
      const dj = bot.plug.getDJ();

      const lockSkip = {
        position: 3,
        withCycle: async () => {
          await bot.plug.changeDJCycle(true);
          await bot.plug.moderateForceSkip(function() {
            //bot.plug.moderateMoveDJ(user.id, lockSkip.position);
            bot.plug.moderateAddDJ(user.id, function() {
              bot.plug.moderateMoveDJ(user.id, lockSkip.position);
            });
          });
          //await user.moveInWaitList(lockSkip.position);
          await bot.plug.changeDJCycle(false);
          return resolve();
        },
        withoutCycle: async () => {
          await bot.plug.moderateForceSkip(function() {
            //bot.plug.moderateMoveDJ(user.id, lockSkip.position);
            bot.plug.moderateAddDJ(user.id, function() {
              bot.plug.moderateMoveDJ(user.id, lockSkip.position);
            });
          });
          //await user.moveInWaitList(lockSkip.position);
          return resolve();
        },
        addingDJ: async () => {
          await bot.plug.moderateForceSkip(function() {
            //bot.plug.moderateMoveDJ(user.id, lockSkip.position);
            bot.plug.moderateAddDJ(user.id, function() {
              bot.plug.moderateMoveDJ(user.id, lockSkip.position);
            });
          });
          //await user.addToWaitList();
          //await user.moveInWaitList(lockSkip.position);
          return resolve();
        },
        onlySkip: async () => {
          await bot.plug.moderateForceSkip();
          return resolve();
        },
        skipOnlyAdd: async () => {
          await bot.plug.moderateForceSkip(function() {
            bot.plug.moderateAddDJ(user.id);
          });
          //await user.addToWaitList();
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
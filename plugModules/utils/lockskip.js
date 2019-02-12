const { isObject } = require("lodash");

module.exports = function Util(bot) {
  const util = {
    name: "lockskip",
    function: user => new Promise((resolve, reject) => {
      const waitList = bot.plug.getWaitList();
      const historyEntry = bot.plug.getMedia();
      const dj = bot.plug.getDJ();

      const lockSkip = {
        position: 3,
        addingDJ: async () => {
          await bot.plug.moderateForceSkip(async function() {
            //bot.plug.moderateMoveDJ(user.id, lockSkip.position);
            await bot.plug.moderateAddDJ(user.id, async function() {
              await bot.plug.moderateMoveDJ(user.id, lockSkip.position);
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
          await bot.plug.moderateForceSkip(async function() {
            await bot.plug.moderateAddDJ(user.id);
          });
          //await user.addToWaitList();
          return resolve();
        },
        run: function RunLockSkip() {
          try {
            if (!isObject(dj) || !isObject(historyEntry)) {
              return Promise.reject(new Error("[!] No DJ or Media playing."));
            } else if (!waitList.length) {
              return this.onlySkip();
            } else if (waitList.length < this.position) {
              return this.skipOnlyAdd();
            }

            return this.addingDJ();
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
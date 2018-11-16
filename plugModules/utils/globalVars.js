module.exports = function Util(bot) {
  class GlobalUtil {
    constructor() {
      this.ignoreHistoryNext = false;
      this.isSkippedByTimeGuard = false;

      this.pointsWeight = {
        woots: 1.41,
        mehs: 3.96,
        grabs: 2.14,
        propsGiven: 0.08,
        messages: 0.031,
        ban: 1.37,
        wlban: 0.49,
        mute: 0.24,
        daysOffline: 0.28
      };
    }
  }

  bot.global = new GlobalUtil();
};
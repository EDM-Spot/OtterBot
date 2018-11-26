module.exports = function Util(bot) {
  class GlobalUtil {
    constructor() {
      this.ignoreHistoryNext = false;
      this.isSkippedByTimeGuard = false;

      this.pointsWeight = {
        woots: 1.42,
        mehs: 3.988,
        grabs: 2.2,
        propsGiven: 0.04,
        messages: 0.024,
        ban: 1.35,
        wlban: 0.47,
        mute: 0.28,
        daysOffline: 0.16
      };
    }
  }

  bot.global = new GlobalUtil();
};
module.exports = function Util(bot) {
  class GlobalUtil {
    constructor() {
      this.ignoreHistoryNext = false;
      this.isSkippedByTimeGuard = false;

      this.pointsWeight = {
        woots: 0.05,
        mehs: 0.45,
        grabs: 0.1,
        propsGiven: 0.9,
        messages: 1.4,
        ban: 0.6,
        wlban: 0.35,
        mute: 0.15,
        daysOffline: 0.6
      };
    }
  }

  bot.global = new GlobalUtil();
};
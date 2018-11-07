module.exports = function Util(bot) {
  class GlobalUtil {
    constructor() {
      this.ignoreHistoryNext = false;
      this.isSkippedByTimeGuard = false;

      this.pointsWeight = {
        woots: 1.4,
        mehs: 3.95,
        grabs: 2.1,
        propsGiven: 0.08,
        messages: 0.033,
        ban: 1.35,
        wlban: 0.47,
        mute: 0.22,
        daysOffline: 0.2
      };
    }
  }

  bot.global = new GlobalUtil();
};
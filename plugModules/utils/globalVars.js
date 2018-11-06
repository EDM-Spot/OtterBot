module.exports = function Util(bot) {
  class GlobalUtil {
    constructor() {
      this.ignoreHistoryNext = false;
      this.isSkippedByTimeGuard = false;

      this.pointsWeight = {
        woots: 0.85,
        mehs: 2.75,
        grabs: 1.4,
        propsGiven: 0.085,
        messages: 0.05,
        ban: 1.2,
        wlban: 0.35,
        mute: 0.15,
        daysOffline: 0.2
      };
    }
  }

  bot.global = new GlobalUtil();
};
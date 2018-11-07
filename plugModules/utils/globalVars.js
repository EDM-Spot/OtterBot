module.exports = function Util(bot) {
  class GlobalUtil {
    constructor() {
      this.ignoreHistoryNext = false;
      this.isSkippedByTimeGuard = false;

      this.pointsWeight = {
        woots: 1.3,
        mehs: 3.65,
        grabs: 1.92,
        propsGiven: 0.065,
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
module.exports = function Util(bot) {
  class GlobalUtil {
    constructor() {
      this.ignoreHistoryNext = false;
      this.isSkippedByTimeGuard = false;

      this.pointsWeight = {
        woots: 0.7,
        mehs: 1.3,
        grabs: 0.85,
        propsGiven: 1.15,
        messages: 1.7,
        ban: 4.7,
        wlban: 2.45,
        mute: 1.65
      };
    }
  }

  bot.global = new GlobalUtil();
};
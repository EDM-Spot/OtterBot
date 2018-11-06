module.exports = function Util(bot) {
  class GlobalUtil {
    constructor() {
      this.ignoreHistoryNext = false;
      this.isSkippedByTimeGuard = false;

      this.pointsWeight = {
        woots: 0.55,
        mehs: 3.7,
        grabs: 3.4,
        propsGiven: 1.75,
        messages: 1.85,
        ban: 4.7,
        wlban: 2.45,
        mute: 1.65
      };
    }
  }

  bot.global = new GlobalUtil();
};
module.exports = function Util(bot) {
  class GlobalUtil {
    constructor() {
      this.ignoreHistoryNext = false;
      this.isSkippedByTimeGuard = false;

      this.pointsWeight = {
        woots: 1.75,
        mehs: 4.4,
        grabs: 3.5,
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
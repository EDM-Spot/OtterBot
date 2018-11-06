module.exports = function Util(bot) {
  class GlobalUtil {
    constructor() {
      this.ignoreHistoryNext = false;
      this.isSkippedByTimeGuard = false;

      this.pointsWeight = {
        woots: 0.25,
        mehs: 0.6,
        grabs: 0.45,
        propsGiven: 1.15,
        messages: 1.4,
        ban: 4.7,
        wlban: 2.45,
        mute: 1.65
      };
    }
  }

  bot.global = new GlobalUtil();
};
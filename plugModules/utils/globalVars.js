module.exports = function Util(bot) {
  class GlobalUtil {
    constructor() {
      this.ignoreHistoryNext = false;
      this.isSkippedByTimeGuard = false;

      this.pointsWeight = {
        woots: 0.75,
        mehs: 5,
        grabs: 3.5,
        propsGiven: 1.75,
        messages: 1.85,
        ban: 8.5,
        wlban: 5.25,
        mute: 3.75
      };
    }
  }

  bot.global = new GlobalUtil();
};
module.exports = function Util(bot) {
  class GlobalUtil {
    constructor() {
      this.ignoreHistoryNext = false;
      this.isSkippedByTimeGuard = false;

      this.pointsWeight = {
        woots: 1.75,
        mehs: 6.9,
        grabs: 3.5,
        propsGiven: 1.75,
        messages: 1.85,
        ban: 10.5,
        wlban: 7.25,
        mute: 4.75
      };
    }
  }

  bot.global = new GlobalUtil();
};
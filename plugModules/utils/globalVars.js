module.exports = function Util(bot) {
  class GlobalUtil {
    constructor() {
      this.ignoreHistoryNext = false;
      this.isSkippedByTimeGuard = false;
      this.isSkippedByMehGuard = false;
      this.isHolidaySong = false;

      this.pointsWeight = {
        woots: 1.2,
        mehs: 1.3,
        grabs: 1.45,
        propsGiven: 0.05,
        messages: 0.022,
        ban: 1.35,
        wlban: 0.47,
        mute: 0.28,
        daysOffline: 0.16
      };
    }
  }

  bot.global = new GlobalUtil();
};
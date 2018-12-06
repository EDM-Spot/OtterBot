module.exports = function Util(bot) {
  class GlobalUtil {
    constructor() {
      this.ignoreHistoryNext = false;
      this.isSkippedByTimeGuard = false;
      this.isSkippedByMehGuard = false;
      this.isHolidaySong = false;

      this.pointsWeight = {
        woots: 1.5,
        mehs: 3.9,
        grabs: 2.3,
        propsGiven: 0.04,
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
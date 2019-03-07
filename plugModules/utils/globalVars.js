module.exports = function Util(bot) {
  class GlobalUtil {
    constructor() {
      this.ignoreHistoryNext = false;
      this.isSkippedByTimeGuard = false;
      this.isSkippedByMehGuard = false;
      this.isHolidaySong = false;

      this.pointsWeight = {
        woots: 1.12,
        mehs: 1.35,
        grabs: 1.2,
        propsGiven: 0.021,
        messages: 0.02,
        ban: 1.4,
        wlban: 0.6,
        mute: 0.35,
        daysOffline: 0.16
      };
    }
  }

  bot.global = new GlobalUtil();
};
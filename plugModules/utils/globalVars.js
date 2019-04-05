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
        propsGiven: 0.023,
        messages: 0.015,
        ban: 1.9,
        wlban: 1.1,
        mute: 0.55,
        daysOffline: 0.17
      };
    }
  }

  bot.global = new GlobalUtil();
};
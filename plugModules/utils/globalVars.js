module.exports = function Util(bot) {
  class GlobalUtil {
    constructor() {
      this.ignoreHistoryNext = false;
      this.isSkippedByTimeGuard = false;
      this.isSkippedByMehGuard = false;
      this.isHolidaySong = false;

      this.pointsWeight = {
        woots: 0.25,
        mehs: 1,
        grabs: 1,
        propsGiven: 0.025,
        messages: 0.05,
        ban: 8,
        wlban: 4,
        mute: 2,
        daysOffline: 0.15
      };
    }
  }

  bot.global = new GlobalUtil();
};
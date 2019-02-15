module.exports = function Util(bot) {
  class GlobalUtil {
    constructor() {
      this.ignoreHistoryNext = false;
      this.isSkippedByTimeGuard = false;
      this.isSkippedByMehGuard = false;
      this.isHolidaySong = false;

      this.pointsWeight = {
        woots: 1.15,
        mehs: 1.3,
        grabs: 1.25,
        propsGiven: 0.025,
        messages: 0.02,
        ban: 1.35,
        wlban: 0.5,
        mute: 0.3,
        daysOffline: 0.16
      };
    }
  }

  bot.global = new GlobalUtil();
};
module.exports = function Util(bot) {
  class GlobalUtil {
    constructor() {
      this.ignoreHistoryNext = false;
    }
  }

  bot.global = new GlobalUtil();
};
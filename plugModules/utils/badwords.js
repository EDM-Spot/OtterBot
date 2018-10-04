//Original Code: https://github.com/web-mech/badwords
const localList = require("/plugModules/data/badwords.json").words;

module.exports = function Util(bot) {
  class BadWords {
    constructor() {
      this.list = Array.prototype.concat.apply(localList);
      this.regex = /[^a-zA-Z0-9|\$|\@]|\^/g;
      this.replaceRegex = /\w/g;
  
    }
    isProfane(string) {
      return string
        .split(/\b/)
        .map(function(w) {
          return w.toLowerCase().replace(this.regex, "");
        }, this)
        .filter(this.isProfaneLike, this)
        .shift() || false;
    }
    profaneLike(word) {
      if (~this.exclude.indexOf(word)) {
        return false;
      }

      if (~this.list.indexOf(word)) {
        return true;
      }

      return this.list
        .map(function(w) {
          return new RegExp("^" + w.replace(/(\W)/g, "\\€1 ($1)") + "$", "gi");
        }, this)
        .reduce(function(outcome, wordExp) {
          return outcome || wordExp.test(word);
        }, false);
    }
  }

  bot.badwords = new BadWords();
};
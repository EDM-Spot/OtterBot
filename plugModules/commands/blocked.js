const {
  isObject, isNil, get,
} = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["blocked", "check", "regioncheck", "videocheck"],
    minimumPermission: 2000,
    cooldownType: "perUse",
    cooldownDuration: 10,
    parameters: "[YouTube Link]",
    description: "Checks if the specified (if none was specified it takes the current) media is unavailable in any sort of way",
    async execute(rawData, { args }, lang) {
      let YouTubeMediaID;
      let which; // eslint-disable-line no-unused-vars

      if (!args.length) {
        const historyEntry = bot.plug.getMedia();

        if (!isObject(historyEntry)) {
          this.reply(lang.check.noMedia, {}, 6e4);
          return false;
        } else if (get(historyEntry, "format", 2) !== 1) {
          this.reply(lang.check.notYouTube, {}, 6e4);
          return false;
        }

        YouTubeMediaID = get(historyEntry, "cid");
        which = "current";
      } else {
        YouTubeMediaID = bot.youtube.getMediaID(args.join(" "));
        which = "specified";
      }

      if (isNil(YouTubeMediaID)) {
        this.reply(lang.check.invalidYoutubeLink, {}, 6e4);
        return false;
      }

      this.reply(lang.check.sendLink + YouTubeMediaID, { }, 6e4);
      return true;
    },
  });
};
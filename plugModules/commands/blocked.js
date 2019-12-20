const {
  isObject, isArray, isNil, get,
} = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["blocked", "check"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 60,
    parameters: "[YouTube Link]",
    description: "Checks if media is unavailable in any sort of way",
    async execute(rawData, { args }, lang) { // eslint-disable-line no-unused-vars
      let YouTubeMediaID;
      let which;

      if (!args.length) {
        const currentMedia = bot.plug.historyEntry();

        if (!isObject(currentMedia)) {
          this.reply(lang.check.noMedia, {}, 6e4);
          return false;
        } else if (get(currentMedia, "format", 2) !== 1) {
          this.reply(lang.check.notYouTube, {}, 6e4);
          return false;
        }

        YouTubeMediaID = get(currentMedia, "cid");
        which = "current";
      } else {
        YouTubeMediaID = bot.youtube.getMediaID(args.join(" "));
        which = "specified";
      }

      if (isNil(YouTubeMediaID)) {
        this.reply(lang.check.invalidYoutubeLink, {}, 6e4);
        return false;
      }

      let YouTubeMediaData;

      try {
        YouTubeMediaData = await bot.youtube.getMedia(YouTubeMediaID);
      } catch (err) {
        console.warn("[!] YouTube getMedia Error");
        console.warn(err);
        this.reply(lang.check.plausible, {}, 6e4);
        return true;
      }

      const { contentDetails, status } = YouTubeMediaData;
      const uploadStatus = get(YouTubeMediaData, "status.uploadStatus");
      const privacyStatus = get(YouTubeMediaData, "status.privacyStatus");
      const embeddable = get(YouTubeMediaData, "status.embeddable");

      if (!isObject(contentDetails) || !isObject(status) || uploadStatus !== "processed" || privacyStatus === "private" || !embeddable) {
        this.reply(lang.check.mediaUnavailable, { which }, 6e4);
        return true;
      }

      const regionRestriction = get(YouTubeMediaData, "contentDetails.regionRestriction");
      const MINIMUM_COUNTRIES_ALLOWED = 6;

      const allowed = get(regionRestriction, "allowed", []);
      const blocked = get(regionRestriction, "blocked", []);
      const denied = get(regionRestriction, "denied", []);

      const arraysCheck = (isArray(allowed) || isArray(denied) || isArray(blocked));

      if (isObject(regionRestriction) && arraysCheck) {
        if (isArray(denied) && denied.length >= MINIMUM_COUNTRIES_ALLOWED) {
          this.reply(lang.check.blockedTooMany, { count: denied.length, which }, 6e4);
          return true;
        } else if (isArray(blocked) && blocked.length >= MINIMUM_COUNTRIES_ALLOWED) {
          this.reply(lang.check.blockedTooMany, { count: blocked.length, which }, 6e4);
          return true;
        } else if (isArray(allowed) && allowed.length <= 231 && allowed.length > 0) {
          this.reply(lang.check.blockedTooMany, { count: `${245 - allowed.length}`, which }, 6e4);
          return true;
        } else if (isArray(denied) && denied.length <= MINIMUM_COUNTRIES_ALLOWED && denied.length > 0) {
          this.reply(lang.check.blockedIn, { countries: denied.length, which, }, 6e4);
          return true;
        } else if (isArray(blocked) && blocked.length <= MINIMUM_COUNTRIES_ALLOWED && blocked.length > 0) {
          this.reply(lang.check.blockedIn, { countries: blocked.length, which }, 6e4);
          return true;
        } else if (isArray(allowed) && allowed.length > 231) {
          this.reply(lang.check.blockedIn, { countries: `${245 - allowed.length}`, which, }, 6e4);
          return true;
        }
      }

      const title = get(YouTubeMediaData, "snippet.title", "The media specified");

      this.reply(lang.check.valid, { title }, 6e4);
      return true;
    },
  });
};
//       let YouTubeMediaID;
//       let which; // eslint-disable-line no-unused-vars

//       if (!args.length) {
//         const historyEntry = bot.plug.getMedia();

//         if (!isObject(historyEntry)) {
//           this.reply(lang.check.noMedia, {}, 6e4);
//           return false;
//         } else if (get(historyEntry, "format", 2) !== 1) {
//           this.reply(lang.check.notYouTube, {}, 6e4);
//           return false;
//         }

//         YouTubeMediaID = get(historyEntry, "cid");
//         which = "current";
//       } else {
//         YouTubeMediaID = bot.youtube.getMediaID(args.join(" "));
//         which = "specified";
//       }

//       if (isNil(YouTubeMediaID)) {
//         this.reply(lang.check.invalidYoutubeLink, {}, 6e4);
//         return false;
//       }

//       this.reply(lang.check.sendLink + YouTubeMediaID, { }, 6e4);
//       return true;
//     },
//   });
// };
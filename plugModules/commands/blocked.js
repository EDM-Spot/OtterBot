const {
  isObject, isArray, isNil, get,
} = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["blocked", "check"],
    minimumPermission: 2000,
    cooldownType: "perUse",
    cooldownDuration: 10,
    parameters: "[YouTube Link]",
    description: "Checks if media is unavailable in any sort of way",
    async execute(rawData, { args }, lang) { // eslint-disable-line no-unused-vars
      let YouTubeMediaID;
      let which;

      if (!args.length) {
        const currentMedia = bot.plug.getMedia();

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
        console.error("[!] YouTube getMedia Error");
        console.error(err);
        this.reply(lang.check.plausible, {}, 6e4);
        return true;
      }

      const { contentDetails, status } = YouTubeMediaData;
      const uploadStatus = get(YouTubeMediaData, "status.uploadStatus");
      const privacyStatus = get(YouTubeMediaData, "status.privacyStatus");
      const embeddable = get(YouTubeMediaData, "status.embeddable");

      if (!isObject(contentDetails) || !isObject(status) || uploadStatus !== "processed" || privacyStatus === "private" || !embeddable) {
        this.reply(lang.check.mediaUnavaialble, { which }, 6e4);
        return true;
      }

      const regionRestriction = get(YouTubeMediaData, "contentDetails.regionRestriction");
      const MINIMUM_COUNTRIES_ALLOWED = 5;

      const allowed = get(regionRestriction, "allowed", []);
      const blocked = get(regionRestriction, "blocked", []);
      const denied = get(regionRestriction, "denied", []);

      const arraysCheck = (isArray(allowed) || isArray(denied) || isArray(blocked));

      if (isObject(regionRestriction) && arraysCheck) {
        if (isArray(denied) && denied.length >= MINIMUM_COUNTRIES_ALLOWED) {
          this.reply(lang.check.blockedTooMany, { count: denied.length || 149, which }, 6e4);
          return true;
        } else if (isArray(blocked) && blocked.length >= MINIMUM_COUNTRIES_ALLOWED) {
          this.reply(lang.check.blockedTooMany, { count: blocked.length || 149, which }, 6e4);
          return true;
        } else if (isArray(allowed) && allowed.length <= MINIMUM_COUNTRIES_ALLOWED) {
          this.reply(lang.check.blockedTooMany, { count: allowed.length || 149, which }, 6e4);
          return true;
        } else if (isArray(denied) && denied.length <= MINIMUM_COUNTRIES_ALLOWED) {
          if (denied.length >= 20) {
            this.reply(lang.check.blockedIn, {
              countries: [...denied.splice(0, 20), `and ${denied.length} more.`].join(", "),
              which,
            }, 6e4);
            return true;
          }

          this.reply(lang.check.blockedIn, { countries: denied.join(", "), which }, 6e4);
          return true;
        } else if (isArray(blocked) && blocked.length <= MINIMUM_COUNTRIES_ALLOWED) {
          if (blocked.length >= 20) {
            this.reply(lang.check.blockedIn, {
              countries: [...blocked.splice(0, 20), `and ${blocked.length} more.`].join(", "),
              which,
            }, 6e4);
            return true;
          }

          this.reply(lang.check.blockedIn, { countries: blocked.join(", "), which }, 6e4);
          return true;
        } else if (isArray(allowed) && allowed.length >= MINIMUM_COUNTRIES_ALLOWED) {
          if (allowed.length >= 20) {
            this.reply(lang.check.blockedIn, {
              countries: [...allowed.splice(0, 20), `and ${allowed.length} more.`].join(", "),
              which,
            }, 6e4);
            return true;
          }

          this.reply(lang.check.blockedIn, { countries: allowed.join(", "), which }, 6e4);
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
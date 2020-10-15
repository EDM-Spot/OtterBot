const { isNil } = require("lodash");
const request = require("request-promise");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["genre"],
    minimumPermission: 0,
    cooldownType: "perUse",
    cooldownDuration: 60,
    parameters: "",
    description: "Check song genre.",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      const currentMedia = bot.plug.historyEntry();

      const options = {
        headers: {
          "User-Agent": "Request-Promise"
        },
        json: true
      };

      const title = currentMedia.media.title.replace(/\[.*?\]/g, "").trim();

      const genres = await request(`https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${bot.config.lastfm}&artist=${currentMedia.media.author}&track=${title}&autocorrect=1&format=json`, options)
      .then(function (body) {
        const genres = [];
        let found = false;

        if (isNil(body.track)) {
          return "Nothing Found";
        }

        if (body.track.toptags.tag.length !== 0) {
          for (var q = 0; q < body.track.toptags.tag.length; q++) {
            genres.push(" " + body.track.toptags.tag[q].name);
          }

          found = true;
        }
        //}

        if (!found) {
          return "Nothing Found. You can contribute here " + encodeURI(body.track.url);
        }

        var mySet = new Set(genres);
        var filteredArray = Array.from(mySet);

        if (filteredArray.length === 0) {
          return "Nothing Found. You can contribute here " + encodeURI(body.track.url);
        }
        else {
          return filteredArray;
        }
      }).catch((err) => {
        console.warn("[!] LastFM API Error");
        //console.error(err);
      });

      if (isNil(genres)) return false;

      this.reply(lang.genre, { genres: genres });
      return true;
    },
  });
};
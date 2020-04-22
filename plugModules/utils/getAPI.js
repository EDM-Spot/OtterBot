const { isNil } = require("lodash");
const fetch = require("node-fetch");

module.exports = function Util(bot) {
  class API {
    constructor() {
      this.catfactURL = "https://catfact.ninja/fact";
      this.urbanURL = "https://api.urbandictionary.com/v0/define?term=";
    }
    async getCatfact() {
      const options = {
        headers: {
          "User-Agent": "Request-Promise"
        },
        json: true
      };

      return await fetch(this.catfactURL)
        .then(res => res.json())
        .catch((err) => {
          console.warn("[!] Catfact API Error");
          //console.error(err);
        });
    }
    async getUrban(text) {
      const options = {
        headers: {
          "User-Agent": "Request-Promise"
        },
        json: true
      };

      return await fetch(this.urbanURL + text)
        .then(res => res.json())
        .then(body => body).catch((err) => {
          console.warn("[!] Urban API Error");
          //console.error(err);
        });
    }
    async getGiphy(text) {
      const options = {
        headers: {
          "User-Agent": "Request-Promise"
        },
        json: true
      };

      return await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${bot.config.giphy}&q=${text}&limit=10&offset=0&rating=G&lang=en`)
        .then(res => res.json())
        .then(body => body).catch((err) => {
          console.warn("[!] Giphy API Error");
          //console.error(err);
        });
    }
    async getSodas(user) {
      const options = {
        headers: {
          "User-Agent": "Request-Promise"
        },
        json: true
      };

      return await fetch(`https://api.icndb.com/jokes/random?firstName=${user}&lastName=&escape=javascript`)
        .then(res => res.json())
        .then(body => body).catch((err) => {
          console.warn("[!] Sodas API Error");
          //console.error(err);
        });
    }
    async getGenre(media) {
      const options = {
        headers: {
          "User-Agent": "Request-Promise"
        },
        json: true
      };

      const title = media.title.replace(/\[.*?\]/g, "").trim();

      return await fetch(`https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${bot.config.lastfm}&artist=${media.author}&track=${title}&autocorrect=1&format=json`)
        .then(res => res.json())
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
    }
  }

  bot.api = new API();
};
const { merge } = require("lodash");
const request = require("request");

global.Promise = require("bluebird");

module.exports = function Util(bot) {
  class SoundCloud {
    constructor(key) {
      // tracks?ids=CID.json&client_id=TOKEN
      this.baseURL = "https://api.soundcloud.com/";
      this.key = key;
    }
    req(endpoint, opts = {}) {
      const options = merge(opts, {
        json: true,
        query: {
          client_id: this.key,
        },
      });

      return request(this.baseURL + endpoint, options).then(res => res.body)
        .catch((err) => {
          console.error("[!] SoundCloud Util Error");
          console.error(err);
        });
    }
    resolve(url) {
      return this.req("resolve", { query: { url } });
    }
    getTrack(id) {
      return this.req("tracks", { query: { ids: `${id}.json` } }).get(0);
    }
  }

  bot.soundcloud = new SoundCloud(bot.config.soundcloud);
};
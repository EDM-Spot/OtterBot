const { merge } = require("lodash");
const request = require("request-promise");

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
        qs: {
          client_id: this.key,
        },
        headers: {
          "User-Agent": "Request-Promise"
        },
        json: true
      });

      return request(this.baseURL + endpoint, options).catch((err) => {
        console.error("[!] SoundCloud Util Error");
        console.error(err);
      });
    }
    resolve(url) {
      //return this.req("resolve", { query: { url } });
      return request(this.baseURL + "resolve.json?url=" + url + "&client_id=" + this.key).catch((err) => {
        console.error("[!] SoundCloud Resolve Util Error");
        console.error(err);
      });
    }
    getTrack(id) {
      return this.req("tracks/" + id);
    }
    getStream(id) {
      return this.req("tracks/" + id + "/stream");
    }
  }

  bot.soundcloud = new SoundCloud(bot.config.soundcloud);
};
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
    async req(endpoint, opts = {}) {
      const options = merge(opts, {
        qs: {
          client_id: this.key,
        },
        headers: {
          "User-Agent": "Request-Promise"
        },
        json: true
      });

      try {
        return request(this.baseURL + endpoint, options);
      }
      catch (err) {
        console.error("[!] SoundCloud Util Error");
        console.error(err);
      }
    }
    async resolve(url) {
      //return this.req("resolve", { query: { url } });
      try {
        return request(this.baseURL + "resolve.json?url=" + url + "&client_id=" + this.key);
      }
      catch (err) {
        console.error("[!] SoundCloud Resolve Util Error");
        console.error(err);
      }
    }
    async getTrack(id) {
      return await this.req("tracks/" + id);
    }
    async getStream(id) {
      return await this.req("tracks/" + id + "/stream");
    }
  }

  bot.soundcloud = new SoundCloud(bot.config.soundcloud);
};
const { isObject, get, merge } = require("lodash");
const request = require("request-promise");

module.exports = function Util(bot) {
  class YouTube {
    constructor(key) {
      this.baseURL = "https://www.googleapis.com/youtube/v3";
      this.ytrestrictURL = "http://polsy.org.uk/stuff/ytrestrict.cgi?ytid=";
      this.fullRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
      this.key = key;
    }
    req(method, endpoint, body = {}, opts = {}) {
      const options = merge(opts, {
        qs: {
          key: this.key,
        },
        headers: {
          "User-Agent": "Request-Promise"
        },
        json: true
      });

      if (Array.isArray(get(options, "qs.part"))) {
        options.qs.part = options.qs.part.join(",");
      }

      if (["POST", "PUT"].includes(method.toUpperCase()) && isObject(body)) {
        options.body = body;
      }

      return request[method.toLowerCase()](this.baseURL + endpoint, options).catch((err) => {
        console.error("[!] Youtube Util Error");
        console.error(err);
      });
    }
    getMediaID(link) {
      try {
        return (link.match(this.fullRegex)[1]);
      }
      catch (err) {
        return undefined;
      }
    }
    getMedia(id) {
      return this.req("GET", "/videos", null, {
        qs: {
          part: ["snippet", "contentDetails", "statistics", "status"],
          id,
        },
      }).then((res) => {
        if (isObject(get(res, "items[0]"))) {
          return get(res, "items[0]", {});
        }

        throw Error(`[!] Unexpected YouTube Response\n${JSON.stringify(res, null, 4)}`);
      });
    }
  }

  bot.youtube = new YouTube(bot.config.youtube);
};
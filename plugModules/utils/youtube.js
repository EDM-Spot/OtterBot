const { isObject, get, merge } = require("lodash");
const request = require("request");

module.exports = function Util(bot) {
  class YouTube {
    constructor(key) {
      this.baseURL = "https://www.googleapis.com/youtube/v3";
      this.ytrestrictURL = "http://polsy.org.uk/stuff/ytrestrict.cgi?ytid=";
      this.shortlinkRegex = /youtu\.be\//g;
      this.linkRegex = /watch\?/g;
      this.key = key;
    }
    req(method, endpoint, body = {}, opts = {}) {
      const options = merge(opts, {
        json: true,
        query: {
          key: this.key,
        },
      });

      if (Array.isArray(get(options, "query.part"))) {
        options.query.part = options.query.part.join(",");
      }

      if (["POST", "PUT"].includes(method.toUpperCase()) && isObject(body)) {
        options.body = body;
      }

      return request[method.toLowerCase()](this.baseURL + endpoint, options).then(res => res.body)
        .catch((err) => {
          console.error("[!] YouTube Util Error");
          console.error(err);
        });
    }
    getMediaID(link) {
      if (this.shortlinkRegex.test(link)) {
        return link.split(this.shortlinkRegex)[1].split("?")[0];
      } else if (this.linkRegex.test(link)) {
        return link.split("v=")[1].split("&")[0];
      }

      return undefined;
    }
    getMedia(id) {
      return this.req("GET", "/videos", null, {
        query: {
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
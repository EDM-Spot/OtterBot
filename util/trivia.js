const { isObject, get, merge } = require("lodash");
const request = require("request-promise");

module.exports = (client) => {
  class TriviaUtil {
    constructor() {
      this.baseURL = "https://opentdb.com/api.php?amount=50&type=boolean";

      this.players = [];
      this.timer = undefined;
      this.running = false;
    }
    
    async start() {
      this.running = true;
    }

    end() {
      this.running = false;
      this.timer = undefined;
      this.players = [];

      return true;
    }

    add(id) {
      if (!this.players.includes(id)) {
        this.players.push(id);
        return true;
      }

      return false;
    }

    req(method, body = {}, opts = {}) {
      const options = merge(opts, {
        headers: {
          "User-Agent": "Request-Promise"
        },
        json: true
      });

      if (["POST", "PUT"].includes(method.toUpperCase()) && isObject(body)) {
        options.body = body;
      }

      return request[method.toLowerCase()](this.baseURL, options).catch((err) => {
        console.error("[!] Trivia Util Error");
        console.error(err);
      });
    }

    getQuestion() {
      return this.req("GET", null, { }).then((res) => {
        if (isObject(get(res, "results[0]"))) {
          return get(res, "results[0]", {});
        }

        throw Error(`[!] Unexpected Opentdb Response\n${JSON.stringify(res, null, 4)}`);
      });
    }
  }

  client.trivia = new TriviaUtil();
};
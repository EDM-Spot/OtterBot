const { isNil, isObject, get, merge } = require("lodash");
const request = require("request-promise");

module.exports = (client) => {
  class TriviaUtil {
    constructor() {
      this.token = "92e8423b62804fa8ca655ca697a0d669bdcf6e8645dfe1fce03d77a28b02a86f";
      this.baseURL = `https://opentdb.com/api.php?amount=50&type=boolean&token=${this.token}`;
      this.resetURL = `https://opentdb.com/api_token.php?command=reset&token=${this.token}`;

      this.players = [];
      this.timer = undefined;
      this.running = false;
    }
    
    start() {
      this.running = true;
      this.players = [];
    }

    end() {
      this.running = false;
      this.timer = undefined;
      this.players = [];

      return true;
    }

    check() {
      return this.running;
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

      return request[method.toLowerCase()](this.baseURL, options).catch(async (err) => {
        if (err.code === 4) {
          try {
            await this.resetToken();
          } catch (error) {
            console.warn(`Failed to reset token - ${error.message}`);
            return false;
          }

          return await this.getQuestion();
        }
        
        console.warn("[!] Trivia Util Error");
        console.warn(err);
      });
    }

    async getQuestion() {
      return this.req("GET", null, { }).then((res) => {
        if (isObject(get(res, "results[0]"))) {
          return get(res, "results[0]", {});
        }

        throw Error(`[!] Unexpected Opentdb Response\n${JSON.stringify(res, null, 4)}`);
      });
    }

    async resetToken() {
      return request(this.resetURL).catch(async (err) => {
        console.warn("[!] Trivia Token Reset Error");
        console.warn(err);
      });
    }

    async getUsername(discord) {
      const userDB = await client.db.models.users.findOne({
        where: {
          discord: discord,
        },
      });
  
      if (isNil(userDB)) {
        return null;
      }
  
      const userID = userDB.get("id");
  
      const plugUser = client.plug.getUser(userID);
  
      if (!plugUser || typeof plugUser.username !== "string" || !plugUser.username.length) {
        return null;
      }
  
      return plugUser.username;
    }

    async moveWinner(discord) {
      const userDB = await client.db.models.users.findOne({
        where: {
          discord: discord,
        },
      });
  
      if (isNil(userDB)) {
        return null;
      }
  
      const userID = userDB.get("id");
  
      const plugUser = client.plug.getUser(userID);
  
      if (!plugUser || typeof plugUser.username !== "string" || !plugUser.username.length) {
        return null;
      }

      await client.plug.sendChat("@" + plugUser.username + " Won the Discord Trivia! Moving to 1...");
  
      return client.queue.add(plugUser, 1);
    }
  }

  client.triviaUtil = new TriviaUtil();
};
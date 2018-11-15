const Command = require("../base/Command.js");
const { isNil, isObject } = require("lodash");

class Ping extends Command {
  constructor(client) {
    super(client, {
      name: "join",
      description: "Join Trivia.",
      usage: "join",
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    try {
      const price = 0;

      const userDB = await this.client.db.models.users.findOne({
        where: {
          discord: message.author.id,
        },
      });

      if (isNil(userDB)) {
        return message.reply("You need to link your account first!");
      }

      const userID = userDB.get("discord");

      const dj = this.client.plug.getDJ();
      const userPos = this.client.plug.getWaitListPosition(userID);

      const user = this.client.plug.getUser(userDB.get("id"));

      if (!user || typeof user.username !== "string" || !user.username.length) {
        return message.reply("You're not online on plug!");
      }

      if (!this.client.triviaUtil.check()) {
        return message.reply("Trivia is not running!");
      } else if (isObject(dj) && dj.id === userID) {
        //return message.reply("You can't join while playing!");
      } else if (userPos >= 1 && userPos <= 10) {
        //return message.reply("You are too close to DJ.");
      }

      if (this.client.triviaUtil.players.includes(userID)) return true;

      const [inst] = await this.client.db.models.users.findOrCreate({ where: { id: userDB.get("id") }, defaults: { id: userDB.get("id") } });

      const props = inst.get("props");

      if (props < price) {
        return message.reply("You don't have enough props.");
      }

      await inst.decrement("props", { by: price });

      this.client.triviaUtil.add(userID);
      await this.client.guilds.get("485173051432894489").members.get(message.author.id).addRole("512635547320188928").catch(console.error);

      return true;
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Ping;

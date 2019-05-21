const Command = require("../base/Command.js");
const { isNil, isObject } = require("lodash");
const moment = require("moment");

class Join extends Command {
  constructor(client) {
    super(client, {
      name: "join",
      description: "Join Trivia.",
      usage: "join"
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    try {
      message.delete();
      
      const day = moment().isoWeekday();
      const isWeekend = (day === 6) || (day === 7);

      let price = 3;
    
      if (isWeekend) {
        price = 0;
      }

      const userDB = await this.client.db.models.users.findOne({
        where: {
          discord: message.author.id,
        },
      });

      if (isNil(userDB)) {
        return message.reply("You need to link your account first! Read how here: https://edmspot.tk/faq");
      }

      const userID = userDB.get("discord");

      const user = this.client.plug.getUser(userDB.get("id"));

      const dj = this.client.plug.getDJ();

      if (!user || typeof user.username !== "string" || !user.username.length) {
        return message.reply("You're not online on plug!");
      }

      const userPos = this.client.plug.getWaitListPosition(user.id);

      if (!this.client.triviaUtil.check()) {
        return message.reply("Trivia is not running!");
      } else if (this.client.triviaUtil.started) {
        return message.reply("Trivia already started!");
      } else if (isObject(dj) && dj.id === user.id) {
        return message.reply("You can't join while playing!");
      } else if (userPos >= 0 && userPos <= 5) {
        return message.reply("You are too close to DJ.");
      }

      if (this.client.triviaUtil.players.includes(userID)) return true;

      const [inst] = await this.client.db.models.users.findOrCreate({ where: { id: user.id }, defaults: { id: user.id } });

      const props = inst.get("props");

      if (props < price) {
        return message.reply("You don't have enough props.");
      }

      await inst.decrement("props", { by: price });
      await this.client.db.models.users.increment("props", { by: price, where: { id: "40333310" } });

      this.client.triviaUtil.add(userID);
      await this.client.guilds.get("485173051432894489").members.get(message.author.id).addRole("512635547320188928").catch(console.error);

      return message.reply("Joined Trivia.");
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Join;

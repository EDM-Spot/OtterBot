const Command = require("../base/Command.js");
const moment = require("moment");

class Free extends Command {
  constructor(client) {
    super(client, {
      name: "free",
      description: "Daily Props.",
      usage: "free"
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    try {
      //message.delete();

      if (message.channel.id !== "695987344280649839") {
        return true;
      }

      const cooldown = await this.client.redis.getCommandOnCoolDown("discord", "free@use", "perUser", message.author.id);

      if (cooldown != -2) {
        message.delete();
        return true;
      }

      const isDecember = (moment().month() === 11);

      let props = 2;
      let returnMessage = "You got your daily 2 props. Come back tomorrow for more free props!";

      const userDB = await this.client.db.models.users.findOne({
        where: {
          discord: message.author.id,
        },
      });

      if (isDecember) {
        props = 10;

        returnMessage = "<:christmasbells:784162299992735795> Merry Christmas! You got your daily 10 props. Come back tomorrow for more free props! <:christmasbells:784162299992735795>";
      }

      await this.client.db.models.users.increment("props", { by: props, where: { id: userDB.get("id") } });

      await this.client.redis.placeCommandOnCooldown("discord", "free@use", "perUser", message.author.id, 86400);

      return await message.reply(returnMessage);
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Free;

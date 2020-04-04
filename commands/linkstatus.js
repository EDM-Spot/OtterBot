const Command = require("../base/Command.js");
const { isNil } = require("lodash");
const { ROLE } = require("miniplug");

class Link extends Command {
  constructor(client) {
    super(client, {
      name: "linkstatus",
      description: "Check your link status with your plug.dj account.",
      usage: "linkstatus",
      aliases: ["linkstatus"]
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    try {
      const userDB = await this.client.db.models.users.findOne({
        where: {
          discord: message.author.id,
        },
      });

      if (!isNil(userDB)) {
        const statusRole = "695994210603630633";
        await this.client.guilds.cache.get("485173051432894489").members.cache.get(message.author.id).roles.add(statusRole).catch(console.error);

        return message.reply("Your Account is linked with plug.dj!");
      } else {
        return message.reply("Your Account isn't linked! Use -link <Plug ID>");
      }
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Link;

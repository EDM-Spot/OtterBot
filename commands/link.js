const Command = require("../base/Command.js");
const { isNil } = require("lodash");

class Link extends Command {
  constructor(client) {
    super(client, {
      name: "link",
      description: "Link your discord with plug.dj account.",
      usage: "link <plugID>",
      aliases: ["link"]
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    if (!args || args.size < 1) return message.reply("Must provide your ID");
    try {
      const user = await this.client.db.models.users.findOne({
        where: {
          id: args[0],
        },
      });

      if (isNil(user)) return message.reply("Can't find your ID. Login in plug.dj, join the room and try again.");

      const userID = await this.client.db.models.users.findOne({
        where: {
          discord: message.author.id,
        },
      });

      if (!isNil(userID)) {
        const discordName = this.client.users.get(userID.get("discord")).displayName;
        return message.reply("That ID it's already linked with " + discordName);
      }

      await this.client.db.models.users.update(
        { discord: message.author.id },
        { where: { id: args[0] }, defaults: { id: args[0] }}
      );

      console.log(user);
      await message.reply(message.author.username + " linked with plug Account: " + user.get("username"));
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Link;

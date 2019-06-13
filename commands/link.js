const Command = require("../base/Command.js");
const { isNil } = require("lodash");
const { ROOM_ROLE } = require("plugapi");

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

      if (!isNil(user.get("discord"))) {
        const discordName = this.client.users.get(user.get("discord")).username;
        return message.reply("That ID it's already linked with " + discordName);
      }

      const userID = await this.client.db.models.users.findOne({
        where: {
          discord: message.author.id,
        },
      });

      if (!isNil(userID)) {
        return message.reply("You already linked your account!");
      }

      await this.client.db.models.users.update(
        { discord: message.author.id },
        { where: { id: args[0] }, defaults: { id: args[0] }}
      );

      const userPlug = this.client.plug.getUser(args[0]);

      if (!isNil(userPlug)) {
        if (userPlug.role === ROOM_ROLE.RESIDENTDJ) {
          const role = "485174834448564224";
          await this.client.guilds.get("485173051432894489").members.get(message.author.id).addRole(role).catch(console.error);
        }
      }

      await this.client.generateCSS.generateIcons();

      await message.reply(message.author.username + " linked with plug Account: " + user.get("username"));
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Link;

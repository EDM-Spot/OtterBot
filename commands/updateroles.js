const Command = require("../base/Command.js");
const { isNil } = require("lodash");
const { ROLE } = require("miniplug");

class UpdateRoles extends Command {
  constructor(client) {
    super(client, {
      name: "updateroles",
      description: "Update Roles.",
      usage: "updateroles",
      aliases: ["updateroles"],
      permLevel: "Bot Developer"
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    message.guild.members.fetch().then(async member => {
      try {
        console.log("Checking " + member.user.username);

        const userDB = await this.client.db.models.users.findOne({
          where: {
            discord: member.user.id,
          },
        });

        if (!isNil(userDB)) {
          const statusRole = "695994210603630633";
          await member.roles.add(statusRole).catch(console.error);

          console.log(member.user.username + " Account is linked with plug.dj!");

          const rdjRole = "485174834448564224";
          const plugUser = await this.client.plug.getUser(userDB.id);

          if (member.roles.has(rdjRole)) {
            if (plugUser.role != ROLE.DJ) {
              await member.roles.remove(rdjRole).catch(console.error);

              console.log(member.user.username + " RDJ Role Removed!");
            }
          } else {
            if (plugUser.role === ROLE.DJ) {
              await member.roles.add(rdjRole).catch(console.error);

              console.log(member.user.username + " RDJ Role Added!");
            }
          }
        }
      }
      catch {
        console.error("Failed to load");
      }
    }).catch(console.error);
  }
}

module.exports = UpdateRoles;

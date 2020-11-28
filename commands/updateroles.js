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
    message.guild.members.fetch().then(async members => {
      let i = 0;
      members.forEach(async member => {
        try {
          console.log("Checking " + i + "/" + members.length + " " + member.user.username);
          i++;

          const userDB = await this.client.db.models.users.findOne({
            where: {
              discord: member.user.id,
            },
          });

          if (!isNil(userDB)) {
            const statusRole = "695994210603630633";

            if (member.roles.has(statusRole)) {
              await member.roles.add(statusRole).catch(console.warn);

              console.log(member.user.username + " Account is linked with plug.dj!");
            }

            const rdjRole = "485174834448564224";
            const plugUser = await this.client.plug.getUser(userDB.id);

            if (member.roles.has(rdjRole)) {
              if (plugUser.role != ROLE.DJ) {
                await member.roles.remove(rdjRole).catch(console.warn);

                console.log(member.user.username + " RDJ Role Removed!");
              }
            } else {
              if (plugUser.role === ROLE.DJ) {
                await member.roles.add(rdjRole).catch(console.warn);

                console.log(member.user.username + " RDJ Role Added!");
              }
            }
          }
        }
        catch {
          ///Error
        }
      });
    }).catch(console.warn);
  }
}

module.exports = UpdateRoles;

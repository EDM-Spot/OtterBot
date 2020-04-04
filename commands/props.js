const Command = require("../base/Command.js");
const { isNil, isObject } = require("lodash");

function generateIdentifier(currentMedia, dj, id) {
  if (isNil(dj)) {
    console.warn("Discord Props Error!");
    return null;
  }
  return `historyID-${currentMedia.id}:dj-${dj.id}:user-${id}`;
}

class Props extends Command {
  constructor(client) {
    super(client, {
      name: "props",
      description: "Give Props to a song.",
      usage: "props"
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    try {
      //message.delete();

      const cooldown = await this.client.redis.getCommandOnCoolDown("discord", "props@use", "perUser", message.author.id);

      if (cooldown != -2) {
        message.delete();
        return true;
      }

      const userDB = await this.client.db.models.users.findOne({
        where: {
          discord: message.author.id,
        },
      });

      const currentMedia = this.client.plug.historyEntry();
      const dj = this.client.plug.dj();
      
      if (!isObject(currentMedia)) {
        return false;
      } else if (isObject(dj) && dj.id === userDB.get("id")) {
        return true;
      }
      
      await this.client.db.models.props.findOrCreate({
        where: { identifier: generateIdentifier(currentMedia.id, dj, userDB.get("id")) },
        defaults: {
          id: userDB.get("id"),
          dj: dj.id,
          historyID: `${currentMedia.id}`,
          identifier: generateIdentifier(currentMedia, dj, userDB.get("id")),
        },
      });

      await this.client.redis.placeCommandOnCooldown("discord", "props@use", "perUser", message.author.id, 60);

      return true;
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Props;

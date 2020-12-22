const Command = require("../base/Command.js");
const Discord = require("discord.js");
const { fn, col } = require("sequelize");
const { isNil } = require("lodash");
const moment = require("moment");

class Who extends Command {
  constructor(client) {
    super(client, {
      name: "who",
      description: "Check someone plug profile.",
      usage: "who @user|id",
      aliases: ["who"]
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    const cooldown = await this.client.redis.getCommandOnCoolDown("discord", "who@info", "perUser", message.author.id);

    const discordMention = this.client.getUserFromMention(args[0]);
    let idMention;

    if (!discordMention) {
      idMention = await this.client.plug.getUser(args[0]);

      if (!idMention) { return; }
    }

    if (cooldown != -2 && level < 9) {
      return;
    }

    try {
      let userDB;

      if (discordMention) {
        userDB = await this.client.db.models.users.findOne({
          where: {
            discord: discordMention.id,
          },
        });
      } else {
        userDB = await this.client.db.models.users.findOne({
          where: {
            id: idMention.id,
          },
        });
      }

      if (!isNil(userDB)) {

        await this.client.redis.placeCommandOnCooldown("discord", "who@info", "perUser", message.author.id, 3600);

        const plugUser = await this.client.plug.getUser(userDB.id);

        const propsGiven = await this.client.db.models.props.count({ where: { id: userDB.id } });

        const playsCount = await this.client.db.models.plays.count({
          where: { dj: userDB.id, skipped: false }
        });

        const songVotes = await this.client.db.models.plays.findAll({
          attributes: [
            [fn("SUM", col("plays.woots")
            ), "totalwoots"],
            [fn("SUM", col("plays.grabs")
            ), "totalgrabs"]],
          where: {
            dj: userDB.id,
            skipped: false
          },
          group: ["dj"]
        });

        const songVotesMehs = await this.client.db.models.plays.findAll({
          attributes: [
            [fn("SUM", col("plays.mehs")
            ), "totalmehs"]],
          where: {
            dj: userDB.id
          },
          group: ["dj"]
        });

        let color;
        const a = await this.client.guilds.cache.get("485173051432894489").members.cache.get(userDB.discord);

        if (isNil(a)) {
          return await message.reply("User not in discord!");
        }

        if (await a.roles.cache.get("490618109347233804")) {
          color = "#d1aa0d";
        } else if (await a.roles.cache.get("485175393054097416")) {
          color = "#cc3333";
        } else if (await a.roles.cache.get("485175078867304488")) {
          color = "#9b40e7";
        } else if (await a.roles.cache.get("485774995163971597")) {
          color = "#9b40e7";
        } else if (await a.roles.cache.get("485174834448564224")) {
          color = "#33ccff";
        } else {
          color = "#b8b8b8";
        }

        let userImage = `https://edmspot.ml/public/images/badges/${userDB.badge}`;

        if (!isNil(userDB.badge)) {
          userImage = `https://edmspot.ml/public/images/badges/${userDB.badge}`;
        } else {
          userImage = a.user.displayAvatarURL();
        }

        const embed = new Discord.MessageEmbed()
          .setColor(color)
          .setAuthor(plugUser.username, a.user.displayAvatarURL(), `https://plug.dj/@/${plugUser.username}`)
          .setTitle(`Discord: ${a.user.tag}`)
          .setThumbnail(userImage)
          .addField("ID", userDB.id, true)
          .addField("Joined Room", moment(userDB.createdAt).format("DD/MM/YYYY HH:mm"), true)
          .addField("Joined Discord", moment(a.joinedTimestamp).format("DD/MM/YYYY HH:mm"), true)
          .addField("Props", userDB.props, true)
          .addField("Props Given", propsGiven, true)
          .addField("Songs Played", playsCount, true)
          .addField("<:plugGrab:486538625270677505>", songVotes[0].dataValues.totalgrabs, true)
          .addField("<:plugWoot:486538570715103252>", songVotes[0].dataValues.totalwoots, true)
          .addField("<:plugMeh:486538601044115478>", songVotesMehs[0].dataValues.totalmehs, true)
          .setFooter("EDM Spot")
          .setTimestamp();

        return await message.channel.send({ embed });
      } else {
        return await message.reply("This Account isn't linked!");
      }
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Who;

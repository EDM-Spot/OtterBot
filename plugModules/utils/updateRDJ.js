const { isNil, isNaN, isObject } = require("lodash");
const { ROLE } = require("miniplug");
const { Op, fn, col } = require("sequelize");
const moment = require("moment");

module.exports = function Util(bot) {
  const util = {
    name: "updateRDJ",
    function: async (id) => {
      if (isNil(id)) return false;

      const user = bot.plug.user(id);

      const totalsongs = await bot.db.models.plays.count({
        where: { skipped: false }
      });

      const playsmehcount = await bot.db.models.plays.count({
        where: {
          skipped: true,
          mehs: {
            [Op.gt]: 4
          }
        }
      });

      const totalmessages = await bot.db.models.messages.count({
        where: { id: id, command: false, deleted_by: null }
      });

      const userDB = await bot.db.models.users.findOne({
        where: {
          id: id
        },
      });

      if (isNil(userDB)) {
        await user.setRole(0);
        return true;
      }

      const propsgiven = await bot.db.models.props.count({ where: { id } });

      const playscount = await bot.db.models.plays.count({
        where: { dj: id, skipped: false }
      });

      const bancount = await bot.db.models.bans.count({
        where: { id: id, type: "BAN" }
      });

      const mutecount = await bot.db.models.bans.count({
        where: { id: id, type: "MUTE" }
      });

      const wlbancount = await bot.db.models.bans.count({
        where: { id: id, type: "WLBAN" }
      });

      const songvotes = await bot.db.models.plays.findAll({
        attributes: [
          [fn("SUM", col("plays.woots")
          ), "totalwoots"],
          [fn("SUM", col("plays.grabs")
          ), "totalgrabs"]],
        where: {
          dj: id,
          skipped: false
        },
        group: ["dj"]
      });

      const songVotesMehs = await bot.db.models.plays.findAll({
        attributes: [
          [fn("SUM", col("plays.mehs")
          ), "totalmehs"]],
        where: {
          dj: id
        },
        group: ["dj"]
      });

      const totalbans = ((bancount * bot.global.pointsWeight.ban) + (mutecount * bot.global.pointsWeight.mute) + (wlbancount * bot.global.pointsWeight.wlban)) * 100;

      const propsGivenPoints = propsgiven * bot.global.pointsWeight.propsGiven;
      const totalMessagesPoints = (totalmessages + userDB.get("points")) * bot.global.pointsWeight.messages;

      let totalWootsPoints = 0;
      let totalGrabsPoints = 0;
      let totalMehsPoints = 0;

      if (!isNil(songvotes[0])) {
        totalWootsPoints = songvotes[0].dataValues.totalwoots * bot.global.pointsWeight.woots;
        totalGrabsPoints = songvotes[0].dataValues.totalgrabs * bot.global.pointsWeight.grabs;
      }

      if (!isNil(songVotesMehs[0])) {
        totalMehsPoints = songVotesMehs[0].dataValues.totalmehs * bot.global.pointsWeight.mehs;
      }

      const offlineDaysPoints = ((moment().diff(userDB.get("last_seen"), "days") * bot.global.pointsWeight.daysOffline) * 100) + 1;

      const points = propsGivenPoints + totalMessagesPoints + ((((totalWootsPoints + totalGrabsPoints) / (totalMehsPoints + 1)) - (offlineDaysPoints + totalbans)) * ((playscount / (totalsongs + playsmehcount)) * 100));

      const role = "485174834448564224"; //bot.guilds.cache.get("485173051432894489").roles.find(r => r.name === "RDJ");

      if (isNaN(points)) {
        await user.setRole(0);
        return true;
      }

      if (isObject(user)) {
        if (user.role >= ROLE.BOUNCER || user.gRole >= ROLE.SITEMOD) return false;

        if (user.role === ROLE.DJ) {
          const tolerance = 20;
          const userPoints = points + tolerance;

          if (((userPoints < 100 && playscount < 250) || (userPoints < 50 && playscount > 250)) || playscount < 150) {
            await bot.plug.setRole(id, 1000);

            if (!isNil(userDB.get("discord"))) {
              await bot.guilds.cache.get("485173051432894489").members.cache.get(userDB.get("discord")).roles.remove(role).catch(console.error);
            }

            bot.plug.chat(bot.utils.replace(bot.lang.rdjDemoted, {
              user: user.username
            }));
          }
        } else {
          const joined = moment().diff(userDB.get("createdAt"), "months");

          if ((points >= 100 && joined >= 1 && playscount >= 150) || (points >= 50 && joined >= 1 && playscount >= 250)) {
            await bot.plug.setRole(id, 1000);

            if (!isNil(userDB.get("discord"))) {
              await bot.guilds.cache.get("485173051432894489").members.cache.get(userDB.get("discord")).roles.add(role).catch(console.error);
            }

            bot.plug.chat(bot.utils.replace(bot.lang.rdjPromoted, {
              user: user.username
            }));
          }
        }
      } else {
        const getAllStaff = await bot.plug.getStaff();

        const offUser = getAllStaff.filter(u => u.id === id);

        if (isNil(offUser[0])) return false;
        if (offUser[0].role >= ROLE.BOUNCER || offUser[0].gRole >= ROLE.SITEMOD) return false;

        if (offUser[0].role === ROLE.DJ) {
          const tolerance = 20;
          const userPoints = points + tolerance;

          if (((userPoints < 100 && playscount < 250) || (userPoints < 50 && playscount > 250)) || playscount < 150) {
            const user = await bot.plug.getUser(offUser[0].id);
            await user.setRole(0);

            if (!isNil(userDB.get("discord"))) {
              await bot.guilds.cache.get("485173051432894489").members.cache.get(userDB.get("discord")).roles.remove(role).catch(console.error);
            }

            await bot.plug.chat(bot.utils.replace(bot.lang.rdjDemoted, {
              user: offUser[0].username
            }));
          }
        };
      }

      return true;
    },
  };

  bot.utils.register(util);
};
const { isNil, isObject } = require("lodash");
const { ROOM_ROLE, GLOBAL_ROLES } = require("plugapi");
const { fn, col } = require("sequelize");
const moment = require("moment");

//-eval this.client.plug.getAllStaff((err, data) => console.log(data.filter(u => u.id === 4838584)));

module.exports = function Util(bot) {
  const util = {
    name: "updateRDJ",
    function: async (id) => {
      if (isNil(id)) return false;

      const user = bot.plug.getUser(id);

      const totalsongs = await bot.db.models.plays.count({
        where: { skipped: false }
      });

      const totalmessages = await bot.db.models.messages.count({
        where: { id: id, command: false }
      });

      const userDB = await bot.db.models.users.findOne({
        where: {
          id: id
        },
      });

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
          [fn("SUM", col("plays.mehs")
          ), "totalmehs"],
          [fn("SUM", col("plays.grabs")
          ), "totalgrabs"]],
        where: {
          dj: id,
          skipped: false
        },
        group: ["dj"]
      });

      const totalbans = ((bancount * 4.5) + (mutecount * 2.75) + (wlbancount * 3.25) * 100);

      const propsGivenPoints = propsgiven * 1.75;
      const totalMessagesPoints = (totalmessages + userDB.get("points")) * 1.55;

      const totalWootsPoints = songvotes[0].dataValues.totalwoots * 0.75;
      const totalGrabsPoints = songvotes[0].dataValues.totalgrabs * 3.5;
      const totalMehsPoints = songvotes[0].dataValues.totalmehs * 8.75;

      const offlineDaysPoints = (moment().diff(userDB.get("last_seen"), "days") * 100) + 1;

      const points = ((propsGivenPoints + totalMessagesPoints + ((totalWootsPoints * totalGrabsPoints) / playscount) - ((totalMehsPoints * offlineDaysPoints) + totalbans)) / totalsongs) * 1000;

      //const role = bot.guild.roles.find(r => r.name === "RDJ");

      if (isObject(user)) {
        if (user.role >= ROOM_ROLE.BOUNCER || user.gRole >= GLOBAL_ROLES.MODERATOR) return false;

        if (user.role === ROOM_ROLE.RESIDENTDJ) {
          const tolerance = 30;
          const userPoints = points + tolerance;

          if (userPoints < 700) {
            //await bot.plug.moderateSetRole(user.id, ROOM_ROLE.NONE);
            console.log("Should Demote Online");

            if (!isNil(userDB.get("discord"))) {
              //bot.users.get(userDB.get("discord")).removeRole(role).catch(console.error);
            }

            //await bot.plug.sendChat(bot.utils.replace(bot.lang.rdjPromoted, {
            //  user: user.username
            //}));
          }
        } else {
          const joined = moment().diff(userDB.get("created_at"), "months");

          if (points >= 700 && joined >= 1 && playscount >= 150) {
            //await bot.plug.moderateSetRole(user.id, ROOM_ROLE.RESIDENTDJ);
            console.log("Should Promote Online");

            if (!isNil(userDB.get("discord"))) {
              //bot.users.get(userDB.get("discord")).addRole(role).catch(console.error);
            }

            //await bot.plug.sendChat(bot.utils.replace(bot.lang.rdjDemoted, {
            //  user: user.username
            //}));
          }
        }
      } else {
        bot.plug.getAllStaff((err, data) => {
          const offUser = data.filter(u => u.id === id);
          console.log(offUser);
          if (isObject(offUser)) return false;
          if (offUser.role >= ROOM_ROLE.BOUNCER || offUser.gRole >= GLOBAL_ROLES.MODERATOR) return false;

          if (offUser.role === ROOM_ROLE.RESIDENTDJ) {
            const tolerance = 30;
            const userPoints = points + tolerance;
  
            if (userPoints < 700) {
              //await bot.plug.moderateSetRole(offUser.id, ROOM_ROLE.NONE);
              console.log("Should Demote Offline");
  
              if (!isNil(userDB.get("discord"))) {
                //bot.users.get(userDB.get("discord")).removeRole(role).catch(console.error);
              }
  
              //bot.plug.sendChat(bot.utils.replace(bot.lang.rdjPromoted, {
              //  user: offUser.username
              //}));
            }
          } else {
            const joined = moment().diff(userDB.get("created_at"), "months");
  
            if (points >= 700 && joined >= 1 && playscount >= 150) {
              //bot.plug.moderateSetRole(offUser.id, ROOM_ROLE.RESIDENTDJ);
              console.log("Should Promote Offline");
  
              if (!isNil(userDB.get("discord"))) {
                //bot.users.get(userDB.get("discord")).addRole(role).catch(console.error);
              }
  
              //bot.plug.sendChat(bot.utils.replace(bot.lang.rdjDemoted, {
              //  user: offUser.username
              //}));
            }
          }
        });
      }

      return true;
    },
  };

  bot.utils.register(util);
};
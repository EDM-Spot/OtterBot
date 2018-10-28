const { isNil } = require("lodash");
const { ROOM_ROLE, GLOBAL_ROLES } = require("plugapi");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["updaterdj"],
    minimumPermission: 4000,
    cooldownType: "perUse",
    cooldownDuration: 2,
    parameters: "",
    description: "Update RDJ.",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      const totalusers = await bot.db.models.users.count();
      console.log(totalusers);
      
      bot.plug.getAllStaff(async (err, data) => {
        var i = 0;
        var interval = setInterval(function() {          
          if (isNil(data[0])) return false;
          if (data[0].role >= ROOM_ROLE.BOUNCER || data[0].gRole >= GLOBAL_ROLES.MODERATOR) return false;

          if (data[0].role === ROOM_ROLE.RESIDENTDJ) {
            bot.utils.updateRDJ(data[i].id);
          }
          i++;
          if (i === data.length) clearInterval(interval);
        }, 10000);
      });

      return true;
    },
  });
};
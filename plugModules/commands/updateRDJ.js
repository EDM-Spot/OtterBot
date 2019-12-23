const { isNil } = require("lodash");
const { ROLE } = require("miniplug");

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

      const users = await bot.plug.getStaff();
      const listDJ = users.filter(u => u.role === ROLE.DJ);

      var i = 0;
      for (i = 0; i < listDJ.length; i++) {
        var interval = setInterval(async function() {
          if (!isNil(listDJ[i])) {
            if (listDJ[i].role < ROLE.BOUNCER || listDJ[i].gRole < ROLE.SITEMOD) {
              if (listDJ[i].role === ROLE.DJ) {
                console.log(listDJ[i].username);
                await bot.utils.updateRDJ(listDJ[i].id);
              }
            }
          }
          i++;
          if (i === listDJ.length) {
            clearInterval(interval);
            console.log("Finished");
          }
        }, 10000);
      }

      return true;
    },
  });
};
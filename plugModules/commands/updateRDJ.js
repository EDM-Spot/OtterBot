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
        const offUser = data.filter(u => u.role === ROOM_ROLE.RESIDENTDJ);

        var i = 0;
        var interval = setInterval(function() {
          if (!isNil(offUser[i])) {
            if (offUser[i].role < ROOM_ROLE.BOUNCER || offUser[i].gRole < GLOBAL_ROLES.MODERATOR) {

              if (offUser[i].role === ROOM_ROLE.RESIDENTDJ) {
                console.log(offUser[i].username);
                await bot.utils.updateRDJ(offUser[i].id);
              }
            }
          }
          i++;
          if (i === offUser.length) clearInterval(interval);
        }, 10000);
      });
      console.log("Finished");

      return true;
    },
  });
};
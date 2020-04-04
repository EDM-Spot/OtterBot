const { isObject, isNil } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["producer"],
    minimumPermission: 3000,
    cooldownType: "none",
    cooldownDuration: 0,
    parameters: "<add|remove> <@User>",
    description: "Set or Remove Producers",
    async execute(rawData, { args, mentions }, lang) {
      if (!args.length) {
        return false;
      }

      const params = ["add", "remove"];
      const param = `${args.shift()}`.toLowerCase();

      if (!params.includes(param)) {
        return false;
      }

      switch (param) {
        case "add": {
          if (!mentions.length || mentions.length >= 2) {
            return false;
          }

          const user = mentions[0];

          if (!isObject(user)) {
            this.reply(lang.userNotFound, {}, 6e4);
            return false;
          } else if (user.id === rawData.uid) {
            return false;
          }

          await bot.db.models.users.update(
            { producer: true },
            { where: { id: user.id }, defaults: { id: user.id } }
          );

          await bot.generateCSS.generateProducers();
          await bot.generateCSS.generateIcons();

          this.reply("User Added To Producers", {}, 6e4);
          return true;
        }
        case "remove": {
          const id = args.slice(1).join(" ");

          if (isNil(id)) {
            this.reply("No id specified", {}, 6e4);
            return false;
          }

          await bot.db.models.users.update(
            { producer: false },
            { where: { id: id }, defaults: { id: id } }
          );

          await bot.generateCSS.generateProducers();
          await bot.generateCSS.generateIcons();

          this.reply("User Removed From Producers", {}, 6e4);
          return true;
        }
        default:
          return false;
      }
    },
  });
};
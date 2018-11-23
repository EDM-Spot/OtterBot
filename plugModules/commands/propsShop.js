const { isNil } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["buy", "shop"],
    minimumPermission: 5000,
    cooldownType: "perUser",
    cooldownDuration: 1,
    deleteInstantly: true,
    parameters: "[badge <Image>]",
    description: "Props Shop",
    async execute(rawData, { args }, lang) {
      const { id } = rawData.from;

      console.log(args);

      const buyType = args[0];

      args.slice(1).shift();
      const url = args.slice(2).join(" ");

      console.log(buyType);
      console.log(url);

      if (isNil(buyType) || isNil(url)) {
        return false;
      }

      if (args.length && buyType === "badge") {
        const [inst] = await bot.db.models.users.findOrCreate({ where: { id }, defaults: { id } });

        const props = inst.get("props");

        if (props < 100) {
          this.reply(lang.join.noProps, {}, 6e4);
          return true;
        }

        await bot.shop.saveImage(id, url);

        return true;
      }

      return false;
    },
  });
};
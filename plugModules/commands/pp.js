module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["pp"],
    minimumPermission: 1000,
    cooldownType: "perUse",
    cooldownDuration: 21600,
    parameters: "",
    description: "Check Bot PP",
    async execute(rawData) { // eslint-disable-line no-unused-vars
      const me = bot.plug.getSelf();

      await bot.plug.sendChat(`I have ${me.pp} PP.`);
      return true;
    },
  });
};
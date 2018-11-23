module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["badgereload"],
    minimumPermission: 4000,
    cooldownType: "perUse",
    cooldownDuration: 10,
    parameters: "",
    description: "Reloads the Badges.",
    async execute() {
      await bot.utils.generateBadges();
      await bot.plug.sendChat("Badges Reloaded.");
      return true;
    },
  });
};
module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["badgereload"],
    minimumPermission: 4000,
    cooldownType: "perUse",
    cooldownDuration: 10,
    parameters: "",
    description: "Reloads the Badges CSS.",
    async execute() {
      await bot.generateCSS.generateBadges();
      bot.plug.chat("Badges CSS Reloaded.");
      return true;
    },
  });
};
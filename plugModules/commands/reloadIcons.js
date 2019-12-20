module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["iconsreload"],
    minimumPermission: 4000,
    cooldownType: "perUse",
    cooldownDuration: 10,
    parameters: "",
    description: "Reloads the Icons CSS.",
    async execute() {
      await bot.generateCSS.generateIcons();
      bot.plug.chat("Icons CSS Reloaded.");
      return true;
    },
  });
};
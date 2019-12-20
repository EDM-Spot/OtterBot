module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["producerreload"],
    minimumPermission: 4000,
    cooldownType: "perUse",
    cooldownDuration: 10,
    parameters: "",
    description: "Reloads the Producers CSS.",
    async execute() {
      await bot.generateCSS.generateProducers();
      await bot.plug.chat("Producers CSS Reloaded.");
      return true;
    },
  });
};
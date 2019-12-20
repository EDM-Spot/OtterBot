module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["ignore"],
    minimumPermission: 2000,
    cooldownType: "perUse",
    cooldownDuration: 60,
    parameters: "",
    description: "Ignore history check next song",
    async execute() {
      bot.global.ignoreHistoryNext = true;

      bot.plug.chat("History check will be disabled next song.");
      return true;
    },
  });
};
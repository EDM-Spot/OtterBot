module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["d"],
    minimumPermission: 1000,
    cooldownType: "none",
    cooldownDuration: 0,
    parameters: "",
    description: "Deletes your own message. Why not?",
    async execute() {
      return true;
    },
  });
};
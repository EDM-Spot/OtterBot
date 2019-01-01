module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["theme"],
    minimumPermission: 2000,
    cooldownType: "perUse",
    cooldownDuration: 5,
    parameters: "",
    description: "Ignore history check next song",
    async execute() {
      return;
      
      if (!bot.global.isHolidaySong) {
        bot.global.isHolidaySong = true;
        await bot.plug.sendChat("Marked as Theme Song!");
        return true;
      }
      else {
        bot.global.isHolidaySong = false;
        await bot.plug.sendChat("Unmarked as Theme Song!");
        return true;
      }
    },
  });
};
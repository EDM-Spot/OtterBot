module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["hello"],
    minimumPermission: 1000,
    cooldownType: "perUse",
    cooldownDuration: 120,
    parameters: "",
    description: "Hello...",
    async execute(rawData) {
      const lucky = !Math.floor(Math.random() * 50);

      if (lucky) {
        await rawData.reply('hello...').delay(4500);
        await bot.plug.chat('... it\'s me...');
        return true;
      }

      await bot.plug.chat(`Hi There, @${rawData.un}`);
      return true;
    },
  });
};
const { isObject, isNil } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["accept"],
    minimumPermission: 0,
    cooldownType: "none",
    cooldownDuration: 0,
    parameters: "",
    description: "Accept if someone gives you the position in the waitlist.",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      const userHaveGives = await bot.redis.findGivePositionTo(rawData.raw.uid);

      if (!isObject(userHaveGives)) {
        return false;
      }

      console.log(userHaveGives);

      return true;
    },
  });
};
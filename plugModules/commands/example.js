module.exports = function Command(bot) {
  return;

  /* eslint-disable no-unreachable */
  bot.commands.register({
    names: ["example"],
    /*
			5 (host);
			4 (co-host);
			3 (manager, admin, ambassador);
			2 (bouncer);
			1 (resident dj);
			0 (regular user).
		 */
    minimumPermission: 2000,
    // ENUM(perUse, perUser, none)
    cooldownType: "perUse",
    // in seconds
    cooldownDuration: 10,
    // <required> [optional] [this|that]
    parameters: "",
    description: "What this command does.",
    async execute(rawData, command, lang) {
      // do something
      const { user } = rawData;
      console.log(rawData, command, user, lang.ping.pong);
      // true/false for successful run or not
      return true;
    },
  });
};
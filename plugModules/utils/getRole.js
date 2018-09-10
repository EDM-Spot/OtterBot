const { isObject } = require("lodash");

module.exports = function Util(bot) {
  const util = {
    name: "getRole",
    function: async (user) => {
      if (!isObject(user)) return 0;

      const operators = [13585808];

      if (operators.includes(user.id)) return 5000;
      if (!user.role && user.gRole === 5000) return 2000;
      if (!user.role && user.gRole === 3000) return 1000;
      return user.role || 0;
    },
  };

  bot.utils.register(util);
};
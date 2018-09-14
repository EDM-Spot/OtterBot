const { isNil } = require("lodash");

module.exports = function Util(bot) {
  const util = {
    name: "getUserByName",
    function: async (username) => {
      if (isNil(username)) return;

      const users = bot.plug.getUsers();
      const user = users.filter(u => u.username.toLowerCase() === username.toLowerCase())[0] ||
        users.filter(u => u.username.toLowerCase().trim() === username.toLowerCase().trim())[0];
        
      return user;
    },
  };

  bot.utils.register(util);
};
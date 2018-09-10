const {
  isNil, isObject, keys, each
} = require("lodash");

module.exports = function Util(bot) {
  const util = {
    name: "replace",
    function: (input, object) => {
      if (isNil(input)) return "MISSING STRING";
      if (!isObject(object)) return input;

      each(keys(object), (key) => {
        input = input.replace(new RegExp(`%%${key.toUpperCase()}%%`, "g"), object[key]);
      });

      return input;
    },
  };

  bot.utils.register(util);
};
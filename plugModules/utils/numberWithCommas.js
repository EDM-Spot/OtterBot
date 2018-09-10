module.exports = function Util(bot) {
  const util = {
    name: "numberWithCommas",
    function: input => input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
  };

  bot.utils.register(util);
};
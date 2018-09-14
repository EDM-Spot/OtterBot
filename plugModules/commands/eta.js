const { isObject } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["eta"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 180,
    parameters: "",
    description: "Calculates the ETA (Estimated Time of Arrival) for the user to DJ.",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      const dj = bot.plug.getDJ();

      if (isObject(dj) && dj.id === rawData.from.id) {
        this.reply(lang.eta.isPlaying, {}, 6e4);
        return true;
      } else if (bot.plug.getWaitListPosition(rawData.from.id) === -1) {
        this.reply(lang.eta.notInWaitList, {}, 6e4);
        return false;
      }

      const position = bot.plug.getWaitListPosition(rawData.from.id);

      if (position === 1) {
        this.reply(lang.eta.isNext, {}, 6e4);
        return true;
      }

      const hours = Math.floor((position * 4) / 60);
      const minutes = (position * 4) % 60;
      const readable = `${hours ? `${hours}h${minutes ? `${minutes}m` : ""}` : `${minutes}m`}`;

      this.reply(lang.eta.result, { eta: readable }, 6e4);
      return true;
    },
  });
};
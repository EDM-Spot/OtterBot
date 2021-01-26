const { isObject } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["eta"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 600,
    parameters: "",
    description: "Calculates the ETA (Estimated Time of Arrival) for the user to DJ.",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      const waitlist = bot.plug.waitlist();
      const dj = bot.plug.dj();

      if (isObject(dj) && dj.id === rawData.uid) {
        this.reply(lang.eta.isPlaying, {});
        return true;
      } else if (!waitlist.contains(rawData.uid)) {
        this.reply(lang.eta.notInWaitList, {});
        return false;
      }

      const position = waitlist.positionOf(rawData.uid);

      if (position === 0) {
        this.reply(lang.eta.isNext, {});
        return true;
      }

      const hours = Math.floor((position * 4) / 60);
      const minutes = (position * 4) % 60;
      const readable = `${hours ? `${hours}h${minutes ? `${minutes}m` : ''}` : `${minutes}m`}`;

      this.reply(lang.eta.result, { eta: readable });
      return true;
    },
  });
};
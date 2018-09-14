const { isObject } = require("lodash");

function generateIdentifier(currentMedia, dj, rawData) {
  return `historyID-${currentMedia.id}:dj-${dj.id}:user-${rawData.from.id}`;
}

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["props"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 60,
    parameters: "",
    description: "Gives props to the current DJ.",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      const currentMedia = bot.plug.getMedia();
      const dj = bot.plug.getDJ();

      if (!isObject(currentMedia)) {
        this.reply(lang.props.nothingPlaying, {}, 6e4);
        return false;
      } else if (isObject(dj) && dj.id === rawData.from.id) {
        this.reply(lang.props.propSelf, {}, 6e4);
        return true;
      }
      
      await bot.db.models.props.findOrCreate({
        where: { identifier: generateIdentifier(currentMedia, dj, rawData) },
        defaults: {
          id: rawData.from.id,
          dj: dj.id,
          historyID: `'${currentMedia.id}'`,
          identifier: generateIdentifier(currentMedia, dj, rawData),
        },
      });
      return true;
    },
  });
};
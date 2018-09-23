const { isObject, isNil } = require("lodash");

function generateIdentifier(currentMedia, dj, rawData) {
  return `historyID-${currentMedia}:dj-${dj.id}:user-${rawData.from.id}`;
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
      const historyID = bot.plug.getHistoryID();
      const dj = bot.plug.getDJ();

      if (isNil(historyID)) {
        this.reply(lang.props.nothingPlaying, {}, 6e4);
        return false;
      } else if (isObject(dj) && dj.id === rawData.from.id) {
        this.reply(lang.props.propSelf, {}, 6e4);
        return true;
      }
      
      await bot.db.models.props.findOrCreate({
        where: { identifier: generateIdentifier(historyID, dj, rawData) },
        defaults: {
          id: rawData.from.id,
          dj: dj.id,
          historyID: `${historyID}`,
          identifier: generateIdentifier(historyID, dj, rawData),
        },
      });
      return true;
    },
  });
};
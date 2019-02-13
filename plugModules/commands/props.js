const { isObject, isNil } = require("lodash");
const moment = require("moment");

function generateIdentifier(currentMedia, dj, rawData) {
  if (isNil(dj)) {
    console.warn("Props Error!");
    return null;
  }
  return `historyID-${currentMedia}:dj-${dj.id}:user-${rawData.from.id}`;
}

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["props", "prop"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 60,
    parameters: "",
    description: "Gives props to the current DJ.",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      const historyID = bot.plug.getHistoryID();
      const dj = bot.plug.getDJ();
      const timeElapsed = bot.plug.getTimeElapsed();

      if (timeElapsed < 5) {
        return false;
      }

      const [inst] = await bot.db.models.users.findOrCreate({ where: { id: rawData.from.id }, defaults: { id: rawData.from.id } });

      let propsToGiveLeft = inst.get("props_to_give");

      if (isNil(propsToGiveLeft)) {
        await bot.db.models.users.update(
          { props_to_give: 50, last_props_give_reset: moment() },
          { where: { id: rawData.from.id }, defaults: { id: rawData.from.id }}
        );

        propsToGiveLeft = 50;
      }

      const lastReset = moment().diff(moment(inst.get("last_props_give_reset")), "hours");

      if (lastReset >= 24) {
        await bot.db.models.users.update(
          { props_to_give: 50, last_props_give_reset: moment() },
          { where: { id: rawData.from.id }, defaults: { id: rawData.from.id }}
        );

        propsToGiveLeft = 50;
      }
      
      if (isNil(historyID)) {
        this.reply(lang.props.nothingPlaying, {}, 6e4);
        return false;
      } else if (isObject(dj) && dj.id === rawData.from.id) {
        this.reply(lang.props.propSelf, {}, 6e4);
        return true;
      } else if (propsToGiveLeft == 0) {
        this.reply(lang.props.noPropsToGive, {}, 6e4);
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

      await bot.db.models.users.decrement("props_to_give", { by: 1, where: { id: rawData.from.id } });
      return true;
    },
  });
};
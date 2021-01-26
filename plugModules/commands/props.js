const { isObject, isNil } = require("lodash");
const moment = require("moment");

function generateIdentifier(currentMedia, dj, rawData) {
  if (isNil(dj)) {
    console.warn("Props Error!");
    return null;
  }
  return `historyID-${currentMedia.id}:dj-${dj.id}:user-${rawData.uid}`;
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
      const currentMedia = bot.plug.historyEntry();
      const dj = bot.plug.dj();

      const [inst] = await bot.db.models.users.findOrCreate({ where: { id: rawData.uid }, defaults: { id: rawData.uid } });

      let propsToGiveLeft = inst.get("props_to_give");

      if (isNil(propsToGiveLeft)) {
        await bot.db.models.users.update(
          { props_to_give: 30, last_props_give_reset: moment() },
          { where: { id: rawData.uid }, defaults: { id: rawData.uid }}
        );

        propsToGiveLeft = 30;
      }

      const lastReset = moment().diff(moment(inst.get("last_props_give_reset")), "hours");

      if (lastReset >= 24) {
        await bot.db.models.users.update(
          { props_to_give: 30, last_props_give_reset: moment() },
          { where: { id: rawData.uid }, defaults: { id: rawData.uid }}
        );

        propsToGiveLeft = 30;
      }
      
      if (!isObject(currentMedia)) {
        this.reply(lang.props.nothingPlaying, {});
        return false;
      } else if (isObject(dj) && dj.id === rawData.uid) {
        this.reply(lang.props.propSelf, {});
        return true;
      } //else if (propsToGiveLeft == 0) {
        //this.reply(lang.props.noPropsToGive, {});
        //return true;
      //}
      
      await bot.db.models.props.findOrCreate({
        where: { identifier: generateIdentifier(currentMedia.id, dj, rawData) },
        defaults: {
          id: rawData.uid,
          dj: dj.id,
          historyID: `${currentMedia.id}`,
          identifier: generateIdentifier(currentMedia, dj, rawData),
        },
      });

      //await bot.db.models.users.decrement("props_to_give", { by: 1, where: { id: rawData.uid } });
      return true;
    },
  });
};
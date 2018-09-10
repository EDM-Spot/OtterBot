module.exports = function Event(bot, filename, platform) {
  const event = {
    name: bot.plug.events.CHAT_DELETE,
    platform,
    _filename: filename,
    run: async ({ c: cid, mi: deleted_by }) => {
      await bot.db.models.messages.update({ deleted_by }, { where: { cid } });
    },
    init() {
      //bot.plug.on('connected', () => {
      bot.plug.on(this.name, this.run);
      //});
    },
    kill() {
      bot.plug.removeListener(this.name, this.run);
    },
  };

  bot.events.register(event);
};
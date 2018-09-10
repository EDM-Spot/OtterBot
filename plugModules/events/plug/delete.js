module.exports = function (bot, filename, platform) {
	const event = {
		name: "chatDelete",
		platform: platform,
		_filename: filename,
		run: ({c, mi}) => bot.db.models.messages.update({ deleted_by: mi }, { where: { cid: c } }),
		init: function () {
			bot.plug.ws.on(this.name, this.run);
		},
		kill: function () {
			bot.plug.ws.removeListener(this.name, this.run);
		}
	};

	bot.events.register(event);
};
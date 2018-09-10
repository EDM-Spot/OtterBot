module.exports = function (bot, filename, platform) {
	const event = {
		name: "connected",
		platform: platform,
		_filename: filename,
		run: async () => {
			await bot.plug.join(bot.config.plug.room);
			return bot.plug.chat(bot.lang.startup);
		},
		init: function () {
			bot.plug.on(this.name, this.run);
		},
		kill: function () {
			bot.plug.removeListener(this.name, this.run);
		}
	};

	bot.events.register(event);
};
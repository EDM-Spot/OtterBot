const { isObject } = require('lodash');

module.exports = function Command(bot) {
	bot.plugCommands.register({
		names: ['lockskip', 'ls'],
		minimumPermission: 2000,
		cooldownType: 'perUse',
		cooldownDuration: 4,
		parameters: '',
		description: 'Executes a lockskip, which skips the current DJ and moves them back to the 3rd position to have another try.',
		async execute(rawData, { name }, lang) {
			const dj = bot.plug.getDJ();
			const currentMedia = bot.plug.getMedia();

			if (isObject(dj) && isObject(currentMedia)) {
				await bot.utils.lockskip(dj);
				this.reply(lang.moderation.effective, {
					mod: rawData.un,
					command: `!${name}`,
					user: dj.username,
				}, 6e4);
				return true;
			}

			return false;
		},
	});
};
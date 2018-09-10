module.exports = function Command(bot) {
	bot.plugCommands.register({
		names: ['hello'],
		minimumPermission: 1000,
		cooldownType: 'perUse',
		cooldownDuration: 60,
		parameters: '',
		description: 'Hello...',
		async execute(rawData) {
			const lucky = !Math.floor(Math.random() * 50);

			if (lucky) {
				await this.reply('hello...').delay(4500);
				await bot.plug.sendChat('... it\'s me...');
				return true;
			}

			await bot.plug.sendChat(`Hi There, @${rawData.raw.un}`);
			return true;
		},
	});
};
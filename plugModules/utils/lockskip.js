module.exports = function (bot) {
	const util = {
		name: "lockskip",
		function: user => {
			return new Promise ((resolve, reject) => {
				let should_cycle = bot.plug.booth().shouldCycle;
				let wait_list = bot.plug.waitlist();

				let lock_skip = {
					position: 2,
					with_cycle: async () => {
						await bot.plug.enableCycle();
						await user.skip(bot.plug.historyEntry().id);
						await user.move(lock_skip.position);
						await bot.plug.disableCycle();
						return resolve();
					},
					without_cycle: async () => {
						await user.skip(bot.plug.historyEntry().id);
						await user.move(lock_skip.position);
						return resolve();
					},
					adding_dj: async () => {
						await user.skip(bot.plug.historyEntry().id);
						await user.add();
						await user.move(lock_skip.position);
						return resolve();
					},
					only_skip: async () => {
						await user.skip(bot.plug.historyEntry().id);
						return resolve();
					},
					skip_only_add: async () => {
						await user.skip(bot.plug.historyEntry().id);
						await user.add();
						return resolve();
					},
					run: () => {
						try {
							if (!wait_list.length && should_cycle)
								return lock_skip.only_skip();
							else if (!should_cycle && (!wait_list.length || (wait_list.length - 1) <= lock_skip.position))
								return lock_skip.skip_only_add();
							else if (!should_cycle && (wait_list.length >= 4 && wait_list.length <= 45))
								return lock_skip.adding_dj();
							else if (should_cycle && (wait_list.length >= 4 && wait_list.length <= 45))
								return lock_skip.without_cycle();
							else if (!should_cycle)
								return lock_skip.with_cycle();
							else
								return lock_skip.without_cycle();
						} catch (err) {
							console.error(err);
							return reject(err);
						}
					}
				};

				return lock_skip.run();
			});
		}
	};

	bot.utils.register(util);
};
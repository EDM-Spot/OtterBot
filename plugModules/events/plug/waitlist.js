const { each, isNil } = require("lodash");

module.exports = function Event(bot, platform) {
  const event = {
		name: 'waitlistUpdate',
		platform,
		previous: undefined,
		checkForLeave(id) {
			return new Promise((resolve, reject) => {
				function run(user) {
					if (user.id === id) resolve();
				}

				bot.plug.on('userLeave', run);

				setTimeout(() => {
					bot.plug.removeListener('userLeave', run); reject();
				}, 3e3);
			});
		},
		run(newWaitList) {
			const previousWaitList = event.previous;

			if (previousWaitList.length > newWaitList.length) {
				each(previousWaitList, (user, position) => {
					if (position !== newWaitList.length && !newWaitList.contains(user)) {
						event.checkForLeave(user.id).then(async () => {
							const latestDisconnection = await bot.redis.findDisconnection(user.id);

							if (isNil(latestDisconnection) || position < latestDisconnection) {
								await bot.redis.registerDisconnection(user.id, position);
							}
						}).catch(() => {});
					}
				});
			}

			// always at the end to keep a consistent 'previous' waitlist
			event.previous = bot.plug.waitlist();
		},
		init() {
			this.previous = bot.plug.waitlist();

			bot.plug.on(this.name, this.run);
		},
		kill() {
			bot.plug.removeListener(this.name, this.run);
		},
	};

	bot.events.register(event);
};
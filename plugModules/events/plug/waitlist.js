const { each, isNil } = require('lodash');

module.exports = function Event(bot, platform) {
	const event = {
		name: bot.plug.events.DJ_LIST_UPDATE,
		platform,
		previous: undefined,
		checkForLeave(id) {
			return new Promise((resolve, reject) => {
				function run(user) {
					if (user.id === id) resolve();
				}

				bot.plug.on(bot.plug.events.USER_LEAVE, run);

				setTimeout(() => {
					bot.plug.removeListener(bot.plug.events.USER_LEAVE, run); reject();
				}, 3e3);
			});
		},
		run(newWaitList) {
			const previousWaitList = event.previous;

			if (previousWaitList.length > newWaitList.length) {
				each(previousWaitList, (user, position) => {
					if (position !== newWaitList.length && bot.plug.getWaitListPosition(user.id) === -1) {
						event.checkForLeave(user.id).then(async () => {
							const latestDisconnection = await bot.redis.findDisconnection(user.id);

							if (isNil(latestDisconnection) || position < latestDisconnection) {
								await bot.redis.registerDisconnection(user.id, position + 1);
							}
						}).catch(() => {});
					}
				});
			}

			// always at the end to keep a consistent 'previous' waitlist
			event.previous = bot.plug.getWaitList();
		},
		init() {
			this.previous = bot.plug.getWaitList();

			bot.plug.on(this.name, this.run);
		},
		kill() {
			bot.plug.removeListener(this.name, this.run);
		},
	};

	bot.events.register(event);
};
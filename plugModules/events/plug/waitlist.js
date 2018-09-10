module.exports = function (bot, filename, platform) {
	const event = {
		name: "waitlistUpdate",
		platform: platform,
		_filename: filename,
		previous: undefined,
		checkForLeave: function (id) {
			return new Promise ((resolve, reject) => {
				function run (user) {
					if (user.id === id) resolve();
				}

				bot.plug.on("userLeave", run);

				setTimeout(() => {
					bot.plug.removeListener("userLeave", run); reject();
				}, 2e3);
			});
		},
		run: function (waitlist) {
			let previous = event.previous;
			
			if (previous.length <= waitlist.length) {
				event.previous = bot.plug.waitlist();
				return;
			}

			if (previous.length > waitlist.length) {
				for (let i = 0; i < previous.length; i++) {
					if (i !== waitlist.length && !waitlist.contains(previous[i])) {
						event.checkForLeave(previous[i].id).then(() => {
							return bot.db.models.disconnections.upsert({
								id: previous[i].id,
								position: i
							});
						}).catch(() => {});
					}
				}
			}

			// always at the end to keep a consistent "previous" waitlist
			event.previous = bot.plug.waitlist();
		},
		init: function () {
			this.previous = bot.plug.waitlist();

			bot.plug.on(this.name, this.run);
		},
		kill: function () {
			bot.plug.removeListener(this.name, this.run);
		}
	};

	bot.events.register(event);
};
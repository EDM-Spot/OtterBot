module.exports = function (bot) {
	const util = {
		name: "queue",
		function: function () {
			this.users = [];

			this.add = function (info) {
				if (this.users.map(u => u.user.id).includes(info.user.id))
					return this.update(info);
				else {
					this.users.push(info);
					return this.run();
				}
			};

			this.update = function (info) {
				for (let i = 0; i < this.users.length; i++)
					if (this.users[i].user.id === info.user.id)
						this.users[i].position = info.position;

				return this.run();
			};

			this.remove = function (user) {
				if (typeof user === "object")
					user = user.id;

				for (let i = 0; i < this.users.length; i++)
					if (this.users[i].user.id === user)
						this.users.splice(i, 1);

				return this.run();
			};

			this.run = async function () {
				let waitlist = bot.plug.waitlist();
				let dj = bot.plug.dj();

				if (!this.users.length) return;

				let next = this.users.shift();

				if (waitlist.length === 50 && !waitlist.contains(next.user.id)) {
					if (!bot.plug.isLocked()) {
						try {
							await bot.plug.setLock(true);
							this.shouldUnlock = true;
							return this.users.push(next);
						} catch (err) {
							console.error(err);
						}
					}
				}

				if (dj && dj.id === next.user.id)
					return this.users.push(next);
				else if (waitlist.positionOf(next.user.id) === -1) {
					try {
						await next.user.add();
					} catch (err) {
						if (err.response && err.response.body) {
							switch (err.response.body.status) {
								case "noValidPlaylist":
									next.user.chat(bot.lang.queue.noValidPlaylist).delay(6e4).call("delete");
									return;
								case "roomMismatch":
									bot.plug.chat(bot.utils.replace(bot.lang.queue.roomMismatch, { user: next.user.id })).delay(6e4).call("delete");
									return;
								case "forbidden":
									if (err.response.body.data.includes("waitlistBan")) {
										await bot.db.models.cooldowns.destroy({ where: { command: "roulette@start" }});
										next.user.chat(bot.lang.queue.waitlistBan).delay(6e4).call("delete");
									}
									return;
								default:
									return;
							}
						}
					}

					if (next.position < waitlist.length) {
						try {
							await next.user.move(next.position);
						} catch (err) {
							console.error(err);
							return this.users.push(next);
						}
					}
				} else {
					try {
						await next.user.move(next.position);
					} catch (err) {
						return this.users.push(next);
					}

					if (bot.utils.queue.shouldUnlock) {
						await bot.plug.setLock(false);
						bot.utils.queue.shouldUnlock = false;
					}
				}

				if (this.shouldUnlock) {
					await bot.plug.setLock(false);
					this.shouldUnlock = false;
				}
			};

			bot.plug.on("waitlistUpdate", waitlist => bot.utils.queue.run(waitlist));
		}
	};

	util.function = new util.function();

	bot.utils.register(util);
};
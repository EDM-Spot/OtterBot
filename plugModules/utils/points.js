module.exports = function (bot) {
	const util = {
		name: "points",
		function: function () {
			this.votes = {};

			this.afterIncrement = async (instance) => {
				try {
					if (instance.get("points") >= 30000) {
						let user = bot.plug.user(instance.get("id"));
						if (user) {
							if (!user.role) {
								await user.setRole(1000);
								return bot.plug.chat(bot.utils.replace(bot.lang.pointsMilestone, { user: user.username }));
							}
						} else {
							let staff = await bot.plug.getStaff();

							let staffMember = staff.filter(user => user.id === instance.get("id"))[0] || undefined;

							if (!staffMember) {
								await bot.plug.setRole(instance.get("id"), 1000);

								let user = await bot.plug.getUser(instance.get("id"));

								return bot.plug.chat(bot.utils.replace(bot.lang.pointsMilestone, { user: user.username }));
							} else {
								if (staffMember.role === 2) {
									await bot.plug.setRole(instance.get("id"), 1000);

									let user = await bot.plug.getUser(instance.get("id"));

									await bot.plug.chat(bot.utils.replace(bot.lang.pointsMilestone, { user: user.username }));

									setTimeout(async () => {
										await bot.plug.setRole(instance.get("id"), 2000);
										return bot.plug.chat(":trollface:");
									}, 5e3);
								} else {
									return bot.plug.chat(bot.utils.replace(bot.lang.pointsMilestoneButAlreadyStaff, { user: user.username }));
								}
							}
						}
					}
				} catch (err) {
					console.error(err);
				}
			};

			bot.plug.ws.on("vote", async ({ i, v }) => {
				if (v === -1) {
					delete this.votes[i];
				} else {
					try {
						this.votes[i] = v;
						let instance = await bot.db.models.users.findOrCreate({ where: { id: i }, defaults: { id: i } });
						return this.afterIncrement(instance[0]);
					} catch (err) {
						console.error(err);
					}
				}
			});

			bot.plug.on("roomState", state => {
				for (let i in state.votes)
					if (!state.votes[i])
						delete state.votes[i];
				this.votes = state.votes;
			});
		}
	};

	util.function = new util.function();

	bot.utils.register(util);
};

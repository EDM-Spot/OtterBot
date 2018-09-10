const { each, isObject } = require('lodash');

module.exports = function Util(bot) {
	class PointsUtil {
		constructor() {
			this.votes = {};

			bot.plug.on('login', () => {
				bot.plug.ws.on('vote', async ({ i: id, v: direction }) => {
					if (direction === -1) {
						delete this.votes[id];
					} else {
						this.votes[id] = direction;

						const [instance] = await bot.db.models.users.findOrCreate({
							where: { id },
							defaults: { id },
						});

						this.incrementHook(instance);
					}
				});
			});

			bot.plug.on('roomState', (state) => {
				// remove mehs
				each(state.votes, (vote) => {
					if (!state.votes[vote]) {
						delete state.votes[vote];
					}
				});

				this.votes = state.votes;
			});
		}
		async incrementHook(instance) {
			return; // disable
			if (instance.get('points') < 30000) return;

			let user = bot.plug.getUser(instance.get('id'));

			const { ROOM_ROLE, GLOBAL_ROLES } = bot.miniplug;

			// wether they're in the room
			if (user) {
				if (!user.role) {
					await user.setRole(ROOM_ROLE.RESIDENTDJ);
					await bot.plug.sendChat(bot.utils.replace(bot.lang.points.milestone, { user }));
				}
			} else {
				const staff = await bot.plug.getStaff();

				const staffMember = staff.filter(_user => _user.id === instance.get('id'))[0] || undefined;

				if (!isObject(staffMember)) {
					await bot.plug.setRole(instance.get('id'), ROOM_ROLE.RESIDENTDJ);

					user = await bot.plug.getUser(instance.get('id'));

					await bot.plug.sendChat(bot.utils.replace(bot.lang.points.milestone, { user }));
				} else {
					await bot.plug.sendChat(bot.utils.replace(bot.lang.points.alreadyStaff, {
						user: staffMember.username,
					}));
				}
			}
		}
	}

	bot.points = new PointsUtil();
};
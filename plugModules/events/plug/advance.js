module.exports = function (bot, filename, platform) {
	const event = {
		name: "advance",
		platform: platform,
		_filename: filename,
		run: async (data) => {
			if (!data || !data.media) return;

			let dj = bot.plug.dj();
			
			if (dj && data.media.duration >= 390) {
				await bot.utils.lockskip(dj);
				dj.chat(bot.lang.exceedstimeguard);
			}

			try {
				// reset any DC spots when they start DJing
				await bot.db.models.disconnections.destroy({ where: { id: dj.id } });
				// get history for the latest play
				let history = await bot.plug.getRoomHistory();
				// if plug reset the history or its a brand new room it won't have history
				if (!history.length) return;

				let latest = history.shift();
				// save how much XP they got for their play
				let score = Object.keys(bot.utils.points.votes).length + 1;
				let ids = Object.keys(bot.utils.points.votes).map(k => parseInt(k)).filter(i => !isNaN(i));

				// empty the XP counter
				bot.utils.points.votes = {};

				// keep track of played media in the room
				await bot.db.models.plays.create({
					cid: latest.media.cid,
					format: latest.media.format,
					woots: latest.score.positive,
					grabs: latest.score.grabs,
					mehs: latest.score.negative,
					dj: latest.user.id,
					skipped: latest.score.skipped ? true : false,
					title: `${latest.media.author} - ${latest.media.title}`
				});

				// count how many props were given while that media played
				let props = await bot.db.models.props.count({ where: { historyID: latest.id, dj: latest.user.id } });

				// award users that voted their XP
				await bot.db.models.users.increment("points", { by: 1, where: { id: { $in: ids } } });
				
				// get an user object for the last DJ
				let instance = await bot.db.models.users.findOrCreate({ where: { id: latest.user.id }, defaults: { id: latest.user.id } });
				// since Sequelize return an array for findOrCreate (which in bluebird would be handled with .spread)
				// we use the array instead and just grab the instance out of it as it is always the first element
				instance = instance[0];

				// if they weren't skipped they deserve XP equivalent to the votes
				if (!latest.score.skipped) {
					let dj_instance = await instance.increment("points", {by: score});
					bot.utils.points.afterIncrement(dj_instance);
				}

				// if no props were given, we done here
				if (!props) return;

				// otherwise, give them the props
				await instance.increment("props", {by: props});

				return bot.plug.chat(bot.utils.replace(bot.lang.advanceprops, {
					user: latest.user.username,
					props: props,
					plural: props > 1 ? "s" : ""
				})).delay(data.media.duration * 1e3).call("delete");
			} catch (err) {
				console.error(err);
			}
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
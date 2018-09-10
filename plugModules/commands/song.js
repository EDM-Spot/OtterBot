const got = require("got");

module.exports = function (bot, filename) {
	bot.commands.register("song", filename, ["link"], 0, true, {type: "per_use", duration: 60}, function (raw_data, command) {
		let current_media = bot.plug.historyEntry();
		let user;

		if (command.args.length && command.args.join(" ").charAt(0) === "@") {
			let username = command.args.join(" ").substr(1);
			user = bot.plug.users().filter(u => u.username.toLowerCase() === username.toLowerCase())[0] || bot.plug.users().filter(u => u.username.toLowerCase().trim() === username.toLowerCase().trim())[0];
		}

		if (current_media.media.format === 1)
			return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.un,
				message: `${bot.utils.replace(bot.lang.commands.song, {
					title: `${current_media.media.author} - ${current_media.media.title}`,
					link:  `https://youtu.be/${current_media.media.cid}`
				})} ${user || ""}`
			})).delay(6e4).call("delete");
		else if (current_media.media.format === 2) {
			return got(`https://api.soundcloud.com/tracks?ids=${current_media.media.cid}.json&client_id=${bot.config.soundcloud_key}`, {json: true}).then(response => {
				return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
					command: command.name,
					user: raw_data.un,
					message: `${bot.utils.replace(bot.lang.commands.song, {
						title: `${current_media.media.author} - ${current_media.media.title}`,
						link:  response.body.length ? response.body[0].permalink_url : "Unavailable"
					})} ${user || ""}`
				})).delay(6e4).call("delete");
			}).catch(console.error);
		}
	}, {
		parameters: "[@username]",
		description: "Informs the song title along with the link."
	});
};
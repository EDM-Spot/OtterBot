module.exports = function (bot, filename, platform) {
	const event = {
		name: "chat",
		platform: platform,
		_filename: filename,
		run: data => {
			data.timestamp = Date.now();
			data.user = data.uid === bot.plug.me().id ? bot.plug.me() : bot.plug.user(data.uid);

			return bot.db.models.messages.create({
				id: data.uid,
				cid: data.cid,
				username: data.un,
				message: data.message
			}).then(instance => {
				if (/(skip pls)|(pls skip)|(skip this shit)|(mods skip this)|(nigger)|(faggot)/ig.test(data.message))
					return data.delete();

				if (["/em ", "/me "].includes(data.message.substr(0, 4)))
					data.message = data.message.substr(4);

				let msg = data.message.toLowerCase();

				if (/!|#|\/|\./.test(msg.charAt(0))) {
					let command = {
						name: data.message.split(" ")[0].replace(/!/g, "").toLowerCase(),
						args: data.message.split(" ").splice(1),
						platform: platform
					};

					let commands = Object.keys(bot.commands).filter(c => c.includes("command:"));

					for (let i = 0; i < commands.length; i++) {
						if (bot.commands[commands[i]].names.includes(command.name)) {
							instance.update({command: true}).then(() => {
								if (bot.commands[commands[i]].enabled) {
									if (bot.utils.getRole(data.user) >= bot.commands[commands[i]].role) {
										bot.commands.cooldown(bot.commands[commands[i]], data, command);
									}
								}
								setTimeout(() => data.delete(), 3e4);
							}).catch(console.error);
						}
					}
				}

				if (/^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(data.message))
					return setTimeout(() => data.delete(), 3e5);
			}).catch(console.error);
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
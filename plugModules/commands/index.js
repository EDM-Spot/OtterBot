const fs = require("fs-extra");

module.exports = function (bot) {
	this.cooldown_types = ["per_use", "per_user", "none"];

	this.register = function (id, filename, handlers, role, is_enabled, cooldown, run_function, info) {
		const command = {};

		// id, for storing and raw edits/reads
		if (typeof id !== "string" || /[^\w]/g.test(id))
			command.id = `command:malformed_command_${Object.keys(this).length}`;
		else
			command.id = `command:${id}`;

		// handlers, aliases, triggers, the command names you type
		let backup_handler = command.id.replace("command:", "");
			handlers = Array.isArray(handlers) ? handlers.filter(h => typeof h === "string" && !/[^\w]/g.test(id)).map(h => h.toLowerCase()) : [];
		if (!handlers.includes(backup_handler))
			command.names = [backup_handler, ...handlers];
		else
			command.names = [...handlers];

		// minimum role permission to execute the command
		command.role = [0, 1000, 2000, 3000, 4000, 5000].includes(role) ? role : 5000;

		// is it deactivated?
		command.enabled = is_enabled ? true : false;

		// how should the cooldown behave?
		if (typeof cooldown !== "object" || Array.isArray(cooldown) || !cooldown.hasOwnProperty("type") || !cooldown.hasOwnProperty("duration") || !this.cooldown_types.includes(cooldown.type.toLowerCase()) || typeof cooldown.duration !== "number" || cooldown.duration < 0)
			command.cooldown = {
				type: "per_use",
				duration: 60
			};
		else
			command.cooldown = cooldown;

		// no function, no command for you
		if (typeof run_function !== "function") return;
		else
			command.run = run_function;

		command._filename = filename;
		command.info = info ? info : {parameters: "", description: ""};

		this[command.id] = command;
	};

	this.cooldown = function (registered_command, raw_data, command) {
		switch (registered_command.cooldown.type) {
			case "per_use":
				bot.db.models.cooldowns.findOne({
					where: {
						command: registered_command.id,
						created_at: {
							$lt: new Date(),
							$gt: new Date(new Date() - registered_command.cooldown.duration * 1e3)
						}
					}
				}).then(
					success => {
						if (typeof success === "undefined" || success === null)
							bot.db.models.cooldowns.create({
								id: `${command.platform === "discord" ? parseInt(raw_data.author.id) : raw_data.uid}`,
								command: registered_command.id,
								type: registered_command.cooldown.type,
								length: registered_command.cooldown.duration * 1e3
							}).then(
								success => {
									return registered_command.run(raw_data, command);
								},
								err => console.error(err, 2)
							);
					},
					err => console.error(err, 2)
				);
				break;
			case "per_user": 
				bot.db.models.cooldowns.findOne({
					where: {
						id: `${command.platform === "discord" ? parseInt(raw_data.author.id) : raw_data.uid}`,
						command: registered_command.id,
						created_at: {
							$lt: new Date(),
							$gt: new Date(new Date() - registered_command.cooldown.duration * 1e3)
						}
					}
				}).then(
					success => {
						if (typeof success === "undefined" || success === null)
							bot.db.models.cooldowns.create({
								id:  `${command.platform === "discord" ? parseInt(raw_data.author.id) : raw_data.uid}`,
								command: registered_command.id,
								type: registered_command.cooldown.type,
								length: registered_command.cooldown.duration * 1e3
							}).then(
								success => {
									return registered_command.run(raw_data, command);
								},
								err => console.error(err, 2)
							);
					},
					err => console.error(err, 2)
				);
				break;
			case "none":
				registered_command.run(raw_data, command);
				break;
		}
	};

	this.get_loaded = function () {
		let keys = Object.keys(this);
		let array = [];

		keys = keys.filter(a => {
			return a.includes("command:");
		});

		for (let i = 0; i < keys.length; i++)
			array.push(this[keys[i]]);

		return array;
	};

	this.load_commands = function () {
		return new Promise ((resolve, reject) => {
			return fs.readdir(__dirname, (err, files) => {
				if (err) return reject(err);
				files.splice(files.indexOf("index.js"), 1);

				let modules = [];

				for (let i = 0; i < files.length; i++) {
					let module = require(`${__dirname}/${files[i]}`);
						module = new module(bot, files[i]);

					modules.push(module);
				}

				return resolve(modules);
			});
		});
	};

	this.processor = this.load_commands();
};
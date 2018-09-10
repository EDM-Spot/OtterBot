const fs = require("fs-extra");

module.exports = function (bot, platforms) {
	this.register = function (event) {
		event.id = `event:${event.platform}:${event.name.toLowerCase()}`;		

		this[event.id] = event;
	};

	this.init = function () {
		let keys = Object.keys(this).filter(key => {
			return key.includes("event:");
		});
		for (let i = 0; i < keys.length; i++)
			this[keys[i]].init();
	};

	this.kill = function () {
		let keys = Object.keys(this).filter(key => {
			return key.includes("event:");
		});
		for (let i = 0; i < keys.length; i++)
			this[keys[i]].kill();
	};

	this.get_loaded = function () {
		let keys = Object.keys(this);
		let array = [];

		keys = keys.filter(a => {
			return a.includes("event:");
		});

		for (let i = 0; i < keys.length; i++)
			array.push(this[keys[i]]);

		return array;
	};

	this.load_platform_events = function (platform) {
		return new Promise ((resolve, reject) => {
			fs.readdir(`${__dirname}/${platform}`, function (err, files) {
				if (err) return reject(err);

				let modules = [];

				for (let i = 0; i < files.length; i++) {
					let module = require(`${__dirname}/${platform}/${files[i]}`);
						module = new module(bot, files[i], platform);

						modules.push(module);
				}

				return resolve(modules);
			});
		});
	};

	this.processor = Promise.all(platforms.map(p => this.load_platform_events(p)));
};
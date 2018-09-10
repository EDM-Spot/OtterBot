const fs = require("fs-extra");

module.exports = function (bot) {
	this.register = function (util) {
		this[util.name] = util.function;
	};

	this.load_utils = function () {
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

	this.processor = this.load_utils();
};
const fs = require("fs-extra");

const default_options = {
	timestamps: true,
	underscored: true
};

module.exports = function (bot, sequelize) {
	this.load_models = function () {
		return new Promise ((resolve, reject) => {
			return fs.readdir(__dirname, function (err, files) {
				if (err) return reject(err);
				files.splice(files.indexOf("index.js"), 1);

				let modules = [];

				for (let i = 0; i < files.length; i++) {
					let module = require(`${__dirname}/${files[i]}`);
						module = new module(bot, sequelize, default_options);

					modules.push(module);
				}

				return resolve (modules);
			});
		});
	};

	this.processor = this.load_models();
};

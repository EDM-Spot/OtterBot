const fs = require("fs-extra");

module.exports = function (miniplug, plug) {
	return fs.readdir(__dirname, (err, files) => {
		if (err) return reject(err);
		files.splice(files.indexOf("index.js"), 1);

		let modules = [];

		for (let i = 0; i < files.length; i++) {
			let module = require(`${__dirname}/${files[i]}`);

			Object.assign(miniplug, module);

			module()(plug);
		}
	});
};
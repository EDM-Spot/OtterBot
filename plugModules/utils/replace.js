module.exports = function (bot) {
	const util = {
		name: "replace",
		function: (input, object) => {
			if (typeof input === "undefined" || input === null) return "missing string";
			if (typeof object !== "object") return input;
			let keys = Object.keys(object);

			for (let i = 0; i < keys.length; i++)
				input = input.replace(new RegExp(`%%${keys[i].toUpperCase()}%%`, "g"), object[keys[i]]);

			return input;
		}
	};

	bot.utils.register(util);
};
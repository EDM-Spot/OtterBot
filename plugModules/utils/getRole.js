module.exports = function (bot) {
	const util = {
		name: "getRole",
		function:  (user, forTwitch) => {
			if (!user) return 0;
			if (!forTwitch) {
				let operators = [3703511, 1337, 3583919];
				if (operators.includes(user.id)) return 5000;
				if (!user.role && user.gRole === 5000) return 2000;
				if (!user.role && user.gRole === 3000) return 1000;
				return user.role || 0;
			}
			return 0;
		}
	};

	bot.utils.register(util);
};
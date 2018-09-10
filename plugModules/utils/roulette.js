module.exports = function (bot) {
	const util = {
		name: "roulette",
		function: function () {
			this.running = false;
			this.price = undefined;
			this.players = [];

			// prototypes
			this.start = function (id, duration, price) {
				return new Promise ((resolve, reject) => {
					this.running = true;
					this.duration = duration;
					this.price = price;

					return bot.db.models.cooldowns.create({
						id: id,
						command: "roulette@start",
						length: 36e5,
						type: "per_use"
					}).then(() => {
						this.timeout = setTimeout(() => this.sort(), duration * 1e3);

						return resolve();
					}).catch(reject);
				});
			};

			this.end = function () {
				this.running = false;
				this.price = undefined;
				this.players = [];

				clearTimeout(this.timeout);

				return true;
			};

			this.check = function (cooldown) {
				return cooldown ? bot.db.models.cooldowns.findOne({
					where: {
						command: "roulette@start"
					}
				}) : this.running;
			};

			this.add = function (id) {
				if (!this.players.includes(id)) return this.players.push(id);
			};

			this.multiplier = function (players, isIn) {
				// multipler for users outside the waitlist
				let outside = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
				// multipler for users inside the waitlist
				let inside = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3];

				return isIn ? (inside[players] || 2) : (outside[players] || 3);
			};

			this.position = function (current, length) {
				// the highest position you can go to is 5
				// users outside the list have a chance to get at least pos 35
				return current !== -1 ? Math.min(Math.floor(Math.random() * Math.min(Math.max(length, length - 10), 34)) + 4, length - 1) : Math.floor(Math.random() * Math.min(length, 34)) + 4;
			};

			this.winner = function (players) {
				let winner = players[Math.floor(Math.random() * players.length)];
				let user = bot.plug.user(winner);
				let waitlist = bot.plug.waitlist();

				if (!players.length && this.end())
					return bot.plug.chat(bot.lang.roulette.somethingwrong);

				let position = this.position(waitlist.positionOf(winner), waitlist.length);
				if (!user || typeof user.username !== "string" || !user.username.length)
					return this.winner(players.filter(player => player !== winner));
				else {
					return bot.plug.chat(bot.utils.replace(bot.lang.roulette.winner, {
						winner: user.username,
						position: position + 1
					})).then(message => {
						this.end();
						return bot.utils.queue.add({user, position});
					}).catch(console.error);
				}
			};

			this.sort = function () {
				if (!this.players.length && this.end())
					return bot.plug.chat(bot.lang.roulette.noplayers);

				this.running = false;

				let altered_odds = [];
				let waitlist = bot.plug.waitlist();

				for (let i = 0; i < this.players.length; i++) {
					if (!bot.plug.user(this.players[i])) continue;
					if (waitlist.positionOf(this.players[i]) === -1)
						altered_odds.push(...Array(this.multiplier(this.players.length, false)).fill(this.players[i]));
					else
						altered_odds.push(...Array(this.multiplier(this.players.length, true)).fill(this.players[i]));
				}

				return this.winner(altered_odds);
			};

		}
	};

	util.function = new util.function();

	bot.utils.register(util);
};
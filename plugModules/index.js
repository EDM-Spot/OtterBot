module.exports = function (bot) {
	let miniplug = require("./miniplug");
	let utils    = require("./utils");
	let events   = require("./events");
	let commands = require("./commands");
	let models   = require("./models");
	let web      = require("./web");

	miniplug(bot.miniplug, bot.plug);
	bot.utils    = new utils(bot);
	bot.events   = new events(bot, ["plug"]);
	bot.commands = new commands(bot);
	bot.models   = new models(bot, bot.sequelize);
	bot.web      = new web(bot);

	return Promise.all([
		bot.utils.processor,
		bot.models.processor,
		bot.events.processor,
		bot.commands.processor,
		bot.web.processor
	]);
};
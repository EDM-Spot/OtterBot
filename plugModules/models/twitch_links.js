module.exports = function (bot, sequelize, default_options) {
	const TwitchLinks = bot.db.define("twitch_links", {
		id: {
			type: sequelize.INTEGER,
			primaryKey: true,
			allowNull: false,
			unique: true
		},
		plug: {
			type: sequelize.INTEGER,
			defaultValue: null,
			allowNull: true
		},
		key: {
			type: sequelize.STRING,
			allowNull: false
		},
		token: {
			type: sequelize.STRING,
			allowNull: false
		}
	}, default_options);

	TwitchLinks.sync();

	return TwitchLinks;
};
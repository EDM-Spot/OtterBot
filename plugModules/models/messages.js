module.exports = function (bot, sequelize, default_options) {
	const Messages = bot.db.define("messages", {
		index: {
			type: sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false
		},
		id: {
			type: sequelize.INTEGER,
			allowNull: false
		},
		username: {
			type: sequelize.STRING,
			allowNull: false
		},
		message: {
			type: sequelize.STRING,
			allowNull: false
		},
		cid: {
			type: sequelize.STRING,
			allowNull: false
		},
		command: {
			type: sequelize.BOOLEAN,
			defaultValue: false,
			allowNull: false
		},
		deleted_by: {
			type: sequelize.INTEGER,
			defaultValue: null,
			allowNull: true
		}
	}, default_options);

	Messages.sync();

	return Messages;
};
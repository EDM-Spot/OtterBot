module.exports = function (bot, sequelize, default_options) {
	const Props = bot.db.define("props", {
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
		dj: {
			type: sequelize.INTEGER,
			allowNull: false
		},
		historyID: {
			type: sequelize.STRING,
			allowNull: false
		},
		identifier: {
			type: sequelize.STRING,
			allowNull: false,
			unique: true
		}
	}, default_options);

	Props.sync();

	return Props;
};
module.exports = function (bot, sequelize, default_options) {
	const Users = bot.db.define("users", {
		id: {
			type: sequelize.INTEGER,
			primaryKey: true,
			allowNull: false,
			unique: true
		},
		props: {
			type: sequelize.REAL,
			allowNull: false,
			defaultValue: 0,
			validate: {
				min: 0
			}
		},
		points: {
			type: sequelize.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		afk_message: {
			type: sequelize.STRING,
			defaultValue: null,
			allowNull: true
		}
	}, default_options);

	Users.sync();

	return Users;
};
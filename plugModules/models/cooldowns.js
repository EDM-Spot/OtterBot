module.exports = function (bot, sequelize, default_options) {
	const Cooldowns = bot.db.define("cooldowns", {
		index: {
			type: sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false
		},
		id: {
			type: sequelize.STRING,
			allowNull: false
		},
		command: {
			type: sequelize.STRING,
			allowNull: false
		},
		length: {
			type: sequelize.INTEGER,
			allowNull: false,
			defaultValue: 3e4
		},
		type: {
			type: sequelize.ENUM("per_use", "per_user", "none"),
			allowNull: false
		}
	}, {
		timestamps: true,
		underscored: true
	});

	Cooldowns.beforeFind(function (options) {
		if (!options.hasOwnProperty("where") || !options.where.hasOwnProperty("command")) return;

		return bot.db.models.cooldowns.findAll().then(instances => {
			if (instances === null || typeof instances === "undefined")
				instances = [];

			instances = instances.map(instance => instance.toJSON()).filter(instance => new Date() > new Date(+new Date(instance.created_at) + instance.length));

			return bot.db.models.cooldowns.destroy({
				where: {
					index: {
						$in: instances.map(instance => instance.index)
					}
				}
			});
		});
	});

	Cooldowns.sync();

	return Cooldowns;
};
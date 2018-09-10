module.exports = function (bot, sequelize, default_options) {	
	const Disconnections = bot.db.define("disconnections", {
		id: {
			type: sequelize.INTEGER,
			allowNull: false,
			primaryKey: true,
			unique: true
		},
		position: {
			type: sequelize.INTEGER,
			allowNull: false,
			validate: {
				max: 49,
				min: 0
			}
		}
	}, {
		timestamps: true,
		underscored: true
	});

	Disconnections.beforeFind(function (options) {
		if (!options.hasOwnProperty("where")) return;

		return bot.db.models.disconnections.findAll().then(instances => {
			if (instances === null || typeof instances === "undefined")
				instances = [];

			instances = instances.map(instance => instance.toJSON()).filter(instance => new Date() > new Date(+new Date(instance.updated_at) + 54e5));

			return bot.db.models.disconnections.destroy({
				where: {
					id: {
						$in: instances.map(instance => instance.id)
					}
				}
			});
		});
	});

	Disconnections.sync();

	return Disconnections;
};
module.exports = async function Model(bot, sequelize) {
  const Bans = bot.db.define("bans", {
    index: {
      type: sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    id: {
      type: sequelize.INTEGER,
      allowNull: false,
    },
    type: {
      type: sequelize.STRING,
      allowNull: false,
    },
    duration: {
      type: sequelize.STRING,
      allowNull: false,
    },
  });

  await Bans.sync();

  bot.db.models.bans = Bans;

  return Bans;
};
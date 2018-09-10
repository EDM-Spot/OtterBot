module.exports = async function Model(bot, sequelize) {
  const cmdBans = bot.db.define("cmdbans", {
    id: {
      type: sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    time: {
      type: sequelize.DATE,
      allowNull: false,
      defaultValue: 0,
    },
    duration: {
      type: sequelize.STRING,
      allowNull: false,
      defaultValue: 0,
    },
  });

  await cmdBans.sync();

  bot.db.models.cmdbans = cmdBans;

  return cmdBans;
};
module.exports = async function Model(bot, sequelize) {
  const Blacklist = bot.db.define("blacklist", {
    id: {
      type: sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    cid: {
      type: sequelize.STRING,
      allowNull: false,
    },
    moderator: {
      type: sequelize.INTEGER,
      allowNull: false,
    },
  });

  await Blacklist.sync();

  bot.db.models.blacklist = Blacklist;

  return Blacklist;
};
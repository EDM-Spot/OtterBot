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
  bot.db.models.blacklist.hasMany(bot.db.models.plays, {foreignKey: "cid", sourceKey: "cid"});
  bot.db.models.blacklist.hasMany(bot.db.models.users, {foreignKey: "id", sourceKey: "moderator"});

  return Blacklist;
};
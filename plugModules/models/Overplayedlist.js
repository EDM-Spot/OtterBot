module.exports = async function Model(bot, sequelize) {
  const Overplayedlist = bot.db.define("overplayedlist", {
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
  });

  await Overplayedlist.sync();

  bot.db.models.overplayedlist = Overplayedlist;
  bot.db.models.overplayedlist.hasMany(bot.db.models.plays, {foreignKey: "cid", sourceKey: "cid"});

  return Overplayedlist;
};
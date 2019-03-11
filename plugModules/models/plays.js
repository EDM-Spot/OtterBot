module.exports = async function Model(bot, sequelize) {
  const Plays = bot.db.define("plays", {
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
    format: {
      type: sequelize.INTEGER,
      allowNull: false,
      validate: {
        max: 2,
        min: 1,
      },
    },
    woots: {
      type: sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    grabs: {
      type: sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    mehs: {
      type: sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    dj: {
      type: sequelize.INTEGER,
      allowNull: false,
    },
    skipped: {
      type: sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    author: {
      type: sequelize.STRING,
      defaultValue: "",
      allowNull: false,
    },
    title: {
      type: sequelize.STRING,
      defaultValue: "",
      allowNull: false,
    },
  });

  await Plays.sync();

  bot.db.models.plays = Plays;
  bot.db.models.plays.belongsTo(bot.db.models.blacklist, {foreignKey: "cid", sourceKey: "cid"});
  bot.db.models.plays.belongsTo(bot.db.models.overplayedlist, {foreignKey: "cid", sourceKey: "cid"});
  bot.db.models.plays.belongsTo(bot.db.models.users, {foreignKey: "dj", sourceKey: "id"});

  return Plays;
};
module.exports = async function Model(bot, sequelize) {
  const Props = bot.db.define("props", {
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
    dj: {
      type: sequelize.INTEGER,
      allowNull: false,
    },
    historyID: {
      type: sequelize.STRING,
      allowNull: false,
      field: "historyID",
    },
    identifier: {
      type: sequelize.STRING,
      allowNull: false,
      unique: true,
    },
  });

  await Props.sync();

  bot.db.models.props = Props;

  return Props;
};
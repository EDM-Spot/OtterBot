module.exports = async function Model(bot, sequelize) {
  const Holiday = bot.db.define("holiday", {
    id: {
      type: sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    played: {
      type: sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    currency: {
      type: sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    ticket: {
      type: sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  });

  await Holiday.sync();

  bot.db.models.holiday = Holiday;
  bot.db.models.holiday.belongsTo(bot.db.models.users, {foreignKey: "id", sourceKey: "id"});

  return Holiday;
};
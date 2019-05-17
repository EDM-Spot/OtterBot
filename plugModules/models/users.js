module.exports = async function Model(bot, sequelize) {
  const Users = bot.db.define("users", {
    id: {
      type: sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    username: {
      type: sequelize.STRING,
      allowNull: false,
    },
    last_seen: {
      type: sequelize.DATE,
      allowNull: false,
      defaultValue: sequelize.NOW,
    },
    wl_position: {
      type: sequelize.INTEGER,
      allowNull: false,
      defaultValue: -1,
    },
    props: {
      type: sequelize.REAL,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    points: {
      type: sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    discord: {
      type: sequelize.BIGINT,
      allowNull: true,
    },
    badge: {
      type: sequelize.STRING,
      allowNull: true,
    },
    props_to_give: {
      type: sequelize.INTEGER,
      allowNull: true,
    },
    last_props_give_reset: {
      type: sequelize.DATE,
      allowNull: true,
    },
    producer: {
      type: sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
  });

  await Users.sync();

  bot.db.models.users = Users;
  bot.db.models.users.belongsTo(bot.db.models.blacklist, {foreignKey: "id", sourceKey: "moderator"});
  bot.db.models.users.hasMany(bot.db.models.plays, {foreignKey: "dj", sourceKey: "id"});
  bot.db.models.users.hasMany(bot.db.models.holiday, {foreignKey: "id", sourceKey: "id"});

  return Users;
};
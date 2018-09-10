module.exports = async function Model(bot, sequelize) {
  const Messages = bot.db.define("messages", {
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
    username: {
      type: sequelize.STRING,
      allowNull: false,
    },
    message: {
      type: sequelize.STRING,
      allowNull: false,
    },
    cid: {
      type: sequelize.STRING,
      allowNull: false,
    },
    command: {
      type: sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    deleted_by: {
      type: sequelize.INTEGER,
      defaultValue: null,
      allowNull: true,
    },
  });

  await Messages.sync();

  bot.db.models.messages = Messages;

  return Messages;
};
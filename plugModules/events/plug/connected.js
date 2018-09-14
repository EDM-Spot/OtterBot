module.exports = function Event(bot, filename, platform) {
  const event = {
    name: "connected",
    platform,
    _filename: filename,
    run: async () => {
      // Following the same reason to wait here as discord ready 
      await bot.wait(2000);

      await bot.plug.sendChat(bot.lang.startup);

      await bot.lottery.start();

      const user = bot.plug.getUsers();
      for (var i = 0; i < user.lenght; i++) {
        await bot.db.models.users.findOrCreate({
          where: { id: user[i].id }, defaults: { id: user[i].id, username: user[i].username }
        });
        
        await bot.db.models.users.update(
          { username: user[i].username },
          { where: { id: user[i].id }, defaults: { id: user[i].id }}
        );
      }
      
      console.info("[!] Plug Connected!");
      
      (function repeat() {
        bot.plug.sendChat("Join our Discord https://discord.gg/GETaTWm");
        setTimeout(repeat, 3600000);
      })();
    },
    init() {
      bot.plug.on(this.name, this.run);
    },
    kill() {
      bot.plug.removeListener(this.name, this.run);
    },
  };

  bot.events.register(event);
};
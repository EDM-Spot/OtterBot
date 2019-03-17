const moment = require("moment");
require("moment-timer");

module.exports = function Event(bot, filename, platform) {
  const event = {
    name: "connected",
    platform,
    _filename: filename,
    run: async () => {
      // Following the same reason to wait here as discord ready 
      await bot.wait(2000);

      await bot.plug.sendChat(bot.lang.startup);
      
      await bot.utils.otterDJ().then(res => res.join());

      await bot.lottery.start();

      const user = bot.plug.getUsers();
      for (var i = 0; i < user.lenght; i++) {
        await bot.db.models.users.findOrCreate({
          where: { id: user[i].id }, defaults: { id: user[i].id, username: user[i].username }
        });
      }
      
      console.info("[!] Plug Connected!");

      var randomTimedText = [
        "Join our Discord https://discord.gg/GETaTWm",
        "Feel free to visit our website here: https://edmspot.tk/",
        "Don't forget to read our Rules https://edmspot.tk/rules",
        "Want a custom Badge? See how here: http://prntscr.com/ls533n",
        "Link your account with discord to be able to play discord games and more! See how here: http://prntscr.com/ls539m",
        "Think you can be a good addition to the staff? Apply here: https://tinyurl.com/edmspotstaffapp"
      ];

      new moment.duration(120, "minutes").timer({loop: true, start: true}, async () => {
        var randomNumber = Math.floor(Math.random() * randomTimedText.length);
        bot.plug.sendChat(randomTimedText[randomNumber]);
      });

      new moment.duration(24, "hours").timer({loop: true, start: true}, async () => {
        await bot.utils.otterDJ().then(res => res.update(100));
      });

      new moment.duration(60, "minutes").timer({loop: true, start: true, executeAfterWait: true}, async () => {
        await bot.utils.timeCover();
      });
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
module.exports = function Command(bot) {
  bot.plugCommands.register({
  names: ["otterDJ", "odj"],
  minimumPermission: 2000,
  cooldownType: "none",
  cooldownDuration: 0,
  parameters: "<update|join|playlist|skip|leave> [function|param]",
  description: "Controls OtterBot within the waitlist.",
  async execute(rawData, { args }, lang) { // eslint-disable-line no-unused-vars
    if (args.length && args[0] === "update") {
      
      const limit = args[1] || 100;
      await bot.utils.otterDJ().then(res => res.update(limit));

    } else if (args.length && args[0] === "join") {

      await bot.utils.otterDJ().then(res => res.join());

    } else if (args.length && args[0] === "playlist") {

      bot.plug.getActivePlaylist(activePlaylist => {
        if (args[1] && args[1] === "delete") {
          bot.plug.deletePlaylist(activePlaylist.id, (err, data) => {
            if (err) {
              console.error("PL DEL ERR: ", err);
            } else {
              this.reply(lang.otterDJ.playlist.delete, { playlist: data.name }, 6e4);
            }
          });
        } else {
          this.reply(lang.otterDJ.playlist.current, {
            playlist: activePlaylist.name,
            count: activePlaylist.count
          }, 6e4);
        }
      });

    } else if (args.length && args[0] === "skip") {

      bot.plug.selfSkip(() => this.reply(lang.otterDJ.skip));

    } else if (args.length && args[0] === "leave") {

      bot.plug.leaveBooth((err, data) => {
        if (err) {
          console.error("LEAVE ERR", err);
        } else {
          this.reply(lang.otterDJ.left);
        }
      })

    }
  },
  });
};
// The MESSAGE event runs anytime a message is received
// Note that due to the binding of client to every event, every event
// goes `client, other, args` when this function is run.
const { isNil } = require("lodash");

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(message) {
    // It's good practice to ignore other bots. This also makes your bot ignore itself
    //  and not get into a spam loop (we call that "botception").
    if (message.author.bot) return;

    // Delete messages in bot only channels
    if (message.channel.id === "486637288923725824" || message.channel.id === "487985043776733185"
           || message.channel.id === "536278824753561630") {
      message.delete();
      return;
    }

    const allowedChannels = [
      "485173051432894491",
      "487253193894658049",
      "490172887085613076",
      "487728777669902347",
      "487247526622134274",
      "486597265520328707",
      "487337286128893972"
    ];

    if (allowedChannels.includes(message.channel.id)) {
      const userID = await this.client.db.models.users.findOne({
        where: {
          discord: message.author.id,
        },
      });

      if (!isNil(userID)) {
        await this.client.db.models.users.increment("points", { by: 1, where: { discord: message.author.id } });
      }
    }

    if (message.channel.id === "486125808553820160") {
      const userDB = await this.client.db.models.users.findOne({
        where: {
          discord: message.author.id,
        },
      });

      //if (isNil(userDB)) {
      //  return message.reply("You need to link your account first! Read how here: https://edmspot.tk/faq");
      //} else {
      //  this.client.plug.sendChat(userDB.get("username") + ": " + message.content);
      //}
    }

    // Grab the settings for this server from the Enmap
    // If there is no guild, get default conf (DMs)
    const settings = this.client.getSettings(message.guild);

    // For ease of use in commands and functions, we'll attach the settings
    // to the message object, so `message.settings` is accessible.
    message.settings = settings;

    // Also good practice to ignore any message that does not start with our prefix,
    // which is set in the configuration file.
    if (message.content.indexOf(settings.prefix) !== 0) return;

    // Here we separate our "command" name, and our "arguments" for the command.
    // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
    // command = say
    // args = ["Is", "this", "the", "real", "life?"]
    const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // Get the user or member's permission level from the elevation
    const level = this.client.permlevel(message);

    // Check whether the command, or alias, exist in the collections defined
    // in app.js.
    const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));
    // using this const varName = thing OR otherthign; is a pretty efficient
    // and clean way to grab one of 2 values!
    if (!cmd) return;

    // Some commands may not be useable in DMs. This check prevents those commands from running
    // and return a friendly error message.
    if (cmd && !message.guild && cmd.conf.guildOnly)
      return message.channel.send("This command is unavailable via private message. Please run this command in a guild.");

    if (level < this.client.levelCache[cmd.conf.permLevel]) {
      if (settings.systemNotice === "true") {
        return message.channel.send(`You do not have permission to use this command.
Your permission level is ${level} (${this.client.config.permLevels.find(l => l.level === level).name})
This command requires level ${this.client.levelCache[cmd.conf.permLevel]} (${cmd.conf.permLevel})`);
      } else {
        return;
      }
    }
      
    // To simplify message arguments, the author's level is now put on level (not member, so it is supported in DMs)
    // The "level" command module argument will be deprecated in the future.
    message.author.permLevel = level;

    message.flags = [];
    while (args[0] &&args[0][0] === "-") {
      message.flags.push(args.shift().slice(1));
    }
    
    // If the command exists, **AND** the user has permission, run it.
    //this.client.logger.log(`${this.client.config.permLevels.find(l => l.level === level).name} ${message.author.username} (${message.author.id}) ran command ${cmd.help.name}`, "cmd");
    cmd.run(message, args, level);
  }
};
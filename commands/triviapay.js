const Command = require("../base/Command.js");
const { isNil, isNaN, isObject } = require("lodash");

class TriviaPay extends Command {
  constructor(client) {
    super(client, {
      name: "triviapay",
      description: "Pay to start Trivia.",
      usage: "triviapay 1-3"
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    try {
      message.delete();
      
      if (!args.length) { return; }

      const cooldown = await this.client.redis.getCommandOnCoolDown("discord", "trivia@start", "perUse");

      if (cooldown != -2) {
        return message.reply("Hold on! The last Trivia was " + Math.floor((3600 - cooldown) / 60) + " minute(s) ago, you must wait " + Math.ceil(cooldown / 60) + " minute(s) to start another Trivia.");
      }

      const price = parseInt(args.pop(), 10);

      if (isNaN(price) || price < 1 || price > 3) {
        return false;
      }

      const userDB = await this.client.db.models.users.findOne({
        where: {
          discord: message.author.id,
        },
      });

      if (isNil(userDB)) {
        return message.reply("You need to link your account first! Read how here: http://prntscr.com/ls539m");
      }

      const userID = userDB.get("discord");

      const user = this.client.plug.getUser(userDB.get("id"));

      const dj = this.client.plug.getDJ();

      if (!user || typeof user.username !== "string" || !user.username.length) {
        return message.reply("You're not online on plug!");
      }

      const userPos = this.client.plug.getWaitListPosition(user.id);

      if (this.client.triviaUtil.started) {
        return message.reply("Trivia already started!");
      } else if (isObject(dj) && dj.id === user.id) {
        return message.reply("You can't join while playing!");
      } else if (userPos >= 0 && userPos <= 5) {
        return message.reply("You are too close to DJ.");
      }

      const [inst] = await this.client.db.models.users.findOrCreate({ where: { id: user.id }, defaults: { id: user.id } });

      const props = inst.get("props");

      if (props < price) {
        return message.reply("You don't have enough props.");
      }

      await inst.decrement("props", { by: price });
      await this.client.db.models.users.increment("props", { by: price, where: { id: "40333310" } });

      if (this.client.triviaUtil.propsStored == 0) {
        message.channel.send("Someone paid to start a Trivia! Use `-triviapay 1-3` to use your props to start the Trivia.");
        await this.client.plug.sendChat("Someone paid to start a Trivia! Use `-triviapay 1-3` in discord to use your props to start the Trivia.");
        await this.client.plug.sendChat("Join EDM Spot's Official Discord: https://discord.gg/GETaTWm");
      }

      this.client.triviaUtil.propsStored += price;

      if (this.client.triviaUtil.propsStored >= 10) {
        const cmd = this.client.commands.get("trivia") || this.client.commands.get(this.client.aliases.get("trivia"));
        if (!cmd) return;

        cmd.run(message, "", "Bot Admin");
      }

      if (this.client.triviaUtil.propsStored < 10) {
        message.channel.send(this.client.triviaUtil.propsStored + "/10 to start the Trivia!");
        await this.client.plug.sendChat(this.client.triviaUtil.propsStored + "/10 to start the Trivia!");
      }

      if (this.client.triviaUtil.players.includes(userID)) return message.reply("Paid more " + price + " Props.");

      this.client.triviaUtil.add(userID);
      await this.client.guilds.get("485173051432894489").members.get(message.author.id).addRole("512635547320188928").catch(console.error);

      return message.reply("Paid " + price + " Props And Joined Next Trivia.");
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = TriviaPay;

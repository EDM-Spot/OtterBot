// Original Version https://github.com/1Computer1/kaado/blob/master/src/commands/games/slots.js
const Command = require("../base/Command.js");
const { isNil, isNaN, isObject } = require("lodash");
const { SlotMachine, SlotSymbol } = require("slot-machine");

const symbols = [
  new SlotSymbol("lemon", { display: "🍋", points: 1, weight: 100 }),
  new SlotSymbol("watermelon", { display: "🍉", points: 1, weight: 100 }),
  new SlotSymbol("apple", { display: "🍎", points: 1, weight: 100 }),
  new SlotSymbol("grape", { display: "🍇", points: 1, weight: 100 }),
  new SlotSymbol("orange", { display: "🍊", points: 1, weight: 100 }),
  new SlotSymbol("cherry", { display: "🍒", points: 1, weight: 100 }),
  new SlotSymbol("wild", { display: "❔", points: 1, weight: 40, wildcard: true }),
  new SlotSymbol("bell", { display: "🔔", points: 2, weight: 40 }),
  new SlotSymbol("clover", { display: "🍀", points: 3, weight: 35 }),
  new SlotSymbol("music", { display: "🎵", points: 0, weight: 50 }),
  new SlotSymbol("dj", { display: "🎧", points: 0, weight: 35 }),
  new SlotSymbol("heart", { display: "❤", points: 4, weight: 30 }),
  new SlotSymbol("money", { display: "💰", points: 5, weight: 25 }),
  new SlotSymbol("diamond", { display: "💎", points: 10, weight: 3 }),
  new SlotSymbol("jackpot", { display: "🔅", points: 50, weight: 5})
];

class Slots extends Command {
  constructor(client) {
    super(client, {
      name: "Slots",
      description: "Bet Props in the Slot Machine",
      usage: "slots 3-20",
      permLevel: "Bot Admin"
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    try {
      message.delete();
      
      if (!args.length) { return; }

      const cooldown = await this.client.redis.getCommandOnCoolDown("discord", "slots@play", "perUser");

      if (cooldown != -2) {
        return message.reply("Hold on! You already played Slots " + Math.floor((7200 - cooldown) / 120) + " minute(s) ago, you must wait " + Math.ceil(cooldown / 120) + " minute(s) to play again.");
      }

      const price = parseInt(args.pop(), 10);

      if (isNaN(price) || price < 3 || price > 20) {
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

      const [inst] = await this.client.db.models.users.findOrCreate({ where: { id: user.id }, defaults: { id: user.id } });

      const props = inst.get("props");

      if (props < price) {
        return message.reply("You don't have enough props.");
      }

      await inst.decrement("props", { by: 0 });

      const machine = new SlotMachine(3, symbols);
      const results = machine.play();

      const embed = this.client.util.embed();
      const dollarSigns = "   💲 💲 💲   ";

      embed.description = (results.lines.slice(-2)[0].isWon ? "\n↘" : "\n⬛") + dollarSigns + (results.lines.slice(-1)[0].isWon ? "↙" : "⬛");

      for (let i = 0; i < results.lines.length - 2; i++) {
        embed.description += (results.lines[i].isWon ? "\n➡   " : "\n⬛   ") + results.lines[i].symbols.map(s => s.display).join(" ") + (results.lines[i].isWon ? "   ⬅" : "   ⬛");
      }

      embed.description += (results.lines.slice(-1)[0].isWon ? "\n↗" : "\n⬛") + dollarSigns + (results.lines.slice(-2)[0].isWon ? "↖" : "⬛");

      const points = results.lines.reduce((total, line) => total + line.points, 0);
      const payout = price * points;

      embed.addField(
        points ? "You have won!" : "You have lost!",
        points ? `You have earned ${payout.toLocaleString()} Props` : "Better luck next time!"
      );

      await inst.increment("props", { by: 0 });

      await this.client.redis.placeCommandOnCooldown("discord", "slots@play", "perUser", 1, 7200);

      return message.channel.send({ embed });





      const dj = this.client.plug.getDJ();
      const userPos = this.client.plug.getWaitListPosition(user.id);

      if (!user || typeof user.username !== "string" || !user.username.length) {
        return message.reply("You're not online on plug!");
      }

      if (this.client.triviaUtil.started) {
        return message.reply("Trivia already started!");
      } else if (isObject(dj) && dj.id === user.id) {
        return message.reply("You can't join while playing!");
      } else if (userPos >= 0 && userPos <= 5) {
        return message.reply("You are too close to DJ.");
      }

      if (this.client.triviaUtil.propsStored == 0) {
        message.channel.send("Someone paid to start a Trivia! Use `-triviapay 1-3` to use your props to start the Trivia.");
        await this.client.plug.sendChat("Someone paid to start a Trivia! Use `-triviapay 1-3` in discord to use your props to start the Trivia. \n Join EDM Spot's Official Discord: https://discord.gg/GETaTWm");
      }

      this.client.triviaUtil.propsStored += price;

      if (this.client.triviaUtil.propsStored >= 10) {
        const cmd = this.client.commands.get("trivia") || this.client.commands.get(this.client.aliases.get("trivia"));
        if (!cmd) return;

        cmd.run(message, "", "Bot Admin");
      }

      if (this.client.triviaUtil.propsStored < 10) {
        message.channel.send(this.client.triviaUtil.propsStored + "/10 to start the Trivia!");
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

module.exports = Slots;

// Original Version https://github.com/1Computer1/kaado/blob/master/src/commands/games/slots.js
const Command = require("../base/Command.js");
const Discord = require("discord.js");
const { isNil, isNaN, isObject } = require("lodash");
const { SlotMachine, SlotSymbol } = require("slot-machine");

const symbols = [
  new SlotSymbol("lemon", { display: "🍋", points: 1, weight: 100 }),
  new SlotSymbol("watermelon", { display: "🍉", points: 1, weight: 100 }),
  new SlotSymbol("apple", { display: "🍎", points: 1, weight: 100 }),
  new SlotSymbol("grape", { display: "🍇", points: 1, weight: 100 }),
  new SlotSymbol("orange", { display: "🍊", points: 1, weight: 100 }),
  new SlotSymbol("cherry", { display: "🍒", points: 1, weight: 100 }),
  new SlotSymbol("wild", { display: "❔", points: 1, weight: 25, wildcard: true }),
  new SlotSymbol("bell", { display: "🔔", points: 2, weight: 40 }),
  new SlotSymbol("clover", { display: "🍀", points: 3, weight: 35 }),
  new SlotSymbol("music", { display: "🎵", points: 1, weight: 50 }),
  new SlotSymbol("dj", { display: "🎧", points: 1, weight: 10 }),
  new SlotSymbol("heart", { display: "❤", points: 4, weight: 30 }),
  new SlotSymbol("money", { display: "💰", points: 5, weight: 25 }),
  new SlotSymbol("diamond", { display: "💎", points: 10, weight: 3 }),
  new SlotSymbol("jackpot", { display: "🔅", points: 50, weight: 5})
];

class Slots extends Command {
  constructor(client) {
    super(client, {
      name: "slots",
      description: "Bet Props in the Slot Machine",
      usage: "slots 1-20"
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    try {
      message.delete();
      
      if (!args.length) { return; }

      const cooldown = await this.client.redis.getCommandOnCoolDown("discord", "slots@play", "perUser", message.author.id);

      if (cooldown != -2) {
        return message.reply("Hold on! You already played Slots " + Math.floor((3600 - cooldown) / 60) + " minute(s) ago, you must wait " + Math.ceil(cooldown / 60) + " minute(s) to play again.");
      }

      const price = parseInt(args.pop(), 10);

      if (isNaN(price) || price < 1 || price > 20) {
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

      const user = this.client.plug.getUser(userDB.get("id"));

      const [inst] = await this.client.db.models.users.findOrCreate({ where: { id: userDB.get("id") }, defaults: { id: userDB.get("id") } });

      const props = inst.get("props");

      if (props < price) {
        return message.reply("You don't have enough props.");
      }

      await inst.decrement("props", { by: price });

      const machine = new SlotMachine(3, symbols);
      const results = machine.play();

      let moveTo3 = false;
      let moveDown3 = false;

      const embed = new Discord.RichEmbed();
      const dollarSigns = "   💲 💲 💲   ";

      embed.description = (results.lines.slice(-2)[0].isWon ? "\n↘" : "\n⬛") + dollarSigns + (results.lines.slice(-1)[0].isWon ? "↙" : "⬛");

      if (results.lines.slice(-2)[0].isWon && results.lines.slice(-2)[0].symbols.map(s => s.name).includes("dj")) {
        moveTo3 = true;
      } else if (results.lines.slice(-2)[0].isWon && results.lines.slice(-2)[0].symbols.map(s => s.name).includes("music")) {
        moveDown3 = true;
      }

      for (let i = 0; i < results.lines.length - 2; i++) {
        embed.description += (results.lines[i].isWon ? "\n➡   " : "\n⬛   ") + results.lines[i].symbols.map(s => s.display).join(" ") + (results.lines[i].isWon ? "   ⬅" : "   ⬛");

        if (results.lines[i].isWon && results.lines[i].symbols.map(s => s.name).includes("dj")) {
          moveTo3 = true;
        } else if (results.lines[i].isWon && results.lines[i].symbols.map(s => s.name).includes("music")) {
          moveDown3 = true;
        }
      }

      embed.description += (results.lines.slice(-1)[0].isWon ? "\n↗" : "\n⬛") + dollarSigns + (results.lines.slice(-2)[0].isWon ? "↖" : "⬛");

      if (results.lines.slice(-1)[0].isWon && results.lines.slice(-1)[0].symbols.map(s => s.name).includes("dj")) {
        moveTo3 = true;
      } else if (results.lines.slice(-1)[0].isWon && results.lines.slice(-1)[0].symbols.map(s => s.name).includes("music")) {
        moveDown3 = true;
      }

      const points = results.lines.reduce((total, line) => total + line.points, 0);
      const payout = price * points;

      embed.addField(
        points ? `${message.author.username}, You have won!` : `${message.author.username}, You have lost!`,
        points ? `You have earned ${payout} Props` : `Lost ${price} Props. Better luck next time!`
      );

      await inst.increment("props", { by: payout });

      const dj = this.client.plug.getDJ();
      const userPos = this.client.plug.getWaitListPosition(userDB.get("id"));

      if (!user || typeof user.username !== "string" || !user.username.length) {
        message.reply("You're not online on plug! Can't Move.");
      } else if ((isObject(dj) && dj.id !== user.id) || (userPos >= 5)) {
        if (moveTo3) {
          await this.client.plug.sendChat("@" + user.username + " Won Spot 3 in the Slot Machine! Moving to 3...");

          this.client.queue.add(user, 3);
        } else if (moveDown3) {
          await this.client.plug.sendChat("@" + user.username + " Won 3 Spots in the Slot Machine! Moving Down 3...");

          this.client.queue.add(user, userPos - 3);
        }
      }

      await this.client.redis.placeCommandOnCooldown("discord", "slots@play", "perUser", message.author.id, 3600);

      return message.channel.send({ embed });
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Slots;

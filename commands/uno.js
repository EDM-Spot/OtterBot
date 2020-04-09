// Original Version https://github.com/1Computer1/kaado/blob/master/src/commands/games/poker.js
const Command = require("../base/Command.js");
const { isNil, isNaN, isObject } = require("lodash");
const { ROLE } = require("miniplug");
const moment = require("moment");
require("moment-timer");

class Uno extends Command {
  constructor(client) {
    super(client, {
      name: "uno",
      description: "Start a Uno Game",
      usage: "['start', 'join', 'table', 'play <colour> <value>', 'pick', 'hand', 'reset'. 'exit']"
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    try {
      //message.delete();

      if (!args.length) { return; }

      const params = ["start", "join", "play", "pick", "hand", "table", "reset", "exit"];
      const param = `${args.shift()}`.toLowerCase();

      if (!params.includes(param)) {
        return message.reply(`Invalid Param: ${param}`);
      }

      const price = 0;

      const userDB = await this.client.db.models.users.findOne({
        where: {
          discord: message.author.id,
        },
      });

      if (isNil(userDB)) {
        return message.reply("You need to link your account first! Read how here: http://prntscr.com/ls539m");
      }

      const [inst] = await this.client.db.models.users.findOrCreate({ where: { id: userDB.get("id") }, defaults: { id: userDB.get("id") } });

      const userID = userDB.get("discord");

      switch (param) {
        case "start": {
          const cooldown = await this.client.redis.getCommandOnCoolDown("discord", "uno@play", "perUse");

          if (cooldown != -2) {
            return message.reply("Hold on! Uno runned " + Math.floor((3600 - cooldown) / 60) + " minute(s) ago, you must wait " + Math.ceil(cooldown / 60) + " minute(s) to play again.");
          }

          if (isNaN(price)) {
            return false;
          }

          if (await this.client.roulette.check() || await this.client.russianRoulette.check() || this.client.triviaUtil.check() || this.client.unoUtil.checkGame() || this.client.unoUtil.checkGame()) {
            return message.reply("There's a Game running already!");
          }

          let startMessage = `A new Uno Game has been created. Entry Fee: ${price} Prop. \n`;
          startMessage += "You will be warned 30 seconds before it starts. \n";
          startMessage += `A maximum of ${this.client.unoUtil.maxPlayers} players can play. \n`;
          startMessage += "The game will start in 1 minute. Join the game with `-uno join` \n";
          startMessage += "Good Luck!";
          message.channel.send(startMessage);

          this.client.plug.chat("Discord Uno Game will start in 1 minute in channel #" + message.channel.name + "!");
          this.client.plug.chat("Join EDM Spot's Official Discord: https://discord.gg/QvvD8AC");

          this.client.unoUtil.running = true;

          //new moment.duration(270000, "milliseconds").timer({loop: false, start: true}, async () => {
          //message.channel.send("<@&512635547320188928> 30 Seconds left until start!");
          //});

          new moment.duration(1, "minutes").timer({ loop: false, start: true }, async () => {
            if (this.client.unoUtil.queue.length < this.client.unoUtil.minPlayers) {
              message.channel.send(`Not enough players (${this.client.unoUtil.minPlayers} required) to play this game.`);
              await this.client.unoUtil.end();
            } else {
              await this.client.unoUtil.start();

              console.log(this.client.unoUtil.player.user.username);
              console.log(this.client.unoUtil.player.member.username);
              message.channel.send(this.client.unoUtil.embed(`The game has begun with ${this.client.unoUtil.queue.length} players! The currently flipped card is: **${this.client.unoUtil.flipped}**. \n\nIt is now ${this.client.unoUtil.player.member.username}'s turn!`));
            }
          });

          await this.client.redis.placeCommandOnCooldown("discord", "uno@play", "perUse", 3600);

          return true;
        }
        case "join": {
          if (!this.client.unoUtil.checkGame() && !this.client.unoUtil.started) {
            return message.reply("Uno is not running!");
          } else if (this.client.unoUtil.queue.length >= this.client.unoUtil.maxPlayers) {
            return message.reply("The game is Full!");
          }

          const props = inst.get("props");

          if (props < price) {
            return message.reply("You don't have enough props.");
          }

          await inst.decrement("props", { by: price });
          await this.client.db.models.users.increment("props", { by: price, where: { id: "40333310" } });

          this.client.unoUtil.addPlayer(message.author);
          await this.client.guilds.cache.get("485173051432894489").members.cache.get(message.author.id).roles.add("512635547320188928").catch(console.error);

          return message.reply("Joined Uno.");
        }
        case "play": {
          if (!this.client.unoUtil.started) {
            return message.reply("Uno is not running!");
          }

          if (this.client.unoUtil.player.id !== message.author.id) {
            return message.reply(`It's not your turn yet! It's currently ${this.client.unoUtil.player.member.user.username}'s turn.`);
          }

          let cardArgs = args;
          cardArgs.shift();

          let card = await this.client.unoUtil.player.getCard(cardArgs);
          if (card === null) return;
          if (!card) return message.reply("It doesn't seem like you have that card! Try again.");

          this.client.unoUtil.player.cardsPlayed++;

          if (!this.client.unoUtil.flipped.color || card.wild || card.id === this.client.unoUtil.flipped.id || card.color === this.client.unoUtil.flipped.color) {

            this.client.unoUtil.discard.push(card);
            this.client.unoUtil.player.hand.splice(this.client.unoUtil.player.hand.indexOf(card), 1);
            this.client.unoUtil.player.cardsChanged();

            let pref = '';
            if (this.client.unoUtil.player.hand.length === 0) {
              this.client.unoUtil.finished.push(this.client.unoUtil.player);
              this.client.unoUtil.player.finished = true;

              pref = `${this.client.unoUtil.player.member.user.username} has no more cards! They finished in **Rank #${this.client.unoUtil.finished.length}**! :tada:\n\n`;
              if (2 === this.client.unoUtil.queue.length) {
                this.client.unoUtil.finished.push(this.client.unoUtil.queue[1]);
                pref = this.client.unoUtil.scoreboard();
                return message.channel.send(pref);
              }
            }

            let extra = '';
            switch (card.id) {
              case 'REVERSE':
                if (this.client.unoUtil.queue.length > 2) {
                  let player = this.client.unoUtil.queue.shift();

                  this.client.unoUtil.queue.reverse();
                  this.client.unoUtil.queue.unshift(player);

                  extra = `Turns are now in reverse order! `;

                  break;
                } else {
                  let skipped = this.client.unoUtil.queue.shift();
                  this.client.unoUtil.queue.push(skipped);

                  extra = `Sorry, ${this.client.unoUtil.player.member.user.username}! Skip a turn! `;
                  break;
                }
              case 'SKIP':
                let skipped = this.client.unoUtil.queue.shift();
                this.client.unoUtil.queue.push(skipped);

                extra = `Sorry, ${this.client.unoUtil.player.member.user.username}! Skip a turn! `;

                break;
              case '+2':
                let amount = 0;
                for (let i = this.client.unoUtil.discard.length - 1; i >= 0; i--) {
                  if (this.client.unoUtil.discard[i].id === '+2')
                    amount += 2;
                  else break;
                }
                this.client.unoUtil.deal(this.client.unoUtil.queue[1], amount);
                extra = `${this.client.unoUtil.queue[1].member.user.username} picks up ${amount} cards! Tough break. `;

                extra += ' Also, skip a turn!';
                this.client.unoUtil.queue.push(this.client.unoUtil.queue.shift());

                break;
              case 'WILD':
                extra = `In case you missed it, the current color is now **${card.colorName}**! `;

                break;
              case 'WILD+4': {
                // let player = this.client.unoUtil.queue.shift();
                await this.client.unoUtil.deal(this.client.unoUtil.queue[1], 4);

                // this.client.unoUtil.queue.unshift(player);
                extra = `${this.client.unoUtil.queue[1].member.user.username} picks up 4! The current color is now **${card.colorName}**! `;

                extra += ' Also, skip a turn!';

                let skipped = this.client.unoUtil.queue.shift();
                this.client.unoUtil.queue.push(skipped);

                break;
              }
            }

            await this.client.unoUtil.next();

            return message.channel.send(this.client.unoUtil.embed(`${pref}${drawn ? `${message.author.username} has drawn and auto-played a **${this.client.unoUtil.flipped}**.` : `A **${this.client.unoUtil.flipped}** has been played.`} ${extra}\n\nIt is now ${this.client.unoUtil.player.member.user.username}'s turn!`));
          } else {
            return message.reply("Sorry, you can't play that card here!");
          }
        }
        case "pick": {
          if (!this.client.unoUtil.started) {
            return message.reply("Uno is not running!");
          }

          if (this.client.unoUtil.player.id !== message.author.id) {
            return message.reply(`It's not your turn yet! It's currently ${this.client.unoUtil.player.member.user.username}'s turn.`);
          }

          // if (game.rules.MUST_PLAY === true) {
          //   for (const card of this.client.unoUtil.player.hand) {
          //     if (!this.client.unoUtil.flipped.color || card.wild || card.id === this.client.unoUtil.flipped.id
          //       || card.color === this.client.unoUtil.flipped.color) {
          //       return 'Sorry, you have to play a card if you\'re able!';
          //     }
          //   }
          // }

          let [card] = await this.client.unoUtil.deal(this.client.unoUtil.player, 1);
          // if (game.rules.DRAW_AUTOPLAY === true
          //   && (!this.client.unoUtil.flipped.color || card.wild || card.id === this.client.unoUtil.flipped.id || card.color === this.client.unoUtil.flipped.color)) {
          //   return await commands.play(message, card.toString().split(' '), true);
          // }

          let player = this.client.unoUtil.player;

          await this.client.unoUtil.next();

          return message.channel.send(this.client.unoUtil.embed(`${player.member.user.username} picked up a card.\n\nA **${this.client.unoUtil.flipped}** was played last. \n\nIt is now ${this.client.unoUtil.player.member.user.username}'s turn!`));
        }
        case "hand": {
          if (!this.client.unoUtil.started) {
            return message.reply("Uno is not running!");
          }

          let player = this.client.unoUtil.players[message.author.id];
          await player.sendHand();

          return message.reply("Sent your hand to DM.");
        }
        case "table": {
          if (!this.client.unoUtil.started) {
            return message.reply("Uno is not running!");
          }

          let diff = moment.duration(moment() - this.client.unoUtil.timeStarted);
          let d = [];

          if (diff.days() > 0) d.push(`${diff.days()} day${diff.days() === 1 ? '' : 's'}`);
          if (diff.hours() > 0) d.push(`${diff.hours()} hour${diff.hours() === 1 ? '' : 's'}`);

          d.push(`${diff.minutes()} minute${diff.minutes() === 1 ? '' : 's'}`);

          if (d.length > 1) {
            d[d.length - 1] = 'and ' + d[d.length - 1];
          }

          d = d.join(', ');

          let out = this.client.unoUtil.embed(`A ** ${this.client.unoUtil.flipped}** has been played.\n\nIt is currently ${this.client.unoUtil.player.member.user.username} 's turn!`);

          out.content = `Here are the players in this game:\n${this.client.unoUtil.queue.map(p => `**${p.member.user.username}** | ${p.hand.length} card(s)`).join('\n')}`
            + `\n\nThis game has lasted **${d}**. **${this.client.unoUtil.drawn}** cards have been drawn!\n\n`;

          return message.channel.send(out);
        }
        case "exit": {
          if (!this.client.unoUtil.started) {
            return message.reply("Uno is not running!");
          }

          if (this.client.unoUtil.players.hasOwnProperty(message.author.id)) {

            let out = 'You are no longer participating in the game.\n\n';

            this.client.unoUtil.dropped.push(this.client.unoUtil.players[message.author.id]);

            if (this.client.unoUtil.started && this.client.unoUtil.queue.length <= 2) {
              this.client.unoUtil.queue = this.client.unoUtil.queue.filter(p => p.id !== message.author.id);
              this.client.unoUtil.finished.push(this.client.unoUtil.queue[0]);

              out += this.client.unoUtil.scoreboard();

              return message.channel.send(out);
            }

            if (this.client.unoUtil.started && this.client.unoUtil.player.member.id === message.author.id) {
              this.client.unoUtil.next();

              out = this.client.unoUtil.embed(`${out}A **${this.client.unoUtil.flipped}** was played last. \n\nIt is now ${this.client.unoUtil.player.member.user.username}'s turn!`);
            }

            delete this.client.unoUtil.players[message.author.id];

            this.client.unoUtil.queue = this.client.unoUtil.queue.filter(p => p.id !== message.author.id);

            if (!this.client.unoUtil.started, this.client.unoUtil.queue.length === 0) {
              out = 'The game has been cancelled.';
            }

            return message.channel.send(out);
          } else {
            return message.reply('You haven\'t joined!');
          }
        }
        case "reset": {
          const user = this.client.plug.user(userDB.get("id"));

          if (!isObject(user) || await this.client.utils.getRole(user) <= ROLE.MANAGER) return false;

          await this.client.unoUtil.end();
          await this.client.redis.removeCommandFromCoolDown("discord", "uno@play", "perUse");

          return message.reply("The cooldown for uno has been reset!");
        }
        default:
          return false;
      }
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Uno;

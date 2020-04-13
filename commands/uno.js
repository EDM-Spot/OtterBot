// Original Version https://github.com/1Computer1/kaado/blob/master/src/commands/games/poker.js
const Command = require("../base/Command.js");
const { isNil, isNaN, isObject, cloneDeep } = require("lodash");
const { ROLE } = require("miniplug");
const moment = require("moment");
require("moment-timer");

class Uno extends Command {
  constructor(client) {
    super(client, {
      name: "uno",
      description: "Start a Uno Game",
      usage: "['start', 'join', 'table', 'play <colour> <value>', 'pick', 'jumpin', 'hand', 'reset', 'exit']"
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    try {
      //message.delete();

      if (!args.length) { return; }

      const params = ["start", "join", "play", "pick", "hand", "table", "reset", "jumpin", "exit"];
      const param = `${args.shift()}`.toLowerCase();

      if (!params.includes(param)) {
        return message.reply(`Invalid Param: ${param}`);
      }

      const price = 2;

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

          if (await this.client.roulette.check() || await this.client.russianRoulette.check() || this.client.triviaUtil.check() || this.client.unoUtil.checkGame() || this.client.unoUtil.checkGame() || this.client.russianRouletteUtil.checkGame()) {
            return message.reply("There's a Game running already!");
          }

          const props = inst.get("props");

          if (props < price) {
            return message.reply("You don't have enough props.");
          }

          await inst.decrement("props", { by: price });
          await this.client.db.models.users.increment("props", { by: price, where: { id: "40333310" } });

          this.client.unoUtil.addPlayer(message.author);
          await this.client.guilds.cache.get("485173051432894489").members.cache.get(message.author.id).roles.add("512635547320188928").catch(console.error);

          let startMessage = `A new Uno Game has been created. Entry Fee: ${price} Prop. \n`;
          startMessage += "You will be warned 30 seconds before it starts. \n";
          startMessage += `A maximum of ${this.client.unoUtil.maxPlayers} players can play. \n`;
          startMessage += "The game will start in 5 minute. Join the game with `-uno join` \n";
          startMessage += "Good Luck! \n";
          startMessage += " \n";
          startMessage += "Commands: \n";
          startMessage += "-uno play <colour> <number> | Plays a card. Can be multiple if same number: -uno play <colour> <number> <colour> \n";
          startMessage += "-uno jumpin <colour> <number> | Jump-In if you have the same exact card that is in the table out of your turn. \n";
          startMessage += "-uno pick | Picks up a card. \n";
          startMessage += "-uno hand | DM your hand. \n";
          startMessage += "-uno table | Shows everyone at the table. \n";
          startMessage += "-uno exit | Quits the game.";

          message.channel.send(startMessage);

          message.reply("Joined Uno.");

          this.client.plug.chat("Discord Uno Game will start in 5 minute in channel #" + message.channel.name + "!");
          this.client.plug.chat("Join EDM Spot's Official Discord: https://discord.gg/QvvD8AC");

          this.client.unoUtil.running = true;

          new moment.duration(270000, "milliseconds").timer({ loop: false, start: true }, async () => {
            message.channel.send("<@&512635547320188928> 30 Seconds left until start!");
          });

          new moment.duration(5, "minutes").timer({ loop: false, start: true }, async () => {
            if (this.client.unoUtil.queue.length < this.client.unoUtil.minPlayers) {
              message.channel.send(`Not enough players (${this.client.unoUtil.minPlayers} required) to play this game.`);
              await this.client.unoUtil.end();
            } else {
              message.channel.send("<@&512635547320188928> Uno will now start!");

              if (this.client.unoUtil.queue.length < 4) {
                this.client.unoUtil.prizes = false;
                message.channel.send("Less than 4 players... Prizes disabled!");
              }

              await this.client.unoUtil.start();

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

          if (this.client.unoUtil.started) {
            return message.reply("Uno already started!");
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
            return message.reply(`It's not your turn yet! It's currently ${this.client.unoUtil.player.member.username}'s turn.`);
          }

          if (args.length < 2) {
            return message.reply('You have to specify a valid color! Colors are **red**, **yellow**, **green**, and **blue**.\n`uno play <color> <value>`');
          }

          let drawn = false;
          let argsCards = null;
          let passCheck = null;

          argsCards = await this.client.unoUtil.getCalledCards(args);

          if (argsCards !== null) {
            passCheck = await this.client.unoUtil.checkCalledCards(argsCards);

            if (argsCards.length >= 2) {
              if (!passCheck) { return message.reply("Sorry, you can't play that multiple setup!"); }
            }
          } else {
            return message.reply("It doesn't seem like you have one of that cards! Try again.");
          }

          if (argsCards.length >= 2) {
            if (passCheck === null) { return message.reply("Sorry, I need better code <:kappa:486185487208546326>!"); }
            if (!passCheck) { return message.reply("Sorry, I need better code <:kappa:486185487208546326>!"); }
          }

          this.client.unoUtil.timer.stop();

          let i = argsCards.length;
          for (const card of argsCards) {
            i--;

            if (!this.client.unoUtil.flipped.color || card.wild || card.id === this.client.unoUtil.flipped.id || card.color === this.client.unoUtil.flipped.color) {
              this.client.unoUtil.player.cardsPlayed++;

              this.client.unoUtil.discard.push(card);
              this.client.unoUtil.player.hand.splice(this.client.unoUtil.player.hand.indexOf(card), 1);
              this.client.unoUtil.player.cardsChanged();

              let pref = '';
              if (this.client.unoUtil.player.hand.length === 0) {
                this.client.unoUtil.finished.push(this.client.unoUtil.player);
                this.client.unoUtil.player.finished = true;

                pref = `${this.client.unoUtil.player.member.username} has no more cards! They finished in **Rank #${this.client.unoUtil.finished.length}**! :tada:\n\n`;
                if (2 === this.client.unoUtil.queue.length) {
                  this.client.unoUtil.finished.push(this.client.unoUtil.queue[1]);
                  pref = await this.client.unoUtil.scoreboard();
                  return message.channel.send(pref);
                }
              }

              if (this.client.unoUtil.player.hand.length === 1) {
                message.channel.send(`**UNO!!** ${this.client.unoUtil.player.member.username} only has one card left!`);
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

                    extra = `Sorry, ${this.client.unoUtil.player.member.username}! Skip a turn! `;
                    break;
                  }
                case 'SKIP':
                  let skipped = this.client.unoUtil.queue.shift();
                  this.client.unoUtil.queue.push(skipped);

                  extra = `Sorry, ${this.client.unoUtil.player.member.username}! Skip a turn! `;

                  break;
                case '+2':
                  let amount = 0;
                  if (i === 0) {
                    for (let i = this.client.unoUtil.discard.length - 1; i >= 0; i--) {
                      if (this.client.unoUtil.discard[i].id === '+2')
                        amount += 2;
                      else break;
                    }

                    this.client.unoUtil.deal(this.client.unoUtil.queue[1], amount);
                    extra = `${this.client.unoUtil.queue[1].member.username} picks up ${amount} cards! Tough break. `;

                    extra += ' Also, skip a turn!';
                    this.client.unoUtil.queue.push(this.client.unoUtil.queue.shift());
                  }

                  break;
                case 'WILD':
                  extra = `In case you missed it, the current color is now **${card.colorName}**! `;

                  break;
                case 'WILD+4': {
                  // let player = this.client.unoUtil.queue.shift();
                  await this.client.unoUtil.deal(this.client.unoUtil.queue[1], 4);

                  // this.client.unoUtil.queue.unshift(player);
                  extra = `${this.client.unoUtil.queue[1].member.username} picks up 4! The current color is now **${card.colorName}**! `;

                  extra += ' Also, skip a turn!';

                  let skipped = this.client.unoUtil.queue.shift();
                  this.client.unoUtil.queue.push(skipped);

                  break;
                }
              }

              if (i === 0) {
                await this.client.unoUtil.next();

                return message.channel.send(this.client.unoUtil.embed(`${pref}${drawn ? `${message.author.username} has drawn and auto-played a **${this.client.unoUtil.flipped}**.` : `A **${this.client.unoUtil.flipped}** has been played.`} ${extra}\n\nIt is now ${this.client.unoUtil.player.member.username}'s turn!`));
              }
            } else {
              return message.reply("Sorry, you can't play that card now!");
            }
          }

          return message.reply('You have to specify a valid card or its just bugged <:kappa:486185487208546326>!');
        }
        case "pick": {
          if (!this.client.unoUtil.started) {
            return message.reply("Uno is not running!");
          }

          if (this.client.unoUtil.player.id !== message.author.id) {
            return message.reply(`It's not your turn yet! It's currently ${this.client.unoUtil.player.member.username}'s turn.`);
          }

          this.client.unoUtil.timer.stop();

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

          return message.channel.send(this.client.unoUtil.embed(`${player.member.username} picked up a card.\n\nA **${this.client.unoUtil.flipped}** was played last. \n\nIt is now ${this.client.unoUtil.player.member.username}'s turn!`));
        }
        case "jumpin": {
          if (!this.client.unoUtil.started) {
            return message.reply("Uno is not running!");
          }

          if (this.client.unoUtil.player.id === message.author.id) {
            return message.reply(`It's your turn! You can't Jump-In.`);
          }

          if (args.length !== 2) {
            return message.reply('You have to specify a valid color! Colors are **red**, **yellow**, **green**, and **blue**.\n`uno play <color> <value>`');
          }

          let player = this.client.unoUtil.players[message.author.id];

          let card = await player.getCard(args.splice(0, 2));
          if (card === null) return null;
          if (!card) return message.reply("It doesn't seem like you have that card! Try again.");

          if (!card.wild && card.id === this.client.unoUtil.flipped.id && card.color === this.client.unoUtil.flipped.color && card.id !== "REVERSE" && card.id !== "SKIP" && card.id !== "+2" && card.id !== "WILD" && card.id !== "WILD+4") {
            this.client.unoUtil.timer.stop();

            player.cardsPlayed++;

            this.client.unoUtil.discard.push(card);
            player.hand.splice(player.hand.indexOf(card), 1);
            player.cardsChanged();

            let pref = '';
            if (player.hand.length === 0) {
              this.client.unoUtil.finished.push(player);
              player.finished = true;

              pref = `${player.member.username} has no more cards! They finished in **Rank #${this.client.unoUtil.finished.length}**! :tada:\n\n`;
              if (2 === this.client.unoUtil.queue.length) {
                this.client.unoUtil.finished.push(this.client.unoUtil.queue[1]);
                pref = await this.client.unoUtil.scoreboard();
                return message.channel.send(pref);
              }
            }

            if (player.hand.length === 1) {
              message.channel.send(`**UNO!!** ${player.member.username} only has one card left!`);
            }

            await this.client.unoUtil.jumpIn(player);

            console.log("command: " + player.id);

            await this.client.unoUtil.next();

            console.log("next: " + this.client.unoUtil.player.id);

            return message.channel.send(this.client.unoUtil.embed(`${pref}${drawn ? `${message.author.username} has drawn and auto-played a **${this.client.unoUtil.flipped}**.` : `${player.member.username} Jumped-In. A **${this.client.unoUtil.flipped}** has been played.`} ${extra}\n\nIt is now ${this.client.unoUtil.player.member.username}'s turn!`));
          }

          return message.channel.send("It doesn't seem like you can Jump-In with that card! Try again.");
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

          let out = this.client.unoUtil.embed(`A ** ${this.client.unoUtil.flipped}** has been played.\n\nIt is currently ${this.client.unoUtil.player.member.username} 's turn!`);

          out += `Here are the players in this game:\n${this.client.unoUtil.queue.map(p => `**${p.member.username}** | ${p.hand.length} card(s)`).join('\n')}`
            + `\n\nThis game has lasted **${d}**. **${this.client.unoUtil.drawn}** cards have been drawn!\n\n`;

          return message.channel.send(out);
        }
        case "exit": {
          if (!this.client.unoUtil.started) {
            return message.reply("Uno is not running!");
          }

          if (this.client.unoUtil.players.hasOwnProperty(message.author.id)) {
            this.client.unoUtil.timer.stop();

            let out = 'You are no longer participating in the game.\n\n';

            this.client.unoUtil.dropped.push(this.client.unoUtil.players[message.author.id]);

            if (this.client.unoUtil.started && this.client.unoUtil.queue.length <= 2) {
              this.client.unoUtil.queue = this.client.unoUtil.queue.filter(p => p.id !== message.author.id);
              this.client.unoUtil.finished.push(this.client.unoUtil.queue[0]);

              out += await this.client.unoUtil.scoreboard();

              return message.channel.send(out);
            }

            if (this.client.unoUtil.started && this.client.unoUtil.player.member.id === message.author.id) {
              this.client.unoUtil.next();

              out = this.client.unoUtil.embed(`${out}A **${this.client.unoUtil.flipped}** was played last. \n\nIt is now ${this.client.unoUtil.player.member.username}'s turn!`);
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

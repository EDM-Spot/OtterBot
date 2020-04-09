// Original Version https://github.com/Ratismal/UNO
const Player = require("./uno/player.js");
const Card = require("./uno/card.js");
const moment = require("moment");

module.exports = (client) => {
  class UnoUtil {
    constructor() {
      this.guild = client.guilds.cache.get("485173051432894489");
      this.channel = "485927387079639051";

      this.minPlayers = 2;
      this.maxPlayers = 8;

      this.running = false;

      this.players = {};
      this.queue = [];
      this.deck = [];
      this.discard = [];
      this.finished = [];
      this.dropped = [];
      this.started = false;
      this.confirm = false;
      this.lastChange = Date.now();
      this.drawn = 0;
      this.timeStarted = null;
      //this.rules = client.ruleset;
      this.transcript = [];
    }

    async start() {
      this.generateDeck();

      this.discard.push(this.deck.pop());

      await this.dealAll(7);

      this.started = true;
      this.timeStarted = Date.now();

      this.embed(`The game has begun with ${this.queue.length} players! The currently flipped card is: **${this.flipped}**. \n\nIt is now ${this.player.member.user.username}'s turn!`);
    }

    async end() {
      for (const id in this.players) {
        await this.guild.members.cache.get(id).roles.remove("512635547320188928").catch(console.warn);
      }

      this.running = false;

      this.players = {};
      this.queue = [];
      this.deck = [];
      this.discard = [];
      this.finished = [];
      this.dropped = [];
      this.started = false;
      this.confirm = false;
      this.lastChange = Date.now();
      this.drawn = 0;
      this.timeStarted = null;
      this.transcript = [];

      return true;
    }

    checkGame() {
      return this.running;
    }

    addPlayer(member) {
      this.lastChange = Date.now();

      if (!this.players[member.id]) {
        let player = this.players[member.id] = new Player(member, client);
        this.queue.push(player);
        return player;
      } else return null;
    }

    async notifyPlayer(player, cards = player.hand) {
      await player.send('You were dealt the following card(s):\n' + cards.map(c => `**${c}**`).join(' | '));
    }

    async next() {
      this.queue.push(this.queue.shift());
      this.queue = this.queue.filter(p => !p.finished);
      this.player.sendHand(true);
      this.lastChange = Date.now();
    }

    get player() {
      return this.queue[0];
    }

    get flipped() {
      return this.discard[this.discard.length - 1];
    }

    embed(desc) {
      return {
        embed: {
          description: desc,
          thumbnail: { url: this.flipped.URL },
          color: this.flipped.colorCode,
          footer: {
            text: `Decks: ${1} (${1 * 108} cards) | Remaining: ${this.deck.length} | Discarded: ${this.discard.length}`,
            icon_url: __dirname + '/resources/logo.png'
          },
          timestamp: moment(this.timeStarted),
        }
      }
    }

    scoreboard() {
      let out = 'The game is now over. Here is the scoreboard:\n';

      for (let i = 0; i < this.finished.length; i++) {
        let user = this.finished[i].member.user;
        out += `${i + 1}. **${user.username}#${user.discriminator}**\n`;
      }

      let diff = moment.duration(moment() - this.timeStarted);
      let d = [];

      if (diff.days() > 0) d.push(`${diff.days()} day${diff.days() === 1 ? '' : 's'}`);
      if (diff.hours() > 0) d.push(`${diff.hours()} hour${diff.hours() === 1 ? '' : 's'}`);

      d.push(`${diff.minutes()} minute${diff.minutes() === 1 ? '' : 's'}`);

      if (d.length > 1) {
        d[d.length - 1] = 'and ' + d[d.length - 1];
      }

      d = d.join(', ');

      out += `\nThis game lasted **${d}**, and **${this.drawn}** cards were drawn!`;

      return out;
    }

    async dealAll(number, players = this.queue) {
      let cards = {};

      for (let i = 0; i < number; i++) {
        let br = false;

        for (const player of players) {
          if (this.deck.length === 0) {
            if (this.discard.length <= 1) { br = true; break; }
            this.shuffleDeck();
          }

          let c = this.deck.pop();

          if (!c) { br = true; break; }
          if (!cards[player.id]) cards[player.id] = [];

          cards[player.id].push(c.toString());
          player.hand.push(c);

          this.drawn++;
        }

        if (br) break;
      }

      for (const player of players) {
        player.cardsChanged();
        player.called = false;

        if (cards[player.id].length > 0) {
          await this.notifyPlayer(player, cards[player.id]);
        }
      }
    }

    async deal(player, number) {
      let cards = [];

      for (let i = 0; i < number; i++) {
        if (this.deck.length === 0) {
          if (this.discard.length <= 1) break;
          this.shuffleDeck();
        }

        let c = this.deck.pop();

        cards.push(c);
        player.hand.push(c);

        this.drawn++;
      }

      player.cardsChanged();
      player.called = false;

      if (cards.length > 0) {
        await this.notifyPlayer(player, cards.map(c => c.toString()));
      }

      return cards;
    }

    generateDeck() {
      for (let d = 0; d < 1; d++) {
        for (const color of ['R', 'Y', 'G', 'B']) {
          this.deck.push(new Card('0', color));
          for (let i = 1; i < 10; i++)
            for (let ii = 0; ii < 2; ii++)
              this.deck.push(new Card(i.toString(), color));
          for (let i = 0; i < 2; i++)
            this.deck.push(new Card('SKIP', color));
          for (let i = 0; i < 2; i++)
            this.deck.push(new Card('REVERSE', color));
          for (let i = 0; i < 2; i++)
            this.deck.push(new Card('+2', color));
        }

        for (let i = 0; i < 4; i++) {
          this.deck.push(new Card('WILD'));
          this.deck.push(new Card('WILD+4'));
        }
      }

      this.shuffleDeck();
    }

    shuffleDeck() {
      let top = this.discard.pop();
      var j, x, i, a = [].concat(this.deck, this.discard);
      this.discard = [];

      if (a.length > 0)
        for (i = a.length - 1; i > 0; i--) {
          j = Math.floor(Math.random() * (i + 1));
          x = a[i];
          a[i] = a[j];
          a[j] = x;
        }

      this.deck = a;

      for (const card of this.deck.filter(c => c.wild))
        card.color = undefined;

      if (top)
        this.discard.push(top);

      client.channels.cache.get(this.channel).send('The deck has been shuffled.');
    }
  }

  client.unoUtil = new UnoUtil();
};
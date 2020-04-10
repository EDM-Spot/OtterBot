const { isNil, isObject, get, merge } = require("lodash");

module.exports = (client) => {
  class RussianRouletteUtil {
    constructor() {
      this.guild = client.guilds.cache.get("485173051432894489");
      this.channel = "485927387079639051";

      this.players = [];
      this.startingPlayers = [];
      this.running = false;
      this.started = false;

      this.bets = [];
    }

    async start() {
      this.started = true;

      await this.chooseVictim(this.players);
    }

    async end() {
      for (const playerID of this.startingPlayers) {
        await this.guild.members.cache.get(playerID).roles.remove("512635547320188928").catch(console.warn);
      }

      this.players = [];
      this.startingPlayers = [];
      this.running = false;
      this.started = false;
      this.bets = [];

      return true;
    }

    checkGame() {
      return this.running;
    }

    addPlayer(id, bet) {
      if (!this.players.includes(id)) {
        this.bets.push({ id: id, bet: bet });
        this.players.push(id);
        this.startingPlayers.push(id);
        return true;
      }

      return false;
    }

    async chooseVictim(players) {
      const victim = players[Math.floor(Math.random() * players.length)];
      const user = this.guild.member(victim);

      if (!players.length) {
        client.channels.cache.get(this.channel).send('The Russian Roulette Ended!');
        await this.end();
        return;
      }

      const userDB = await client.db.models.users.findOne({
        where: {
          discord: victim,
        },
      });

      await client.wait(3000);

      client.channels.cache.get(this.channel).send(`${user} pulled the trigger...`);

      await client.wait(5000);

      const randomBool = Math.random() >= 0.5;

      if (randomBool) {
        const playerBet = this.bets.find(element => element.id === victim);

        client.channels.cache.get(this.channel).send(`${user} survived! Won ${playerBet.bet * 2} Props. <:FeelsGoodMan:486184925859545088>`);

        await userDB.increment("props", { by: playerBet.bet * 2 });
      } else {
        client.channels.cache.get(this.channel).send(`<:otterrage:511579983668314122><:bulletgun:698190275503456278><:FeelsBadMan:486181331395411969><:quinsplat:698195042220769401> BANG! ${user}`);
      }

      this.chooseVictim(players.filter(player => player !== victim));
    }
  }

  client.russianRouletteUtil = new RussianRouletteUtil();
};
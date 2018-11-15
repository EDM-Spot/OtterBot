const Command = require("../base/Command.js");
const { isNil, forEach, reject, size } = require("lodash");
const Discord = require("discord.js");
const moment = require("moment");
require("moment-timer");

class Trivia extends Command {
  constructor(client) {
    super(client, {
      name: "trivia",
      description: "Play Trivia.",
      usage: "trivia",
      permLevel: "Bot Developer"
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    let startMessage = "Trivia will start in 5 Minute! Use `-join` to play. \n";
    startMessage += "You will be warned 30 seconds before it starts. \n";
    startMessage += "Press ✅ or ❌ to answer the question. The trivia will continue until only one stays. \n";
    startMessage += "You have 15 Seconds to answer when questions shows up. \n";
    startMessage += "The Winner will be moved to position 1 so don't forget to stay on plug. \n";
    startMessage += "Good Luck!";
    message.channel.send(startMessage);

    await this.client.plug.sendChat("@djs Discord Trivia is starting now! The winner gets moved to position 1! \n Join EDM Spot's Official Discord: https://discord.gg/GETaTWm");

    this.client.triviaUtil.start();

    new moment.duration(270000, "milliseconds").timer({loop: false, start: true}, async () => {
      message.channel.send("<@&512635547320188928> 30 Seconds left until start!");
    });

    this.timer = new moment.duration(5, "minutes").timer({loop: false, start: true}, async () => {
      this.client.triviaUtil.running = false;
      await this.trivia(message, this.client.triviaUtil.players);
    });
  }

  async trivia(message, players) {
    let currentPlayers = players;

    if (!currentPlayers.length) return message.channel.send("Too bad no one won the Trivia!");

    const question = await this.client.triviaUtil.getQuestion();

    const embed = new Discord.RichEmbed()
    //.setTitle("Title")
      .setAuthor(question.category, "http://www.iconsalot.com/asset/icons/freepik/customer-service-2/512/question-icon.png")
      .setColor(0x3AE200)
    //.setDescription("This is the main body of text, it can hold 2048 characters.")
      .setFooter("Difficulty: " + question.difficulty)
    //.setImage("http://i.imgur.com/yVpymuV.png")
    //.setThumbnail("http://i.imgur.com/p2qNFag.png")
      .setTimestamp()
    //.addField("This is a field title, it can hold 256 characters")
      .addField("Question", question.question, true)
      .addBlankField(true);

    const answerTrue = [];
    const answerFalse = [];

    message.channel.send({embed}).then(function(m) {
      m.react("✅");
      m.react("❌");

      return m;
    }).then((m)=>{
      const collector = m.createReactionCollector((reaction, user) =>
        user.id !== "486087139088400384" &&
        reaction.emoji.name === "✅" ||
        user.id !== "486087139088400384" &&
        reaction.emoji.name === "❌"
      ).on("collect", async reaction => {
        const user = reaction.users.last();
        const chosen = reaction.emoji.name;

        if (currentPlayers.includes(user.id)) {
          if (!answerTrue.includes(user.id) && !answerFalse.includes(user.id)) {
            if (chosen === "✅") {
              answerTrue.push(user.id);
            } else if (chosen === "❌") {
              answerFalse.push(user.id);
            }
          }
        }
      });

      new moment.duration(15, "seconds").timer({loop: false, start: true}, async () => {
        collector.stop();
        message.channel.send("The Answer is: " + question.correct_answer);

        //forEach(currentPlayers, async (timedOut) => {
        for (const timedOut of currentPlayers) {
          if (!answerTrue.includes(timedOut) && !answerFalse.includes(timedOut)) {
            currentPlayers = reject(currentPlayers, function(player) { return player === timedOut; });

            await this.client.guilds.get("485173051432894489").members.get(timedOut).removeRole("512635547320188928").catch(console.warn);

            const username = await this.client.triviaUtil.getUsername(timedOut);
            message.channel.send("No Answer in time! " + username + " is out of Trivia!");
          }
        });

        if (question.correct_answer) {
          //forEach(answerFalse, async (loser) => {
          for (const player of currentPlayers) {
            currentPlayers = reject(currentPlayers, function(player) { return player === loser; });

            await this.client.guilds.get("485173051432894489").members.get(loser).removeRole("512635547320188928").catch(console.warn);

            const username = await this.client.triviaUtil.getUsername(loser);
            message.channel.send("Wrong Answer! " + username + " is out of Trivia!");
          });
        } else {
          //forEach(answerTrue, async (loser) => {
          for (const player of currentPlayers) {
            currentPlayers = reject(currentPlayers, function(player) { return player === loser; });

            await this.client.guilds.get("485173051432894489").members.get(loser).removeRole("512635547320188928").catch(console.warn);

            const username = await this.client.triviaUtil.getUsername(loser);
            message.channel.send("Wrong Answer! " + username + " is out of Trivia!");
          });
        }

        if (!currentPlayers.length) return message.channel.send("Too bad no one won the Trivia!");
        if (size(currentPlayers) === 1) {
          const username = await this.client.triviaUtil.getUsername(currentPlayers[0]);

          this.client.triviaUtil.end();
          if (isNil(username)) return message.channel.send("Something is wrong! Ending Trivia.");

          await this.client.guilds.get("485173051432894489").members.get(currentPlayers[0]).removeRole("512635547320188928").catch(console.warn);
          await this.client.triviaUtil.moveWinner(currentPlayers[0]);

          return message.channel.send(username + " won the Trivia!");
        }

        message.channel.send("Next Question will start in 30 Seconds!");
        new moment.duration(30, "seconds").timer({loop: false, start: true}, async () => {
          await this.trivia(message, currentPlayers);
        });
      });
    }).catch(function() {
      console.warn();
    });
  }
}

module.exports = Trivia;

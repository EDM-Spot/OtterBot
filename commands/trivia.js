const Command = require("../base/Command.js");
const { each, isNil } = require("lodash");
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
    message.channel.send("(TEST) Trivia will start in 1 Minute! Use `-join` to play. (TEST)");

    this.client.triviaUtil.start();

    this.timer = new moment.duration(1, "minutes").timer({loop: false, start: true}, async () => {
      this.client.triviaUtil.running = false;
      await this.trivia(message, this.client.triviaUtil.players);
    });
  }

  async trivia(message, players) {
    const currentPlayers = players;

    console.log(currentPlayers.length);
    if (!currentPlayers.length) return message.channel.send("Too bad no one won the Trivia!");

    const question = await this.client.triviaUtil.getQuestion();
    console.log(question);

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
        // This should be checked on Join
        //const userDB = await this.client.db.models.users.findOne({
        //where: {
        //discord: message.author.id,
        //},
        //});
  
        //if (isNil(userDB)) {
        //reaction.remove(user);
        //return false;
        //}

        //if (!message.member.roles.find("name", "Admin")) {
        //reaction.remove(user);
        //}

        const user = reaction.users.last();
        const chosen = reaction.emoji.name;

        if (chosen === "✅") {
          answerTrue.push(user.id);
        } else if (chosen === "❌") {
          answerFalse.push(user.id);
        }
      });

      new moment.duration(10, "seconds").timer({loop: false, start: true}, async () => {
        collector.stop();
        message.channel.send("Answer: " + question.correct_answer);

        if (question.correct_answer) {
          each(answerFalse, (loser) => {
            currentPlayers.filter(player => player !== loser);
            message.channel.send(loser + " is out of Trivia!");
          });
        } else {
          each(answerTrue, (loser) => {
            currentPlayers.filter(player => player !== loser);
            message.channel.send(loser + " is out of Trivia!");
          });
        }

        each(currentPlayers, (timedOut) => {
          if (!answerTrue.includes(timedOut) && !answerFalse.includes(timedOut)) {
            currentPlayers.filter(player => player !== timedOut);
            message.channel.send(timedOut + " is out of Trivia!");
          }
        });

        console.log(currentPlayers);

        console.log("Finished!");

        if (!currentPlayers.length) return message.channel.send("Too bad no one won the Trivia!");
        if (currentPlayers.lenght === 1) return message.channel.send(currentPlayers[0] + " won the Trivia!");

        message.channel.send("Next Question will start in 15 Seconds!");
        new moment.duration(15, "seconds").timer({loop: false, start: true}, async () => {
          await this.trivia(message, currentPlayers);
        });
      });
    }).catch(function() {
      console.log();
    });
  }
}

module.exports = Trivia;

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
    message.channel.send("(TEST) Trivia will start in X Time (TEST)");

    this.timer = new moment.duration(1, "seconds").timer({loop: false, start: true}, async () => {
      await this.trivia(message, ["314234234", "9695759", "579898790", "476874884"]); //this.client.trivia.players;
    });
  }

  async trivia(message, players) {
    const currentPlayers = players;

    if (currentPlayers.lenght <= 0) return;

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
        user.id !== message.author.id && reaction.emoji.name === "✅" || reaction.emoji.name === "❌"
      ).once("collect", async (reaction, user) => {
        console.log("////////////////////////////////REACTION/////////////////////////////////");
        console.log(reaction);
        console.log("////////////////////////////////USER/////////////////////////////////");
        console.log(user);
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

        const chosen = reaction.emoji.name;

        if (chosen === "✅") {
          //answerTrue.push(user.id);
        } else if (chosen === "❌") {
          //answerFalse.push(user.id);
        }
      });

      new moment.duration(15, "seconds").timer({loop: false, start: true}, async () => {
        collector.stop();
        message.channel.send("Answer: " + question.correct_answer);

        if (question.correct_answer) {
          each(answerFalse, (byePlayer) => {
            currentPlayers.filter(player => player !== byePlayer);
            message.channel.send(byePlayer + " is out of Trivia!");
          });
        } else {
          each(answerTrue, (byePlayer) => {
            currentPlayers.filter(player => player !== byePlayer);
            message.channel.send(byePlayer + " is out of Trivia!");
          });
        }

        console.log("Finished!");
      });
    }).catch(function() {
      console.log();
    });
  }
}

module.exports = Trivia;

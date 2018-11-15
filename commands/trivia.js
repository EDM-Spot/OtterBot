const Command = require("../base/Command.js");
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
      await this.trivia(message);
    });
  }

  async trivia(message) {
    const players = ["314234234", "9695759", "579898790", "476874884"]; //this.client.trivia.players;

    //while (players.lenght) {
      const question = await this.client.triviaUtil.getQuestion();
      console.log(question);

      const embed = new Discord.RichEmbed()
        //.setTitle("Title")
        .setAuthor(question.category, "http://www.iconsalot.com/asset/icons/freepik/customer-service-2/512/question-icon.png")
        .setColor(0xFF00FF)
        //.setDescription("This is the main body of text, it can hold 2048 characters.")
        .setFooter("Difficulty: " + question.difficulty)
        //.setImage("http://i.imgur.com/yVpymuV.png")
        //.setThumbnail("http://i.imgur.com/p2qNFag.png")
        .setTimestamp()
        //.addField("This is a field title, it can hold 256 characters")
        .addField("Question", question.question, true);
      //.addBlankField(true);

      message.channel.send({embed});
    //}
  }
}

module.exports = Trivia;

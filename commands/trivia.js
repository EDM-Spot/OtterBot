const Command = require("../base/Command.js");
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
    //message.channel.send("(TEST) Trivia will start in X Time (TEST)");

    //this.timer = new moment.duration(5, "minutes").timer({loop: false, start: true}, async () => {
    //await this.trivia();
    //});

    const question = await this.client.trivia.getQuestion();

    console.log(question);
  }

  async trivia() {
    const question = await this.client.trivia.getQuestion();

    console.log(question);
  }
}

module.exports = Trivia;

// The EVAL command will execute **ANY** arbitrary javascript code given to it.
// THIS IS PERMISSION LEVEL 10 FOR A REASON! It's perm level 10 because eval
// can be used to do **anything** on your machine, from stealing information to
// purging the hard drive. DO NOT LET ANYONE ELSE USE THIS


// However it's, like, super ultra useful for troubleshooting and doing stuff
// you don't want to put in a command.
const Command = require("../base/Command.js");
const { isNil } = require("lodash");
const { inspect } = require("util");

class Eval extends Command {
  constructor(client) {
    super(client, {
      name: "eval",
      description: "Evaluates arbitrary Javascript.",
      category: "System",
      usage: "eval <expression>",
      aliases: ["ev"],
      permLevel: "Bot Developer"
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    const code = args.join(" ");
    try {
      let evaled = eval(code);

      if (typeof evaled !== "string") {
        evaled = inspect(evaled);
      }

      const clean = await this.client.clean(evaled);

      // sends evaled output as a file if it exceeds the maximum character limit
      // 6 graves, and 2 characters for "js"
      const MAX_CHARS = 3 + 2 + clean.length + 3;
      if (MAX_CHARS > 1900) {
        const { key } = await fetch("https://hasteb.in/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: Buffer.from(clean)
        }).then(res => res.json());
        return message.channel.send(`Output exceeded 2000 characters, uploading to text site, https://hasteb.in/raw/${key}`);
      }

      if (isNil(evaled)) {
        message.channel.send("```js\nCommand Executed!\n```");
      }
      else {
        message.channel.send(`\`\`\`js\n${clean}\n\`\`\``);
        message.channel.send(`\`\`\`js\n${evaled}\n\`\`\``);
      }
    } catch (err) {
      message.channel.send(`\`ERROR\` \`\`\`xl\n${await this.client.clean(this.client, err)}\n\`\`\``);
      message.channel.send(`\`\`\`js\n${err}\n\`\`\``);
    }

    message.delete();
  }
}

module.exports = Eval;

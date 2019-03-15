const Command = require("../base/Command.js");
const { inspect } = require("util");

class Eval extends Command {
  constructor(client) {
    super(client, {
      name: "eval2",
      description: "Evaluates arbitrary Javascript.",
      category:"System",
      usage: "eval2 <expression>",
      aliases: ["ev2"],
      permLevel: "Bot Developer"
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    if (!args) return message.send("No code provided!");

    message.delete();

    const evaled = {};
    const logs = [];

    const token = this.client.token.split("").join("[^]{0,2}");
    const rev = this.client.token.split("").reverse().join("[^]{0,2}");
    const tokenRegex = new RegExp(`${token}|${rev}`, "g");
    const cb = "```";

    const print = (...a) => {
      const cleaned = a.map(o => {
        if (typeof o !== "string") o = inspect(o, { depth: 1 });
        return o.replace(tokenRegex, "[TOKEN]");
      });

      if (!evaled.output) {
        logs.push(...cleaned);
        return;
      }

      evaled.output += evaled.output.endsWith("\n") ? cleaned.join(" ") : `\n${cleaned.join(" ")}`;
      const title = evaled.errored ? "☠\u2000**Error**" : "📤\u2000**Output**";

      if (evaled.output.length + args.length > 1900) evaled.output = "Output too long.";
      evaled.message.edit([
        `📥\u2000**Input**${cb}js`,
        args,
        cb,
        `${title}${cb}js`,
        evaled.output,
        cb
      ]);
    };

    try {
      let output = eval(args);
      if (output instanceof Promise) output = await output;

      if (typeof output !== "string") output = inspect(output, { depth: 0 });
      output = `${logs.join("\n")}\n${logs.length && output === "undefined" ? "" : output}`;
      output = output.replace(tokenRegex, "[TOKEN]");

      if (output.length + args.length > 1900) output = "Output too long.";

      const sent = await message.channel.send([
        `📥\u2000**Input**${cb}js`,
        args,
        cb,
        `📤\u2000**Output**${cb}js`,
        output,
        cb
      ]);

      evaled.message = sent;
      evaled.errored = false;
      evaled.output = output;

      return sent;
    } catch (err) {
      let error = err;

      error = error.toString();
      error = `${logs.join("\n")}\n${logs.length && error === "undefined" ? "" : error}`;
      error = error.replace(tokenRegex, "[TOKEN]");

      const sent = await message.channel.send([
        `📥\u2000**Input**${cb}js`,
        code,
        cb,
        `☠\u2000**Error**${cb}js`,
        error,
        cb
      ]);

      evaled.message = sent;
      evaled.errored = true;
      evaled.output = error;

      return sent;
    }
  }
}

module.exports = Eval;

const Command = require("../base/Command.js");

/*
  The HELP command is used to display every command's name and description
  to the user, so that he may see what commands are available. The help
  command is also filtered by level, so if a user does not have access to
  a command, it is not shown to them. If a command name is given with the
  help command, its extended help is shown.
*/
class PlugHelp extends Command {
  constructor(client) {
    super(client, {
      name: "plughelp",
      description: "Displays all the available Plug commands for you.",
      category: "System",
      usage: "plughelp [command]",
      aliases: ["ph", "phalp"]
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    const cmds = this.client.plugCommands.getLoaded();
    const commands = [];

    const roles = {
      5000: "Host",
      4000: "Co-Host",
      3000: "Manager",
      2000: "Bouncer",
      1000: "Resident DJ",
      0: "User",
    };

    const cooldownStrings = {
      perUser: "Per User",
      perUse: "Per Use",
      none: "None",
    };

    const filter = (i, command) => command.minimumPermission === i;
    const mapper = (registeredCommand) => {
      const command = {
        Names: registeredCommand.names.map(name => `!${name}`).join(", "),
        Parameters: registeredCommand.parameters,
        "Cooldown Type": cooldownStrings[registeredCommand.cooldownType],
        "Cooldown Duration": "",
        Description: registeredCommand.description,
      };

      if (registeredCommand.cooldownType !== "none") {
        if (Math.floor(registeredCommand.cooldownDuration / 60)) {
          command["Cooldown Duration"] += `${Math.floor(registeredCommand.cooldownDuration / 60)}m`;

          if (Math.floor(registeredCommand.cooldownDuration % 60)) {
            command["Cooldown Duration"] += `${Math.floor(registeredCommand.cooldownDuration % 60)}s`;
          }
        } else {
          command["Cooldown Duration"] += `${registeredCommand.cooldownDuration % 60}s`;
        }
      }

      return command;
    };

    for (let i = 0; i < 5; i++) {
      commands.push({
        role: i * 1000,
        roleName: roles[i * 1000],
        commands: cmds.filter(filter.bind(this, i * 1000)).map(mapper),
      });
    }


    //const commandNames = commands.command.keyArray();
    //const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0);
    let currentCategory = "";
    let output = "= Plug Room Command List =\n";
    commands.forEach( c => {
      const cat = c.roleName.toProperCase();
      if (currentCategory !== cat) {
        output += `\u200b\n== ${cat} ==\n`;
        currentCategory = cat;
      }
      c.commands.forEach( d => {
        output += `${d.Names}${" ".repeat(31 - d.Names.length)} :: ${d.Parameters} :: ${d.Description}\n`;
      });
    });

    message.channel.send(output, {code:"asciidoc", split: { char: "\u200b" }});
  }
}

module.exports = PlugHelp;

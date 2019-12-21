const { get, assign, isNil } = require("lodash");
const { ROLE } = require("miniplug");
const plugMessage = require("plug-message-split");

const NO_DELETION = ["props"];
const IMMEDIATE_DELETION = ["d", "join", "enter", "shush", "rules", "cmds", "plays", "meh"];
const CMD_BANNED = ["cookie", "myprops", "hello", "catfact", "catfacts", "urban", "eta", "sodas", "gif", "myrank"];

module.exports = class Command {
  constructor(bot, rawData, instance) {
    assign(this, bot);
    this.rawData = rawData;
    this.instance = instance;
    this.bot = bot;

    this.run();
  }
  async reply(string, variables = {}, ttl) {
    const lines = plugMessage.split(this.utils.replace(this.lang.commands.default, {
      command: this.instance.name,
      user: this.rawData.un,
      message: this.utils.replace(string, variables),
    }));

    if (lines.length > 1) {
      for (let i = 0; i < lines.length; i++) {
        const reply = this.bot.plug.chat(lines[i]);

        if (i + 1 >= 3) {
          break;
        }

        if (ttl) {
          return reply.delay(ttl).call("delete");
        }
      }
    } else {
      const reply = this.bot.plug.chat(this.utils.replace(this.lang.commands.default, {
        command: this.instance.name,
        user: this.rawData.un,
        message: this.utils.replace(string, variables),
      }));

      if (ttl) {
        return reply.delay(ttl).call("delete");
      }
    }

    // const reply = this.bot.plug.chat(this.utils.replace(this.lang.commands.default, {
    //   command: this.instance.name,
    //   user: this.rawData.un,
    //   message: this.utils.replace(string, variables),
    // }));

    // if (ttl) {
    //   return reply.delay(ttl).call("delete");
    // }

    return true;
  }
  async handleDeletion() {
    const { registeredCommand, name } = this.instance;

    if (get(this.rawData, "user.gRole", 0) >= ROLE.SITEMOD) return;
    if (NO_DELETION.includes(name)) return;

    if (IMMEDIATE_DELETION.includes(name) || registeredCommand.minimumPermission >= ROLE.DJ) {
      await this.rawData.delete();
    }

    this.deletionTimeout = setTimeout(async (rawData) => { // eslint-disable-line no-unused-vars
      await rawData.delete();
    }, 3e4, this.rawData);
  }
  async isBanned() {
    const { name } = this.instance;
    const { bot, rawData } = this;

    if (!CMD_BANNED.includes(name)) {
      return false;
    }

    const userCmdBanned = await bot.db.models.cmdbans.findOne({
      where: {
        id: rawData.uid,
      },
    });

    if (isNil(userCmdBanned)) return false;

    const timePassed = bot.moment().diff(bot.moment(userCmdBanned.time), "hours");

    switch (true) {
      case (userCmdBanned.duration === "h" && timePassed >= 1):
      case (userCmdBanned.duration === "d" && timePassed >= 24):
        await bot.db.models.cmdbans.destroy({ where: { id: userCmdBanned.id } });
        return false;
      default:
        break;
    }

    return true;
  }
  async isOnCooldown(registeredCommand) {
    const { id, cooldownType: cdType } = registeredCommand;

    if (cdType === "none") {
      return false;
    }

    const { rawData, instance: command, redis } = this;
    const { platform } = command;

    const currentCooldown = await redis.getCommandCooldown(platform, id, cdType, rawData.uid);

    if (isNil(currentCooldown)) return false;

    return true;
  }
  async placeOnCooldown(registeredCommand, success) {
    const { id, cooldownType: cdType, cooldownDuration: cdDur } = registeredCommand;
    const { rawData, instance: command, redis } = this;

    const successBool = await success;

    const duration = successBool ? cdDur : 1;

    if (!successBool) await rawData.delete();

    return redis.placeCommandOnCooldown(command.platform, id, cdType, rawData.uid, duration);
  }
  async run() {
    const { rawData, instance: command } = this;
    const { registeredCommand } = command;

    await this.handleDeletion();

    if (await this.utils.getRole(rawData.user) >= registeredCommand.minimumPermission) {
      const isBanned = await this.isBanned();
      const isOnCooldown = await this.isOnCooldown(registeredCommand);

      if (!isBanned) {
        if (!isOnCooldown) {
          const success = registeredCommand.execute.call(this, rawData, command, this.lang.commands);

          if (registeredCommand.cooldownType !== "none") {
            await this.placeOnCooldown(registeredCommand, success);
          }
        }
      }
    }
  }
};
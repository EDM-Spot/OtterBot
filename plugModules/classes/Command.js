const { get, assign, isNil } = require("lodash");
const { ROOM_ROLE, GLOBAL_ROLES } = require("plugapi");

const IMMEDIATE_DELETION = ["d", "join", "enter", "shush", "rules", "cmds", "plays"];
const CMD_BANNED = ["cookie", "myprops", "hello", "catfact", "urban", "eta", "sodas", "gif"];

module.exports = class Command {
  constructor(bot, rawData, instance) {
    assign(this, bot);
    this.rawData = rawData;
    this.instance = instance;
    this.bot = bot;

    this.run();
  }
  async reply(string, variables = {}, ttl) {
    this.bot.plug.sendChat(this.utils.replace(this.lang.commands.default, {
      command: this.instance.name,
      user: this.rawData.from.username,
      message: this.utils.replace(string, variables),
    }), ttl);

    return true;
  }
  async handleDeletion() {
    const { registeredCommand, name } = this.instance;

    if (get(this.rawData, "user.gRole", 0) >= GLOBAL_ROLES.MODERATOR) return;

    if (IMMEDIATE_DELETION.includes(name) || registeredCommand.minimumPermission >= ROOM_ROLE.RESIDENTDJ) {
      await this.bot.plug.moderateDeleteChat(this.rawData.id); //this.rawData.delete();
    }

    this.deletionTimeout = setTimeout(async (rawData) => { // eslint-disable-line no-unused-vars
      await this.bot.plug.moderateDeleteChat(this.rawData.id);
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
        id: rawData.from.id,
      },
    });

    if (isNil(userCmdBanned))	return false;

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

    const currentCooldown = await redis.getCommandCooldown(platform, id, cdType, rawData.from.id);

    if (isNil(currentCooldown))	return false;

    return true;
  }
  placeOnCooldown(registeredCommand, success) {
    const { id, cooldownType: cdType, cooldownDuration: cdDur } = registeredCommand;
    const { rawData, instance: command, redis } = this;

    const duration = success ? cdDur : Math.max(Math.floor(cdDur / 2), 1);

    return redis.placeCommandOnCooldown(command.platform, id, cdType, rawData.from.id, duration);
  }
  async run() {
    const { rawData, instance: command } = this;
    const { registeredCommand } = command;

    await this.handleDeletion();

    if (await this.utils.getRole(rawData.from) >= registeredCommand.minimumPermission) {
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
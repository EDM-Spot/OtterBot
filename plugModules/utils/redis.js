module.exports = function Util(bot) {
  class RedisUtil {
    constructor(Redis) {
      this.Redis = Redis;
    }
    static generateCommandCooldownKey(platform, commandName, cooldownType, userID) {
      // ex: command:cooldown:plug:ping:user:*

      const keyParts = [
        "command",
        "cooldown",
        platform,
        commandName,
        "user",
        cooldownType === "perUse" ? "*" : userID,
      ];

      return keyParts.join(":");
    }
    static generateDisconnectionKey(userID) {
      // ex: disconnection:3703511
      return `disconnection:${userID}`;
    }
    static generateGivePositionKey(userID) {
      // ex: givePosition:3703511
      return `givePosition:${userID}`;
    }
    getCommandCooldown(...args) {
      return this.Redis.get(this.constructor.generateCommandCooldownKey(...args));
    }
    getCommandOnCoolDown(...args) {
      return this.Redis.ttl(this.constructor.generateCommandCooldownKey(...args));
    }
    removeCommandFromCoolDown(...args) {
      return this.Redis.del(this.constructor.generateCommandCooldownKey(...args));
    }
    placeCommandOnCooldown(...args) {
      const expiry = args.pop();
      return this.Redis.set(this.constructor.generateCommandCooldownKey(...args), 1, "EX", expiry);
    }
    findDisconnection(userID) {
      return this.Redis.get(this.constructor.generateDisconnectionKey(userID));
    }
    async registerDisconnection(userID, position) {
      // 5400s = 90 minutes
      await this.Redis.hset("disconnection", userID, position);
      return this.Redis.set(this.constructor.generateDisconnectionKey(userID), position, "EX", 5400);
    }
    async removeDisconnection(userID) {
      await this.Redis.hdel("disconnection", userID);
      return this.Redis.del(this.constructor.generateDisconnectionKey(userID));
    }
    async removeAllDisconnections() {
      const keys = await this.Redis.hkeys("disconnection");

      return Promise.all(keys.map(key => this.removeDisconnection(key)));
    }
    findGivePosition(userID) {
      return this.Redis.get(this.constructor.generateGivePositionKey(userID));
    }
    findGivePositionTo(toUserID) {
      return this.Redis.get(toUserID);
    }
    async registerGivePosition(userID, toUserID, position) {
      // 120s = 2 minutes
      await this.Redis.hset("givePosition", userID, toUserID, position);
      return this.Redis.set(this.constructor.generateGivePositionKey(userID), toUserID, position, "EX", 120);
    }
    async removeGivePosition(userID) {
      await this.Redis.hdel("givePosition", userID);
      return this.Redis.del(this.constructor.generateGivePositionKey(userID));
    }
    async removeAllGivePosition() {
      const keys = await this.Redis.hkeys("givePosition");

      return Promise.all(keys.map(key => this.removeGivePosition(key)));
    }
  }

  bot.redis = new RedisUtil(bot.Redis);
};
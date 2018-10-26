const { each } = require("lodash");

module.exports = function Util(bot) {
  class RDJQueue {
    constructor() {
      this.users = [];

      bot.plug.on(bot.plug.events.ADVANCE, this.run);
    }
    add(user, role) {
      if (this.users.map(u => u.user.id).includes(user.id)) {
        return this.update(user, role);
      }
      
      this.users.push({ user, role });
      
      return this.run();
    }
    update(user, role) {
      each(this.users, (queueUser) => {
        if (queueUser.user.id === user.id) {
          queueUser.role = role;
        }
      });
      
      return this.run();
    }
    remove(user) {
      each(this.users, (queueUser, index) => {
        if (queueUser.user.id === user.id) {
          this.users.splice(index, 1);
        }
      });

      return this.run();
    }
    async run() {
      if (this.users === undefined) {
        return;
      }

      const next = this.users.shift();

      if (next === undefined) return;
      
      try {
        await bot.plug.moderateSetRole(next.id, next.role);
      } catch (err) {
        console.warn(err);
      }

      this.users.push(next);
      return;
    }
  }

  bot.rdjqueue = new RDJQueue();
};
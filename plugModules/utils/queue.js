const { each, isObject, get } = require("lodash");

module.exports = function Util(bot) {
  class Queue {
    constructor() {
      this.users = [];
      this.shouldUnlock = true;

      bot.plug.on('waitlistUpdate', this.run);
    }
    add(user, position) {
      if (this.users.map(u => u.user.id).includes(user.id)) {
        return this.update(user, position);
      }

      this.users.push({ user, position });

      return this.run();
    }
    update(user, position) {
      each(this.users, (queueUser) => {
        if (queueUser.user.id === user.id) {
          queueUser.position = position;
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
      const waitlist = bot.plug.waitlist();
      const dj = bot.plug.dj();

      if (!this.users.length) {
        if (this.shouldUnlock) {
          await bot.plug.setLock(false);
          this.shouldUnlock = false;
        }

        return;
      }

      const next = this.users.shift();

      if (waitlist.length === 50 && !waitlist.contains(next.user.id)) {
        if (!bot.plug.isLocked()) {
          try {
            await bot.plug.setLock(true);
            this.shouldUnlock = true;
          } catch (err) {
            console.error(err);
          }

          this.users.push(next);
          return;
        }
      }

      if (isObject(dj) && dj.id === next.user.id) {
        this.users.push(next);
        return;
      } else if (waitlist.positionOf(next.user.id) === -1) {
        try {
          await next.user.add();
        } catch (err) {
          if (get(err, 'response.body.status')) {
            switch (get(err, 'response.body.status')) {
              case 'noValidPlaylist':
                await bot.plug.chat(`@${next.user.username} ` + bot.lang.en.queue.noValidPlaylist, 6e4);
                return;
              case 'roomMismatch':
                await bot.plug.chat(bot.utils.replace(bot.lang.queue.roomMismatch, { user: next.user.id }), 6e4);
                return;
              // to-do: handle wait list banned users
              default:
                console.error(err);
                return;
            }
          }
        }

        if (next.position < waitlist.length) {
          try {
            await next.user.move(next.position);
          } catch (err) {
            console.error(err);
            this.users.push(next);
            return;
          }
        }
      } else {
        console.log('isinlist');
        try {
          await next.user.move(next.position);
        } catch (err) {
          this.users.push(next);
          return;
        }

        if (this.shouldUnlock) {
          await bot.plug.setLock(false);
          this.shouldUnlock = false;
        }
      }

      if (this.shouldUnlock) {
        await bot.plug.setLock(false);
        this.shouldUnlock = false;
      }
    }
  }

  bot.queue = new Queue();
};
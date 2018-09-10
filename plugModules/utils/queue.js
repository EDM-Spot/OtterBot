const { each, isObject, get } = require("lodash");

module.exports = function Util(bot) {
  class Queue {
    constructor() {
      this.users = [];
      this.shouldUnlock = true;

      bot.plug.on(bot.plug.events.DJ_LIST_UPDATE, this.run);
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
      const waitlist = bot.plug.getWaitList();
      const dj = bot.plug.getDJ();
      
      if (this.users === undefined) {
        if (this.shouldUnlock) {
          await bot.plug.moderateLockBooth(false, false);
          this.shouldUnlock = false;
        }

        return;
      }

      const next = this.users.shift();

      if (next === undefined) return;
      
      if (waitlist.length === 50 && bot.plug.getWaitListPosition(next.user.id) === -1) {
        if (!bot.plug.isLocked()) {
          try {
            await bot.plug.moderateLockBooth(true, false);
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
      } else if (bot.plug.getWaitListPosition(next.user.id) === -1) {
        try {
          if (next.user.id !== bot.plug.getSelf().id) {
            //await next.user.addToWaitList();
            await bot.plug.moderateAddDJ(next.user.id, function() {
              if (next.position < waitlist.length && next.position !== bot.plug.getWaitListPosition(next.user.id)) {
                bot.plug.moderateMoveDJ(next.user.id, next.position);
              }
            });
          }
        } catch (err) {
          if (get(err, "response.body.status")) {
            switch (get(err, "response.body.status")) {
              case "noValidPlaylist":
                await bot.plug.sendChat(`@${next.user.username} ` + bot.lang.en.queue.noValidPlaylist, 6e4);
                return;
              case "roomMismatch":
                await bot.plug.sendChat(bot.utils.replace(bot.lang.queue.roomMismatch, { user: next.user.id }), 6e4);
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
            //await next.user.moveInWaitList(next.position);
            await bot.plug.moderateMoveDJ(next.user.id, next.position);
          } catch (err) {
            console.error(err);
            console.log(next);
            this.users.push(next);
            return;
          }
        }
      } else {
        console.log("isinlist");
        try {
          //await next.user.moveInWaitList(next.position);
          //await next.user.moveInWaitList(next.position);
          await bot.plug.moderateMoveDJ(next.user.id, next.position);
        } catch (err) {
          console.error(err);
          console.log(next);
          this.users.push(next);
          return;
        }

        if (this.shouldUnlock) {
          await bot.plug.moderateLockBooth(false, false);
          this.shouldUnlock = false;
        }
      }

      if (this.shouldUnlock) {
        await bot.plug.moderateLockBooth(false, false);
        this.shouldUnlock = false;
      }
    }
  }

  bot.queue = new Queue();
};
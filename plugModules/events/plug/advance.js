const moment = require("moment");
const { isObject, isNil, get, map } = require("lodash");
const { BAN_DURATION, BAN_REASON } = require("miniplug");
const Discord = require("discord.js");

var savedMessageID;
var savedMessage;

let skipped = false;

module.exports = function Event(bot, filename, platform) {
  const event = {
    name: "advance",
    platform,
    _filename: filename,
    run: async (next) => {
      if (!isObject(next) || !isObject(next.media) || !isObject(next.user)) return;

      var currentPlay = next.media;
      var currentDJ = next.user;

      if (isNil(currentDJ.id) || isNil(currentDJ.username)) {
        currentDJ = await next.getUser();
      }

      bot.plug.woot();
      await bot.autoplay.joinWaitlist();

      let songAuthor = null;
      let songTitle = null;

      skipped = false;

      try {
        if (get(currentPlay, "format", 2) === 1) {
          const YouTubeMediaData = await bot.youtube.getMedia(currentPlay.cid);

          const fullTitle = get(YouTubeMediaData, "snippet.title");

          const { contentDetails, status } = YouTubeMediaData;
          const uploadStatus = get(YouTubeMediaData, "status.uploadStatus");
          const privacyStatus = get(YouTubeMediaData, "status.privacyStatus");
          const embeddable = get(YouTubeMediaData, "status.embeddable");

          if (!isObject(contentDetails) || !isObject(status) || uploadStatus !== "processed" || privacyStatus === "private" || !embeddable) {
            bot.plug.chat(bot.utils.replace(bot.check.mediaUnavailable, { which: "current" }));

            bot.channels.cache.get("695987344280649839").send(bot.utils.replace(bot.check.mediaUnavailable, { which: "current" }));
          }

          if ((fullTitle.match(/-/g) || []).length === 1) {
            songAuthor = fullTitle.split(" - ")[0].trim();
            songTitle = fullTitle.split(" - ")[1].trim();
          }
        } else {
          const SoundCloudMediaData = await bot.soundcloud.getTrack(currentPlay.cid);

          if (!isNil(SoundCloudMediaData)) {
            const fullTitle = SoundCloudMediaData.title;

            if ((fullTitle.match(/-/g) || []).length === 1) {
              songAuthor = fullTitle.split(" - ")[0].trim();
              songTitle = fullTitle.split(" - ")[1].trim();
            }
          }
        }
      } catch (err) {
        songAuthor = currentPlay.author;
        songTitle = currentPlay.title;
      }

      if (isNil(songAuthor) || isNil(songTitle)) {
        songAuthor = currentPlay.author;
        songTitle = currentPlay.title;
      }

      try {
        if (!isNil(bot.user)) {
          bot.user.setActivity(`${songAuthor} - ${songTitle}`, {
            type: "LISTENING"
          }).catch(function (error) {
            console.warn("setActivity Error!");
            console.log(error);
          });
        }
      } catch (err) {
        console.warn("setActivity Error!");
        console.log(err);
      }

      try {
        if (!isNil(bot.user)) {
          await bot.voiceUtil.play();
        }
      } catch (err) {
        console.warn("play Error!");
        console.log(err);
      }

      const blackword = ["nightcore", "nightstep", "bass boosted", "whatsapp", "gemido", "gemidão", "rape"];

      for (let i = 0; i < blackword.length; i++) {
        var pattern = new RegExp("\\b" + blackword[i] + "\\b");

        if (pattern.test(songAuthor.toLowerCase()) || pattern.test(songTitle.toLowerCase())) {
          //bot.plug.chat(`@${currentDJ.username} ` + bot.lang.blacklisted);

          if (!skipped) {
            await bot.db.models.blacklist.findOrCreate({
              where: { cid: currentPlay.cid },
              defaults: {
                cid: currentPlay.cid,
                moderator: bot.plug.me().id,
              },
            });

            const embed = new Discord.MessageEmbed()
              //.setTitle("Title")
              .setAuthor(currentPlay.author + " - " + currentPlay.title, "http://icons.iconarchive.com/icons/custom-icon-design/pretty-office-8/64/Skip-forward-icon.png")
              .setColor(0xFF00FF)
              //.setDescription("This is the main body of text, it can hold 2048 characters.")
              .setFooter("By " + bot.plug.me().username)
              //.setImage("http://i.imgur.com/yVpymuV.png")
              //.setThumbnail("http://i.imgur.com/p2qNFag.png")
              .setTimestamp()
              //.addField("This is a field title, it can hold 256 characters")
              .addField("ID", currentDJ.id, true)
              .addField("User ", currentDJ.username, true)
              .addField("Blacklisted", " (youtube.com/watch?v=" + currentPlay.cid + ")", false);
            //.addBlankField(true);

            bot.channels.cache.get("486637288923725824").send({ embed });

            bot.plug.chat(bot.lang.commands.blacklist.currentAdded);

            bot.channels.cache.get("695987344280649839").send(bot.lang.commands.blacklist.currentAdded);

            await next.skip();

            if (blackword[i] == "gemido" || blackword[i] == "gemidão" || blackword[i] == "rape") {
              await currentDJ.ban(BAN_DURATION.PERMA, BAN_REASON.SPAMMING);
            }

            skipped = true;
          }
        }
      }

      const blacklisted = await bot.db.models.blacklist.findOne({ where: { cid: currentPlay.cid } });

      if (isObject(blacklisted)) {
        if (!skipped) {
          bot.plug.chat(`@${currentDJ.username} ` + bot.lang.blacklisted);

          bot.channels.cache.get("695987344280649839").send(`@${currentDJ.username} ` + bot.lang.blacklisted);

          await next.skip();
          skipped = true;
        }
      }

      const isOverplayed = await bot.utils.isSongOverPlayed(songAuthor, songTitle, currentPlay.cid);

      if (isOverplayed) {
        if (!skipped) {
          bot.plug.chat(`@${currentDJ.username} ` + bot.lang.overplayed);

          bot.channels.cache.get("695987344280649839").send(`@${currentDJ.username} ` + bot.lang.overplayed);

          await next.skip();
          skipped = true;
        }
      }

      if (isObject(currentDJ) && currentPlay.duration >= 390) {
        const [user] = await bot.db.models.users.findOrCreate({ where: { id: currentDJ.id }, defaults: { id: currentDJ.id } });
        const seconds = currentPlay.duration - 390;
        const props = user.get("props");

        const propsToPay = Math.ceil(seconds / 3);

        if (currentPlay.duration <= 600 && props >= propsToPay) {
          await user.decrement("props", { by: propsToPay });
          bot.plug.chat(`${currentDJ.username} paid ${propsToPay} Props to play this song!`);

          bot.channels.cache.get("695987344280649839").send(`${currentDJ.username} paid ${propsToPay} Props to play this song!`);
        } else {
          if (!skipped) {
            bot.plug.chat(`@${currentDJ.username} ` + bot.lang.exceedstimeguard);

            bot.channels.cache.get("695987344280649839").send(`@${currentDJ.username} ` + bot.lang.exceedstimeguard);

            await bot.utils.lockskip(currentDJ);
            skipped = true;
          }
        }
      }

      const songHistory = await bot.utils.getSongHistory(songAuthor, songTitle, currentPlay.cid);

      if (!bot.global.ignoreHistoryNext) {
        if (!isNil(songHistory)) {
          if (songHistory.skip) {
            if (!songHistory.maybe) {
              if (!skipped) {
                bot.plug.chat(bot.utils.replace(bot.lang.historySkip, {
                  time: bot.moment(map(songHistory, "createdAt")[0]).fromNow(),
                }));

                bot.channels.cache.get("695987344280649839").send(bot.utils.replace(bot.lang.historySkip, {
                  time: bot.moment(map(songHistory, "createdAt")[0]).fromNow(),
                }));

                await next.skip();
                skipped = true;
              }
            } else {
              bot.plug.chat(bot.utils.replace(bot.lang.maybeHistorySkip, {
                cid: map(songHistory, "cid")[0],
                time: bot.moment(map(songHistory, "createdAt")[0]).fromNow(),
              }));

              bot.channels.cache.get("695987344280649839").send(bot.utils.replace(bot.lang.maybeHistorySkip, {
                cid: map(songHistory, "cid")[0],
                time: bot.moment(map(songHistory, "createdAt")[0]).fromNow(),
              }));
            }
          }
        }
      }

      const savedID = currentPlay.id;

      setTimeout(async () => {
        const timeoutMedia = bot.plug.historyEntry();

        if (savedID === get(timeoutMedia.media, "id")) {
          if (!skipped) {
            bot.plug.chat(bot.lang.stuckSkip);

            bot.channels.cache.get("695987344280649839").send(bot.lang.stuckSkip);

            bot.global.isSkippedByTimeGuard = true;

            await timeoutMedia.skip();
            skipped = true;
          }
        }
      }, (currentPlay.duration + 10) * 1e3);

      try {
        // get history for the latest play
        const previous = await bot.plug.getRoomHistory();

        // if plug reset the history or its a brand new room it won't have history
        if (!previous.length) return;

        const [history] = previous;

        const lastPlay = history.media;
        const lastDJ = history.user;

        // if plug reset the history or its a brand new room it won't have history
        if (!isObject(lastPlay)) return;

        const lastSaved = await bot.db.models.plays.findAll({
          order: [["id", "DESC"]],
          limit: 1,
        });

        if (!isNil(lastSaved)) {
          if (lastSaved[0].cid === lastPlay.cid) return;
        }

        //const [lastPlay] = history;

        // reset any DC spots when they start DJing
        await bot.redis.removeDisconnection(lastDJ.id);
        await bot.redis.removeGivePosition(lastDJ.id);

        let lastSongAuthor = null;
        let lastSongTitle = null;

        try {
          if (get(lastPlay, "format", 2) === 1) {
            const lastYouTubeMediaData = await bot.youtube.getMedia(lastPlay.cid);

            const { snippet } = lastYouTubeMediaData; // eslint-disable-line no-unused-vars
            const lastFullTitle = get(lastYouTubeMediaData, "snippet.title");

            if ((lastFullTitle.match(/-/g) || []).length === 1) {
              lastSongAuthor = lastFullTitle.split(" - ")[0].trim();
              lastSongTitle = lastFullTitle.split(" - ")[1].trim();
            }
          } else {
            const lastSoundCloudMediaData = await bot.soundcloud.getTrack(lastPlay.cid);

            if (!isNil(lastSoundCloudMediaData)) {
              const lastFullTitle = lastSoundCloudMediaData.title;

              if ((lastFullTitle.match(/-/g) || []).length === 1) {
                lastSongAuthor = lastFullTitle.split(" - ")[0].trim();
                lastSongTitle = lastFullTitle.split(" - ")[1].trim();
              }
            }
          }
        } catch (err) {
          lastSongAuthor = lastPlay.author;
          lastSongTitle = lastPlay.title;
        }

        if (isNil(lastSongAuthor) || isNil(lastSongTitle)) {
          lastSongAuthor = lastPlay.author;
          lastSongTitle = lastPlay.title;
        }

        let lastPlaySkipped = history.score.skipped;

        if (bot.global.isSkippedByTimeGuard) {
          lastPlaySkipped = false;
          bot.global.isSkippedByTimeGuard = false;
        }

        if (bot.global.isSkippedByMehGuard) {
          lastPlaySkipped = false;
        }

        // keep track of played media in the room
        await bot.db.models.plays.create({
          cid: lastPlay.cid,
          format: lastPlay.format,
          woots: history.score.positive,
          grabs: history.score.grabs,
          mehs: history.score.negative,
          dj: lastDJ.id,
          skipped: lastPlaySkipped > 0,
          author: `${lastSongAuthor}`,
          title: `${lastSongTitle}`,
        });

        // count how many props were given while that media played
        const props = await bot.db.models.props.count({
          where: { historyID: `${history.id}`, dj: lastDJ.id },
        });

        // get an user object for the last DJ
        const [instance] = await bot.db.models.users.findOrCreate({
          where: { id: lastDJ.id }, defaults: { id: lastDJ.id, username: lastDJ.username },
        });

        const woots = history.score.positive;
        const grabs = history.score.grabs;
        const mehs = history.score.negative;

        try {
          if (!isNil(savedMessageID)) {
            if (lastPlaySkipped === 1) {
              bot.channels.cache.get("486125808553820160").messages.fetch(savedMessageID)
                .then(message => message.edit(savedMessage.replace("is now Playing", "Played") + " Skipped!"));
            } else {
              bot.channels.cache.get("486125808553820160").messages.fetch(savedMessageID)
                .then(message => message.edit(savedMessage.replace("is now Playing", "Played") + " <:plugWoot:486538570715103252> " + woots + " " + "<:plugMeh:486538601044115478> " + mehs + " " + "<:plugGrab:486538625270677505> " + grabs + "\n"));
            }
          }

          bot.channels.cache.get("486125808553820160").send(moment().format("LT") + " - **" + currentDJ.username + " (" + currentDJ.id + ")** is now Playing: " + `${songAuthor} - ${songTitle}`).then(m => {
            savedMessageID = m.id;
            savedMessage = m.content;
          });

          bot.channels.cache.get("695987344280649839").send("**" + currentDJ.username + "** is now Playing: " + `${songAuthor} - ${songTitle}`);
        } catch (err) {
          console.warn("message.edit Error!");
          console.log(err);
        }

        // if they weren't skipped they deserve XP equivalent to the votes
        if (!lastPlaySkipped) {
          /*if (bot.global.isHolidaySong) {
              const day = moment().isoWeekday();
              const isWeekend = (day === 5) || (day === 6) || (day === 7);
  
              let random = Math.floor(Math.random() * (30 - 10 + 1)) + 10;
  
              if (!props) {
                // No Props
              } else if (props >= 3) {
                random = Math.floor(Math.random() * (60 - 20 + 1)) + 20;
              }
  
              if (isWeekend) {
                random = random * 2;
              }
    
              const [holidayUser] = await bot.db.models.holiday.findOrCreate({
                where: { id: lastPlay.user.id }, defaults: { id: lastPlay.user.id },
              });
    
              await holidayUser.increment("played", { by: 1 });
              await holidayUser.increment("currency", { by: random });
  
              //const user = bot.plug.getUser(lastPlay.user.id);
    
              //console.log(lastPlay.user);
              //console.log(ROOM_ROLE.RESIDENTDJ);
              
              //if (user.role <= ROOM_ROLE.RESIDENTDJ) {
              //  await bot.db.models.holiday.update(
              //    { ticket: true },
              //    { where: { id: lastPlay.user.id }}
              //  );
              //}
  
              await bot.plug.sendChat(bot.utils.replace(bot.lang.advanceholiday, {
                random,
                user: lastPlay.user.username
              }), data.media.duration * 1e3);
    
              bot.global.isHolidaySong = false;
            }*/

          // if no props were given, we done here
          if (!props || bot.global.isSkippedByMehGuard) {
            bot.global.isSkippedByMehGuard = false;
          } else {
            // otherwise, give them the props
            await instance.increment("props", { by: props });

            bot.plug.chat(bot.utils.replace(bot.lang.advanceprops, {
              props,
              user: lastDJ.username,
              plural: props > 1 ? "s" : "",
            }));

            bot.channels.cache.get("695987344280649839").send(bot.utils.replace(bot.lang.advanceprops, {
              props,
              user: lastDJ.username,
              plural: props > 1 ? "s" : "",
            }));
          }
        }

        skipped = false;
        bot.global.ignoreHistoryNext = false;
        //await bot.utils.updateRDJ(lastPlay.user.id);
      } catch (err) {
        console.warn("advance Error!");
        console.warn(err);
      }
    },
    init() {
      bot.plug.on(this.name, this.run);
    },
    kill() {
      bot.plug.removeListener(this.name, this.run);
    },
  };

  bot.events.register(event);
};
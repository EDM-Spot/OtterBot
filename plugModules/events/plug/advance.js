const moment = require("moment");
const { isObject, isNil, get, map, sortBy } = require("lodash");
//const ytdl = require("ytdl-core-discord");
//const { ROOM_ROLE, GLOBAL_ROLES } = require("plugapi");

var savedMessageID;
var savedMessage;

module.exports = function Event(bot, filename, platform) {
  const event = {
    name: 'advance',
    platform,
    _filename: filename,
    run: async (data) => {
      if (!isObject(data) || !isObject(data.media) || !isObject(data.getUser())) return;

      const currentMedia = bot.plug.historyEntry();
      var currentDJ = data.getUser();

      bot.plug.woot();

      let songAuthor = null;
      let songTitle = null;

      let skipped = false;

      try {
        if (get(data, "media.format", 2) === 1) {
          const YouTubeMediaData = await bot.youtube.getMedia(data.media.cid);

          const fullTitle = get(YouTubeMediaData, "snippet.title");

          const { contentDetails, status } = YouTubeMediaData;
          const uploadStatus = get(YouTubeMediaData, "status.uploadStatus");
          const privacyStatus = get(YouTubeMediaData, "status.privacyStatus");
          const embeddable = get(YouTubeMediaData, "status.embeddable");
    
          if (!isObject(contentDetails) || !isObject(status) || uploadStatus !== "processed" || privacyStatus === "private" || !embeddable) {
            await bot.plug.chat(bot.utils.replace(bot.check.mediaUnavailable, { which: "current" }));
          }

          if ((fullTitle.match(/-/g) || []).length === 1) {
            songAuthor = fullTitle.split(" - ")[0].trim();
            songTitle = fullTitle.split(" - ")[1].trim();
          }
        } else {
          const SoundCloudMediaData = await bot.soundcloud.getTrack(data.media.cid);

          if (!isNil(SoundCloudMediaData)) {
            const fullTitle = SoundCloudMediaData.title;

            if ((fullTitle.match(/-/g) || []).length === 1) {
              songAuthor = fullTitle.split(" - ")[0].trim();
              songTitle = fullTitle.split(" - ")[1].trim();
            }
          }
        }
      } catch (err) {
        songAuthor = data.media.author;
        songTitle = data.media.title;
      }

      if (isNil(songAuthor) || isNil(songTitle)) {
        songAuthor = data.media.author;
        songTitle = data.media.title;
      }

      try {
        if (!isNil(bot.user)) {
          bot.user.setActivity(`${songAuthor} - ${songTitle}`, {
            type: "LISTENING"
          }).catch(function(error) {
            console.log(error);
          });
        }
      } catch (err) {
        console.log(err);
      }

      const blackword = ["nightcore", "nightstep", "bass boosted", "whatsapp", "gemido", "gemidão", "rape"];

      for (let i = 0; i < blackword.length; i++) {
        var pattern = new RegExp("\\b" + blackword[i] + "\\b");

        if (pattern.test(songAuthor.toLowerCase()) || pattern.test(songTitle.toLowerCase())) {
          //await bot.plug.chat(`@${currentDJ.username} ` + bot.lang.blacklisted);

          if (!skipped) {
            await bot.plug.chat("!bl");

            if (blackword[i] == "gemido" || blackword[i] == "gemidão" || blackword[i] == "rape") {
              await bot.plug.chat(`!ban @${currentDJ.username} p Playing Ear Rape`);
            }

            skipped = true;
          }
        }
      }

      const blacklisted = await bot.db.models.blacklist.findOne({ where: { cid: data.media.cid } });

      if (isObject(blacklisted)) {
        if (!skipped) {
          await bot.plug.chat(`@${currentDJ.username} ` + bot.lang.blacklisted);

          await currentMedia.skip();
          skipped = true;
        }
      }

      const isOverplayed = await bot.utils.isSongOverPlayed(songAuthor, songTitle, data.media.cid);

      if (isOverplayed) {
        if (!skipped) {
          await bot.plug.chat(`@${data.currentDJ.username} ` + bot.lang.overplayed);

          await currentMedia.skip();
          skipped = true;
        }
      }

      if (isObject(currentDJ) && data.media.duration >= 390) {
        const [user] = await bot.db.models.users.findOrCreate({ where: { id: currentDJ.id }, defaults: { id: currentDJ.id } });
        const seconds = data.media.duration - 390;
        const props = user.get("props");

        const propsToPay = Math.ceil(seconds / 3);

        if (data.media.duration <= 600 && props >= propsToPay) {
          await user.decrement("props", { by: propsToPay });
          await bot.plug.chat(`${currentDJ.username} paid ${propsToPay} Props to play this song!`);
        } else {
          if (!skipped) {
            await bot.plug.chat(`@${currentDJ.username} ` + bot.lang.exceedstimeguard);
            
            await bot.utils.lockskip(currentDJ);
            skipped = true;
          }
        }
      }

      const songHistory = await bot.utils.getSongHistory(songAuthor, songTitle, data.media.cid);

      if (!bot.global.ignoreHistoryNext) {
        if (!isNil(songHistory)) {
          if (songHistory.skip) {
            if (!songHistory.maybe) {
              if (!skipped) {
                await bot.plug.chat(bot.utils.replace(bot.lang.historySkip, {
                  time: bot.moment(map(songHistory, "createdAt")[0]).fromNow(),
                }));
                
                await currentMedia.skip();
                skipped = true;
              }
            } else {
              await bot.plug.chat(bot.utils.replace(bot.lang.maybeHistorySkip, {
                cid: map(songHistory, "cid")[0],
                time: bot.moment(map(songHistory, "createdAt")[0]).fromNow(),
              }));
            }
          }
        }
      }

      //let stream;
      //if (data.media.format === 1) {
      //stream = await ytdl(`https://www.youtube.com/watch?v=${data.media.cid}`, { filter: "audioonly", quality: "lowest" });

      //bot.channels.get("485173051432894493").join()
      //  .then(connection => {
      //    connection.playOpusStream(stream, { volume: 1 })
      //      .on("error", error => console.warn(error));
      //  })
      //  .catch(console.warn);
      //} else {
      //stream = `https://w.soundcloud.com/player/?url=https://api.soundcloud.com/tracks/${data.media.cid}`; //Not Supported Yet
      //}

      //bot.channels.get("485173051432894493").join()
      //  .then(async connection => {
      //    connection.playOpusStream(await ytdl(dataUrl), streamOptions);
      //  })
      //  .catch(console.error);

      const savedID = data.media.id;

      setTimeout(async () => {
        const timeoutMedia = bot.plug.historyEntry();

        if (savedID === get(timeoutMedia, "id")) {
          if (!skipped) {
            await bot.plug.chat(bot.lang.stuckSkip);

            bot.global.isSkippedByTimeGuard = true;
            
            await timeoutMedia.skip();
            skipped = true;
          }
        }
      }, (data.media.duration + 10) * 1e3);

      try {
        // get history for the latest play

        bot.plug.getRoomHistory().then(async(history) => {
          const [lastPlay] = history;

          // if plug reset the history or its a brand new room it won't have history
          if (isNil(lastPlay.media)) return;

          const lastSaved = await bot.db.models.plays.findAll({
            order: [["id", "DESC"]],
            limit: 1,
          });

          if (!isNil(lastSaved)) {
            if (lastSaved[0].cid === lastPlay.media.cid) return;
          }

          //const [lastPlay] = history;

          // reset any DC spots when they start DJing
          await bot.redis.removeDisconnection(lastPlay.user.id);
          await bot.redis.removeGivePosition(lastPlay.user.id);

          let lastSongAuthor = null;
          let lastSongTitle = null;

          try {
            if (get(lastPlay, "media.format", 2) === 1) {
              const lastYouTubeMediaData = await bot.youtube.getMedia(lastPlay.media.cid);

              const { snippet } = lastYouTubeMediaData; // eslint-disable-line no-unused-vars
              const lastFullTitle = get(lastYouTubeMediaData, "snippet.title");

              if ((lastFullTitle.match(/-/g) || []).length === 1) {
                lastSongAuthor = lastFullTitle.split(" - ")[0].trim();
                lastSongTitle = lastFullTitle.split(" - ")[1].trim();
              }
            } else {
              const lastSoundCloudMediaData = await bot.soundcloud.getTrack(lastPlay.media.cid);

              if (!isNil(lastSoundCloudMediaData)) {
                const lastFullTitle = lastSoundCloudMediaData.title;

                if ((lastFullTitle.match(/-/g) || []).length === 1) {
                  lastSongAuthor = lastFullTitle.split(" - ")[0].trim();
                  lastSongTitle = lastFullTitle.split(" - ")[1].trim();
                }
              }
            }
          } catch (err) {
            lastSongAuthor = lastPlay.media.author;
            lastSongTitle = lastPlay.media.title;
          }

          if (isNil(lastSongAuthor) || isNil(lastSongTitle)) {
            lastSongAuthor = lastPlay.media.author;
            lastSongTitle = lastPlay.media.title;
          }

          let lastPlaySkipped = lastPlay.score.skipped;

          if (bot.global.isSkippedByTimeGuard) {
            lastPlaySkipped = false;
            bot.global.isSkippedByTimeGuard = false;
          }

          if (bot.global.isSkippedByMehGuard) {
            lastPlaySkipped = false;
          }

          // keep track of played media in the room
          await bot.db.models.plays.create({
            cid: lastPlay.media.cid,
            format: lastPlay.media.format,
            woots: lastPlay.score.positive,
            grabs: lastPlay.score.grabs,
            mehs: lastPlay.score.negative,
            dj: lastPlay.user.id,
            skipped: lastPlaySkipped > 0,
            author: `${lastSongAuthor}`,
            title: `${lastSongTitle}`,
          });

          // count how many props were given while that media played
          const props = await bot.db.models.props.count({
            where: { historyID: `${lastPlay.id}`, dj: lastPlay.user.id },
          });

          // get an user object for the last DJ
          const [instance] = await bot.db.models.users.findOrCreate({
            where: { id: lastPlay.user.id }, defaults: { id: lastPlay.user.id, username: lastPlay.user.username },
          });

          const woots = lastPlay.score.positive;
          const grabs = lastPlay.score.grabs;
          const mehs = lastPlay.score.negative;

          try {
            if (!isNil(savedMessageID)) {
              if (lastPlaySkipped === 1) {
                bot.channels.get("486125808553820160").fetchMessage(savedMessageID)
                  .then(message => message.edit(savedMessage.replace("is now Playing", "Played") + " Skipped!"));
              } else {
                bot.channels.get("486125808553820160").fetchMessage(savedMessageID)
                  .then(message => message.edit(savedMessage.replace("is now Playing", "Played") + " <:plugWoot:486538570715103252> " + woots + " " + "<:plugMeh:486538601044115478> " + mehs + " " + "<:plugGrab:486538625270677505> " + grabs + "\n"));
              }
            }

            bot.channels.get("486125808553820160").send(moment().format("LT") + " - **" + data.currentDJ.username + " (" + data.currentDJ.id + ")** is now Playing: " + `${songAuthor} - ${songTitle}`).then(m => {
              savedMessageID = m.id;
              savedMessage = m.content;
            });
          } catch (err) {
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

              await bot.plug.chat(bot.utils.replace(bot.lang.advanceprops, {
                props,
                user: lastPlay.user.username,
                plural: props > 1 ? "s" : "",
              }), data.media.duration * 1e3);
            }
          }

          skipped = false;
          bot.global.ignoreHistoryNext = false;
          await bot.utils.updateRDJ(lastPlay.user.id);
        });
      } catch (err) {
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
const { Op } = require("sequelize");
const moment = require("moment");
const {
  isObject, isNaN, isNil, get, keys, map, sortBy,
} = require("lodash");

var savedMessageID;
var savedMessage;

module.exports = function Event(bot, filename, platform) {
  const event = {
    name: bot.plug.events.ADVANCE,
    platform,
    _filename: filename,
    run: async (data) => {
      if (!isObject(data) || !isObject(data.media) || !isObject(data.currentDJ)) return;

      bot.plug.woot();

      let songAuthor = null;
      let songTitle = null;

      try {
        if (get(data, "media.format", 2) === 1) {
          const YouTubeMediaData = await bot.youtube.getMedia(data.media.cid);

          const { snippet } = YouTubeMediaData; // eslint-disable-line no-unused-vars
          const fullTitle = get(YouTubeMediaData, "snippet.title");

          const { contentDetails, status } = YouTubeMediaData;
          const uploadStatus = get(YouTubeMediaData, "status.uploadStatus");
          const privacyStatus = get(YouTubeMediaData, "status.privacyStatus");
          const embeddable = get(YouTubeMediaData, "status.embeddable");

          if (!isObject(contentDetails) || !isObject(status) || uploadStatus !== "processed" || privacyStatus === "private" || !embeddable) {
            await bot.plug.sendChat(bot.utils.replace(bot.check.mediaUnavaialble, { which: "current" }));
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

      const blacklisted = await bot.db.models.blacklist.findOne({ where: { cid: data.media.cid }});

      if (isObject(blacklisted) || songAuthor.toLowerCase().includes("nightcore") || songTitle.toLowerCase().includes("nightcore") ||
          songAuthor.toLowerCase().includes("bass boosted") || songTitle.toLowerCase().includes("bass boosted") ||
          songAuthor.toLowerCase().includes("whatsapp") || songTitle.toLowerCase().includes("whatsapp") ||
          songAuthor.toLowerCase().includes("gemido") || songTitle.toLowerCase().includes("gemido") ||
          songAuthor.toLowerCase().includes("gemidão") || songTitle.toLowerCase().includes("gemidão") ||
          songAuthor.toLowerCase().includes("rape") || songTitle.toLowerCase().includes("rape")) {
        await bot.plug.sendChat(`@${data.currentDJ.username} ` + bot.lang.blacklisted);
        await bot.plug.moderateForceSkip();
      }

      if (isObject(data.currentDJ) && data.media.duration >= 390) {
        await bot.plug.sendChat(`@${data.currentDJ.username} ` + bot.lang.exceedstimeguard);
        await bot.utils.lockskip(data.currentDJ);
      }

      const songHistory = await bot.utils.getSongHistory(songAuthor, songTitle, data.media.cid);

      if (!isNil(songHistory)) {
        if (songHistory.skip) {
          if (!songHistory.maybe) {
            await bot.plug.sendChat(bot.utils.replace(bot.lang.historySkip, {
              time: bot.moment(map(songHistory, "created_at")[0]).fromNow(),
            }));
            await bot.plug.sendChat("!plays");
          //await bot.plug.moderateForceSkip();
          } else {
            await bot.plug.sendChat(bot.utils.replace(bot.lang.maybeHistorySkip, {
              cid: map(songHistory, "cid")[0],
              time: bot.moment(map(songHistory, "created_at")[0]).fromNow(),
            }));
          }
        }
      }

      const savedID = data.media.id;

      setTimeout(async () => {
        const currentMedia = bot.plug.getMedia();

        if (savedID === get(currentMedia, "id")) {
          await bot.plug.sendChat(bot.lang.stuckSkip);
          await bot.plug.moderateForceSkip();
        }
      }, (data.media.duration + 5) * 1e3);

      try {
        // get history for the latest play

        await bot.wait(2000);
        const getHistory = bot.plug.getHistory();
        const sortHistory = sortBy(getHistory, ["timestamp"]);
        const lastPlay = sortHistory.pop(); //await bot.plug.getHistory();

        // if plug reset the history or its a brand new room it won't have history
        if (isNil(lastPlay.media)) return;

        const lastSaved = await bot.db.models.plays.findAll({
          order: [["id", "DESC"]],
          limit: 1,
        });
        console.log(lastSaved[0].cid);
        console.log(lastSaved.cid);
        console.log(lastSaved[0].dataValues.cid);
        console.log(lastSaved.dataValues.cid);
        if (!isNil(lastSaved)) if (lastSaved[0].cid === data.media.cid) return;

        //const [lastPlay] = history;
        
        // save how much XP they got for their play
        const score = keys(bot.points.votes).length + 1;
        const ids = keys(bot.points.votes).map(k => parseInt(k, 10)).filter(i => !isNaN(i));

        // empty the XP counter
        bot.points.votes = {};

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

        // keep track of played media in the room
        await bot.db.models.plays.create({
          cid: lastPlay.media.cid,
          format: lastPlay.media.format,
          woots: lastPlay.score.positive,
          grabs: lastPlay.score.grabs,
          mehs: lastPlay.score.negative,
          dj: lastPlay.user.id,
          skipped: lastPlay.score.skipped > 0,
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
            if (lastPlay.score.skipped === 1) {
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
        if (!lastPlay.score.skipped) {
          const previousScore = instance.get("points");
          await instance.increment("points", { by: score });
          if (previousScore < 10000) {
            bot.points.incrementHook(instance);
          }

          // award users that voted their XP
          await bot.db.models.users.increment("points", { by: 1, where: { id: { [Op.in]: ids } } });

          // if no props were given, we done here
          if (!props) return;

          // otherwise, give them the props
          await instance.increment("props", { by: props });

          await bot.plug.sendChat(bot.utils.replace(bot.lang.advanceprops, {
            props,
            user: lastPlay.user.username,
            plural: props > 1 ? "s" : "",
          }), data.media.duration * 1e3);
        }
      } catch (err) {
        console.error(err);
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
const { map, isNil } = require("lodash")

module.exports = function Util(bot) {
  const util = {
    name: "otterDJ",
    function: async () => {
      return {
        update: async (limit) => {
          const currentPlaylist = new Promise((resolve, reject) => {
            try {
              const createPlaylist = (playlistNumberTag) => {
                const numberTag = playlistNumberTag ? playlistNumberTag + 1 : 0
                bot.plug.createPlaylist(`OtterBot ${numberTag}`, (err, playlist) => {
                  if (err) console.error("ERR: ", err);
                  bot.plug.activatePlaylist(playlist[0].id, () => resolve(playlist[0]));
                });
              }
        
              // CHECK IF THERE IS ANY PLAYLIST
              bot.plug.getPlaylists(existingPlaylists => {
                if (existingPlaylists.length > 0) {
                  bot.plug.getActivePlaylist(activePlaylist => {
                    if (activePlaylist.count < 200) {
                      resolve(activePlaylist);
                    } else {
                      createPlaylist(activePlaylist.name.match(/\d+/)[0]);
                    }
                  });
                } else {
                  createPlaylist();
                }
              });
            } catch(err) {
              reject(err);
            }
          })
    
          const YTDurationToSeconds = (duration) => {
            var match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
          
            match = match.slice(1).map(function(x) {
              if (x != null) {
                  return x.replace(/\D/, "");
              }
            });
          
            var hours = (parseInt(match[0]) || 0);
            var minutes = (parseInt(match[1]) || 0);
            var seconds = (parseInt(match[2]) || 0);
          
            return hours * 3600 + minutes * 60 + seconds;
          }
    
          currentPlaylist.then(activePlaylist => {
            // FETCH MESSAGES FROM "MUSIC-RELEASES" CHANNEL
            bot.channels.get("556717761091338243").fetchMessages({ limit: limit })
              .then(messages => {
                let plugMedia = [];
                const filteredMessages = messages.filter(msg => {
                  const re = /^(http:\/\/|https:\/\/)(vimeo\.com|youtu\.be|www\.youtube\.com)\/([\w\/]+)([\?].*)?$/igm;
                  const test = re.test(msg.content) && msg.author.id === "104642465545338880";
                  if (test) {
                    plugMedia.push(msg.content.match(re)[0].replace("https://www.youtube.com/watch?v=", ""));
                  }
                  return test;
                })
    
                plugMedia = map(plugMedia, async (cid) => {
                  const YouTubeMediaData = await bot.youtube.getMedia(cid);
    
                  const fullTitle = YouTubeMediaData.snippet.title;
                  const songAuthor = fullTitle.split(" - ")[0].trim();
                  const songTitle = fullTitle.split(" - ")[1].trim();
                  const songDuration = YTDurationToSeconds(YouTubeMediaData.contentDetails.duration);
    
                  const songHistory = await bot.utils.getSongHistory(songAuthor, songTitle, cid);

                  if (isNil(songHistory) && (songDuration < 378)) {
                    const payload = {};
                    payload.cid = cid;
                    payload.format = 1;
                    payload.image = YouTubeMediaData.snippet.thumbnails.default.url;
                    payload.duration = songDuration;
                    payload.title = songTitle;
                    payload.author = songAuthor;
                    return payload;
                  }
    
                  return null;
                })
    
                Promise.all(plugMedia).then(async () => {
                  let songs = await Promise.map(plugMedia, async (media) => {
                    return media;
                  });
    
                  songs = songs.filter(el => el !== null);
    
                  const diff = activePlaylist.count + songs.length;
                  if (activePlaylist.count !== diff) {
                    if (diff > 200) {
                      activePlaylist = await currentPlaylist;
                    }

                    bot.plug.addSongToPlaylist(activePlaylist.id, songs, async (err, success) => {
                      if (err) {
                        console.error("addSong ERR: ", err);
                      } else {
                        await bot.plug.sendChat(`OtterBot playlists updated!`);
                      }
                    })
                  } else {
                    await bot.plug.sendChat(`OtterBot playlists already has latest songs!`);
                  }
                }).catch(console.error);
              }).catch(console.error);
          }).catch(console.error);
        },
        join: async () => {
          await bot.plug.getPlaylists(async existingPlaylists => {
            if (existingPlaylists.length > 0) {
              bot.plug.joinBooth(async (err) => {
                if (err) {
                  console.error("JOIN ERR: ", err);
                } else {
                  await bot.plug.sendChat("OtterBot is now in the waitlist!");
                }
              });
            } else {
              await bot.plug.sendChat("OtterBot playlist is empty!");
            }
          })
        }
      }
    },
  };

  bot.utils.register(util);
};
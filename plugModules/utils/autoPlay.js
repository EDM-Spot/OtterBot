const { each, isObject } = require("lodash");
const fetch = require("node-fetch");

module.exports = function Util(bot) {
  class AutoPlayUtil {
    constructor(key) {
      this.key = key;
    }
    async updatePlaylist() {
      each(bot.plug.getPlaylists(), async (playlist) => {
        await playlist.delete();
      });

      bot.plug.createPlaylist('Bot Playlist').then(async (playlist) => {
        console.log(playlist);
        await playlist.activate();

        /////////////////////////////////////////////////Channels
        //UCe55Gy-hFDvLZp8C8BZhBnw - NightBlue
        //UCa10nxShhzNrCE1o2ZOPztg - Trap Nation
        //UCJ6td3C9QlPO9O_J5dF4ZzA - Monstercat: Uncaged
        //UC7tD6Ifrwbiy-BoaAHEinmQ - Diversity
        //UCMOgdURr7d8pOVlc-alkfRg - xKito
        //UC_aEa8K-EOJ3D6gOs7HcyNg - NCS
        //UCSa8IUd1uEjlREMa21I3ZPQ - CloudKid
        //UC3ifTl5zKiCAhHIBQYcaTeg - Proximity
        //UCp8OOssjSjGZRVYK6zWbNLg - Monstercat: Instinct
        //UCqolymr8zonJzC08v2wXNrQ - Kyra
        //UC65afEgL62PGFWXY7n6CUbA - Trap City
        //UCwIgPuUJXuf2nY-nKsEvLOg - AirwaveMusicTV
        //UCj_Y-xJ2DRDGP4ilfzplCOQ - House Nation
        //UCSXm6c-n6lsjtyjvdD0bFVw - Liquicity
        //UC5nc_ZtjKW1htCVZVRxlQAQ - MrSuicideSheep
        //UCaAlh3Iy7rAcO3MgD_O3Kkg - Nik Cooper
        //UC0n9yiP-AD2DpuuYCDwlNxQ - Tasty
        const channels = [
          'UCe55Gy-hFDvLZp8C8BZhBnw',
          'UCa10nxShhzNrCE1o2ZOPztg',
          'UCJ6td3C9QlPO9O_J5dF4ZzA',
          'UC7tD6Ifrwbiy-BoaAHEinmQ',
          'UCMOgdURr7d8pOVlc-alkfRg',
          'UC_aEa8K-EOJ3D6gOs7HcyNg',
          'UCSa8IUd1uEjlREMa21I3ZPQ',
          'UC3ifTl5zKiCAhHIBQYcaTeg',
          'UCp8OOssjSjGZRVYK6zWbNLg',
          'UCqolymr8zonJzC08v2wXNrQ',
          'UC65afEgL62PGFWXY7n6CUbA',
          'UCwIgPuUJXuf2nY-nKsEvLOg',
          'UCj_Y-xJ2DRDGP4ilfzplCOQ',
          'UCSXm6c-n6lsjtyjvdD0bFVw',
          'UC5nc_ZtjKW1htCVZVRxlQAQ',
          'UCaAlh3Iy7rAcO3MgD_O3Kkg',
          'UC0n9yiP-AD2DpuuYCDwlNxQ'
        ];

        const d = new Date();
        d.setDate(d.getDate() - days);

        const i = 1;
        each(channels, async (channel) => {
          await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channel}&maxResults=30&order=date&publishedAfter=${d.toISOString()}&fields=items(id(videoId),snippet(channelId,channelTitle,title,thumbnails(default(url))))&key=${this.key}`)
            .then(res => res.json())
            .then(data => {
              console.log(data);
              if (data.items.length > 0) {
                console.log(data.items[0].snippet.channelTitle + ' Retrieved ' + data.items.length + ' Results');

                each(data.items, async (index, video) => {
                  const fulltitle = video.snippet.title;

                  if (fulltitle.split(" - ")[1] != undefined) {
                    var duration = 0;

                    await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${video.id.videoId}&fields=items(contentDetails(duration))&key=${this.key}&part=contentDetails`)
                      .then(res1 => res1.json())
                      .then(async (videoInfo) => {
                        duration = this.convertTimeToSeconds(videoInfo.items[0].contentDetails.duration);

                        if (duration > 0 && duration < 600) {
                          await playlist.insert({
                            format: bot.plug.MEDIA_SOURCE.YOUTUBE,
                            cid: video.id.videoId,
                            author: fulltitle.split(" - ")[0].trim(),
                            title: fulltitle.split(" - ")[1].trim(),
                            duration: duration,
                            image: video.snippet.thumbnails.default.url
                          });

                          console.log('Loaded ' + i + ' of ' + data.items.length);
                          i++;
                        }
                      });
                  }
                });
              }
            });
        });

        await playlist.shuffle();
      });
    }
    convertTimeToSeconds(time) {
      var a = time.match(/\d+H|\d+M|\d+S/g),
        result = 0;

      var d = { 'H': 3600, 'M': 60, 'S': 1 },
        num,
        type;

      for (var i = 0; i < a.length; i++) {
        num = a[i].slice(0, a[i].length - 1);
        type = a[i].slice(a[i].length - 1, a[i].length);

        result += parseInt(num) * d[type];
      }

      return result;
    }
  }

  bot.autoplay = new AutoPlayUtil(bot.config.youtube);
};
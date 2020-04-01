const ytdl = require('ytdl-core-discord');

module.exports = (client) => {
  class VoiceUtil {
    constructor() {
      this.channel = "485173051432894493";
    }

    async play() {
      const plug = client.plug.historyEntry();
      const voiceChannel = client.channels.get(this.channel);
      const connection = await voiceChannel.join();

      let dataUrl;

      if (plug.media.format === 1) {
        dataUrl = `https://www.youtube.com/watch?v=${plug.media.cid}`;
      } else {
        dataUrl = `https://w.soundcloud.com/player/?url=https://api.soundcloud.com/tracks/${plug.media.cid}`;
      }

      connection.play(await ytdl(dataUrl, {
        begin: plug.media.elapsed,
        filter: format => ['251'],
        quality: 'highest',
        highWaterMark: 1 << 25
      }), {
        volume: false,
        type: 'opus'
      });
    }
  }

  client.voiceUtil = new VoiceUtil();
};
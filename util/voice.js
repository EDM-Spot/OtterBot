const ytdl = require('ytdl-core-discord');

module.exports = (client) => {
  class VoiceUtil {
    constructor() {
      this.channel = "485173051432894493";
      this.key = client.config.soundcloud;
    }

    async play() {
      const plug = client.plug.historyEntry();
      const voiceChannel = client.channels.cache.get(this.channel);
      const connection = await voiceChannel.join();

      let dataStream;

      if (plug.media.format === 1) {
        const url = `https://www.youtube.com/watch?v=${plug.media.cid}`;

        dataStream = await ytdl(url, {
            begin: plug.media.elapsed,
            quality: 'highestaudio',
            highWaterMark: 1 << 25
          });
      } else {
        dataStream = client.soundcloud.getStream(plug.media.cid);
      }

      connection.play(dataStream, {
        volume: false,
        type: 'opus'
      });
    }
  }

  client.voiceUtil = new VoiceUtil();
};
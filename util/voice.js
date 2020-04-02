const ytdl = require('ytdl-core-discord');
const fetch = require("node-fetch");

module.exports = (client) => {
  class VoiceUtil {
    constructor() {
      this.channel = "485173051432894493";
      this.key = client.config.soundcloud;
    }

    async play() {
      const plug = client.plug.historyEntry();
      const voiceChannel = client.channels.cache.get(this.channel);

      if (voiceChannel.members.size < 1) { return; }

      const connection = await voiceChannel.join();

      let dataStream;

      if (plug.media.format === 1) {
        const url = `https://www.youtube.com/watch?v=${plug.media.cid}`;

        dataStream = await ytdl(url, {
          begin: plug.media.elapsed + "s",
          quality: 'highestaudio',
          highWaterMark: 1 << 25
        });
      } else {
        //dataStream = await client.soundcloud.getStream(plug.media.cid);
        //dataStream = await fetch("http://api.soundcloud.com/tracks/" + plug.media.cid + "/stream?consumer_key=" + this.key)

        let response = await fetch(`https://api-v2.soundcloud.com/tracks/${plug.media.cid}?client_id=${this.key}`);
        const trackV2 = await response.json();
        const streamUrl = trackV2.media.transcodings.filter(
          transcoding => transcoding.format.protocol === 'progressive'
        )[0].url;

        response = await fetch(`${streamUrl}?client_id=${this.key}`);
        const stream = await response.json();
        const dataStream = stream.url;

        console.log(dataStream);
      }

      connection.play(dataStream, {
        volume: 0.25,
        type: 'opus'
      });
    }
  }

  client.on('voiceStateUpdate', async (oldMember, newMember) => {
    const voiceChannel = client.channels.cache.get("485173051432894493");

    if (newMember !== undefined) {
      if (newMember.channelID !== null) {
        if (newMember.id === "486087139088400384") { return; }
        if (newMember.channelID != "485173051432894493") { return; }

        if (voiceChannel.members.size >= 1 && !voiceChannel.members.some(user => user.id === '486087139088400384')) {
          await client.voiceUtil.play();
        }
      }
    }

    if (voiceChannel.members.some(user => user.id === '486087139088400384')) {
      if (voiceChannel.members.size === 1) {
        voiceChannel.leave();
      }
    }
  });

  client.voiceUtil = new VoiceUtil();
};
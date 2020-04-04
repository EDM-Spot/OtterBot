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

      if (plug.media.format === 1) {
        const url = `https://www.youtube.com/watch?v=${plug.media.cid}`;

        const dataStream = await ytdl(url, {
          begin: plug.media.elapsed + "s",
          quality: 'highestaudio',
          highWaterMark: 1 << 25
        });

        connection.play(dataStream, {
          volume: false,
          type: 'opus'
        });
      } else {
        await fetch(`https://api.soundcloud.com/tracks/${plug.media.cid}/stream?client_id=${this.key}`)
          .then(res => {
            connection.play(res.url, {
              volume: false
            });
          });
      }
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
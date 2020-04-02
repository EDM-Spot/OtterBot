const ytdl = require('ytdl-core-discord');
const request = require("request-promise");

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
        dataStream = await client.soundcloud.getStream(plug.media.cid);
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

        if (voiceChannel.members.size >= 1) {
          await client.voiceUtil.play();
        }
      }
    }

    console.log(voiceChannel.members.some(user => user.id === '486087139088400384'));
    console.log(voiceChannel.members.size);
    if (voiceChannel.members.some(user => user.id === '486087139088400384')) {
      if (voiceChannel.members.size === 1) {
        voiceChannel.leave();
      }
    }
  });

  client.voiceUtil = new VoiceUtil();
};
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

      console.log(voiceChannel.members.size);
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
        const soundcloudData = await client.soundcloud.getTrack(plug.media.cid);
        console.log(soundcloudData.stream_url);

        dataStream = await client.soundcloud.getStream(plug.media.cid);
      }

      connection.play(dataStream, {
        volume: 0.25,
        type: 'opus'
      });
    }
  }

  client.on('voiceStateUpdate', async (oldMember, newMember) => {
    const voiceChannel = client.channels.cache.get(this.channel);
    let newUserChannel = newMember.voiceChannel;
    let oldUserChannel = oldMember.voiceChannel;

    if (newMember.voiceChannelID != this.channel) { return; }

    if (oldUserChannel === undefined && newUserChannel !== undefined && voiceChannel.members.size > 1) {
      await voiceChannel.join();
    } else if (newUserChannel === undefined) {
      await voiceChannel.leave();
    }
  });

  client.voiceUtil = new VoiceUtil();
};
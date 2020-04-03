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
        //dataStream = await fetch("http://api.soundcloud.com/tracks/" + plug.media.cid + "/stream?consumer_key=" + this.key);
      }

      connection.play("https://cf-media.sndcdn.com/nK4TgJ5ypSrQ.128.mp3?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiKjovL2NmLW1lZGlhLnNuZGNkbi5jb20vbks0VGdKNXlwU3JRLjEyOC5tcDMiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE1ODU4NzQ4OTR9fX1dfQ__&Signature=KPndqDvIUjyMljwixdfQaYUs06TCbumMo6j79nfDKFP4Z14KxvAxUrIW8DHh79U5ftiUF1N-mnI23dCiyLhYw8zGozdhs3KzHDY4MzocxolCgpx9rXVWlvinImD9JfWn2yxjLM8MV6dcAAzpwA0pxq3PalQRD2ztNMqN3ns~z931y99Co3OA85~0oO8XDZ7agBD776-Ukn7eWJQGNijYCT0vs-V1GFH~rZlVeonvO4w4kJFxzeYlpRP6qiUfg7ZG8NbMTen1ybuYBu2ZPpYKlfzySvdH8a2cmc6kmHzYFe-q4RzKywytWWzQwawoCVc3IXe3-3AJng1c2M6fU0MpCA__&Key-Pair-Id=APKAI6TU7MMXM5DG6EPQ", {
        volume: 0.25
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
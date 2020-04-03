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
      let streamType = "opus";

      if (plug.media.format === 1) {
        const url = `https://www.youtube.com/watch?v=${plug.media.cid}`;

        dataStream = await ytdl(url, {
          begin: plug.media.elapsed + "s",
          quality: 'highestaudio',
          highWaterMark: 1 << 25
        });
      } else {
        dataStream = await client.soundcloud.getStream(plug.media.cid);
        streamType = null;
      }

      connection.play("https://cf-media.sndcdn.com/TO0cX0BfbH5e.128.mp3?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiKjovL2NmLW1lZGlhLnNuZGNkbi5jb20vVE8wY1gwQmZiSDVlLjEyOC5tcDMiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE1ODU4NzU1NTd9fX1dfQ__&Signature=Ow5CW-nYd6l-yulykWjb26dAQKD-gvWYZD0n7zZAO95zEh1nkuUxDpylGHRYISMAinmLzkj5T2sjHfBd6uRG0tI0sAk0rpb09kTuebdnSuDJi0ywPUZ7PNYH9FvfYHWucw6Ywtpxu2mMyCpYNB4wNfBMeHBOFHeg9ba~945yAXfhPJfzPTNW3EYTeguJ-7V6z-9eKxBxpa8yQ01j~1l1u6PiPQvMGaE~ISMbc~S3PNblFk6bbunSzDvP21v1lQnkkpOPklwM6DiEF~X4RGEoe1r9TGbGmxTU0PI2GjImGMuqy92Lm-XiphF22drGxuo2v257W7CKstn1-pCfVmHbbA__&Key-Pair-Id=APKAI6TU7MMXM5DG6EPQ", {
        volume: 0.25,
        type: streamType
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
const got = require("got");
const qs = require("qs");

module.exports = function (bot) {
	
	const youtube = {};

	youtube.req = options => {
		return new Promise ((resolve, reject) => {
			let opts = {
				method: ["GET", "POST", "PUT", "PATCH", "HEAD", "DELETE"].includes(options.method) ? options.method : "GET",
				json: true,
				body: options.body
			};

			options.params.part = options.parts.join(",");
			options.params.key = bot.config.youtube_key;

			let querystring = qs.stringify(options.params);

			got(`https://www.googleapis.com/youtube/v3${options.endpoint}?${querystring}`, opts).then(response => {
				let body;

				try {
					body = typeof response.body === "object" ? response.body : JSON.parse(response.body);
				} catch (e) {
					return reject(e);
				}

				return resolve(body);
			}).catch(reject);
		});
	};

	youtube.getMedia = id => {
		return new Promise ((resolve, reject) => {
			return youtube.req({endpoint: `/videos`, parts: ["snippet", "contentDetails", "statistics", "status"], params: {id: id}}).then(response => {
				if (typeof response !== "object" || !Array.isArray(response.items) || !response.items.length) return reject();
				return resolve(response.items.shift());
			}).catch(reject);
		});
	};
	youtube.getMediaID = link => link.includes("youtu.be/") ? link.split("youtu.be/")[1].split("?")[0] : link.includes("watch?") ? link.split("v=")[1].split("&")[0] : undefined;

	bot.youtube = youtube;
};
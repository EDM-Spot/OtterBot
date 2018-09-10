const got = require("got");
const qs = require("qs");

module.exports = function (bot) {
	
	const twitch = {};

	twitch.req = options => {
		return new Promise ((resolve, reject) => {
			let opts = {
				method: ["GET", "POST", "PUT", "PATCH", "HEAD", "DELETE"].includes(options.method) ? options.method : "GET",
				json: true,
				body: options.body,
				query: options.query,
				headers: {
					"Accept": "application/vnd.twitchtv.v3+json",
					"Client-ID": bot.config.twitch.client_id
				}
			};

			if (options.OAuthToken)
				opts.headers.Authorization = `OAuth ${options.OAuthToken}`;

			got(`https://api.twitch.tv/kraken${options.endpoint}`, opts).then(response => {
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

	twitch.getRedirectURI = () => `https://plugdj.info/auth/twitch`;

	twitch.getStream = stream => twitch.req({endpoint: `/streams/${stream}`});
	twitch.getFollowage = (user, channel) => twitch.req({endpoint: `/users/${user}/follows/channels/${channel}`});
	twitch.getSubscription = (user, channel, token) => twitch.req({endpoint: `/users/${user}/subscriptions/${channel}`, OAuthToken: token});
	twitch.getAuthURL = () => `https://api.twitch.tv/kraken/oauth2/authorize?${qs.stringify({response_type: "code", client_id: bot.config.twitch.client_id, redirect_uri: twitch.getRedirectURI(), scope: "user_subscriptions user_read"})}`;


	twitch.getAccessToken = code => twitch.req({
		method: "POST",
		endpoint: `/oauth2/token`,
		query: {
			client_id: bot.config.twitch.client_id,
			client_secret: bot.config.twitch.client_secret,
			grant_type: "authorization_code",
			redirect_uri: twitch.getRedirectURI(),
			code: code
		}
	});

	twitch.getAuthenticatedUser = (token) => twitch.req({endpoint: `/user`, OAuthToken: token});

	bot.twitch = twitch;
};
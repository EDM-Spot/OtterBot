const express = require("express");

const app  = express();

app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");

let userCache = {};

module.exports = function (bot) {
	app.get("/:type(plays|history|lastplayed)", (req, res) => {
		res.status(200).render("plays");
	});
	app.get("/xp", async (req, res) => {
		try {
			let instances = await bot.db.models.users.findAll({ attributes: [ "id", "points" ], order: [ [ "points", "DESC" ] ], limit: 25 });
			instances = instances.map(instance => instance.toJSON());

			let users = [];

			if (instances.map(instance => instance.id).filter(id => !userCache[id]).length) {
				users = await bot.plug.post("users/bulk", { ids: instances.map(instance => instance.id).filter(id => !userCache[id]) });

				instances = instances.map(instance => {
					let user = userCache[instance.id] || users.filter(user => instance.id === user.id)[0] || undefined;

					return {
						profile: `https://plug.dj/@/${user.slug}`,
						username: user.username,
						xp: bot.utils.numberWithCommas(instance.points)
					};
				});

				for (let i = 0; i < users.length; i++) {
					if (!userCache[users[i].id]) {
						userCache[users[i].id] = users[i];
					}
				}

				return res.status(200).render("xp", { data: instances });
			} else {
				for (let i = 0; i < instances.length; i++) {
					if (userCache[instances[i].id]) {
						users.push(userCache[instances[i].id]);
					}
				}
			}

			instances = instances.map(instance => {
				let user = userCache[instance.id] || users.filter(user => instance.id === user.id)[0] || undefined;

				return {
					profile: `https://plug.dj/@/${user.slug}`,
					username: user.username.replace("&gt;", ">").replace("&lt;", "<"),
					xp: bot.utils.numberWithCommas(instance.points)
				};
			});

			for (let i = 0; i < users.length; i++) {
				if (!userCache[users[i].id]) {
					userCache[users[i].id] = users[i];
				}
			}

			return res.status(200).render("xp", { data: instances });
		} catch (err) {
			console.error(err);
			return res.status(500).render("error", { message: "Internal Error." });
		}
	});
	app.get("/:type(cmd|cmds|command|commands)", (req, res) => {
		let cmds = bot.commands.get_loaded();
		let commands = [];

		let roles = {
			5000: "Host",
			4000: "Co-Host",
			3000: "Manager",
			2000: "Bouncer",
			1000: "Resident DJ",
			0: "User"
		};

		let filter = (i, command) => command.role === i;
		let mapper = data => {
			let command = {
				Names: data.names.map(name => `!${name}`).join(", "),
				Parameters: data.info.parameters,
				"Cooldown Type": data.cooldown.type.replace(/_/g, " "),
				"Cooldown Duration": "",
				Description: data.info.description
			};

			if (data.cooldown.type !== "none") {
				if (Math.floor(data.cooldown.duration / 60)) {
					command["Cooldown Duration"] += `${Math.floor(data.cooldown.duration / 60)}m`;
					if (Math.floor(data.cooldown.duration % 60))
						command["Cooldown Duration"] += `${Math.floor(data.cooldown.duration % 60)}s`;
				} else {
					command["Cooldown Duration"] += `${data.cooldown.duration % 60}s`;
				}
			}

			return command;
		};

		for (let i = 0; i < 5; i++) {
			commands.push({
				role: i * 1000,
				roleName: roles[i * 1000],
				commands: cmds.filter(filter.bind(this, i * 1000)).map(mapper)
			});
		}

		return res.status(200).render("commands", {commands: commands});
	});
	app.get("*", (req, res) => {
		if (req.accepts("html") === "html")
			return res.render("404", {path: req.path});
		else if (req.accepts("json") === "json")
			return res.json({message: ["Not found"], status: "error"});
		else return res.status(406);
	});

	app.listen(3003);

	this.processor = () => Promise.resolve(app);
};

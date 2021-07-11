const Router = require("express").Router();

Router.get("/", (req, res) => {
    res.render("home.ejs", {
        pageTitle: "Delover | Home",
        bot: client,
        req,
    });
});

Router.post("/", (req, res) => {
    res.render("home.ejs", {
        pageTitle: "Delover | Home",
        bot: client,
        req,
    });
});


Router.get("/privacy", (req, res) => {
    res.render("privacy.ejs", {
        pageTitle: "Delover | Polityka",
        bot: client,
        req,
    });
});

Router.get("/leaderboard/:ID", async (req, res) => {
    const guild = client.guilds.cache.get(req.params.ID);
    const settings = await client.database.servers.get(guild.id);
    const baselevels = await client.database.leveling.getAll(guild.id);
    const levels = [];
    const members = await guild.members.fetch({ cache: false });
    for (const user of baselevels) {
        if (!members.get(user.userid)) continue;
        levels.push({
            user: members.get(user.userid),
            level: user.level,
            xp: user.xp,
        });
    }

    res.render("leaderboard.ejs", {
        pageTitle: "Delover | Topka poziomów",
        bot: client,
        guild,
        settings,
        req,
        levels,
    });
});

Router.get("/support", (req, res) => {
    res.redirect(client.config.links.support);
});

Router.get("/add", (req, res) => {
    res.redirect(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=347208&scope=bot%20applications.commands`);
});

module.exports = Router;

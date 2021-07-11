const checkAuth = require("../middlewares/dashboard/checkAuth");
const checkGuild = require("../middlewares/dashboard/checkGuild");
const Discord = require("discord.js-light");
const Router = require("express").Router();
const moment = require("moment");
moment.locale("PL");

Router.get("/", checkAuth, async (req, res) => {
    const member = await client.users.fetch(req.user.id);
    if (!member) return res.redirect("/");
    res.render("dashboard.ejs", {
        pageTitle: "Delover | Wybierz Gildie",
        bot: client,
        req,
        user: req.user,
        member: member,
        Permissions: Discord.Permissions,
    });
});

Router.get("/profile", checkAuth, async (req, res) => {
    const member = await client.users.fetch(req.user.id);
    if (!member) return res.redirect("/");
    res.render("./user-settings/profile.ejs", {
        pageTitle: "Delover | Profil",
        bot: client,
        req,
        user: req.user,
        member: member,
    });
});

Router.get("/profile/beta", checkAuth, async (req, res) => {
    const member = await client.users.fetch(req.user.id);
    const userSettings = await client.database.users.get(member.id);
    if (!member) return res.redirect("/");
    res.render("./user-settings/beta.ejs", {
        pageTitle: "Delover | Profil",
        bot: client,
        req,
        user: req.user,
        member: member,
        userSettings,
    });
});

Router.get("/profile/beta/backups", checkAuth, async (req, res) => {
    const member = await client.users.fetch(req.user.id);
    const userSettings = await client.database.users.get(member.id);
    if (!member) return res.redirect("/");
    res.render("./user-settings/backups.ejs", {
        pageTitle: "Delover | Profil",
        bot: client,
        req,
        user: req.user,
        member: member,
        userSettings,
    });
});

Router.get("/profile/beta/reminders", checkAuth, async (req, res) => {
    const member = await client.users.fetch(req.user.id);
    const userSettings = await client.database.users.get(member.id);
    const reminders = await client.database.reminders.getAll(member.id);
    if (!member) return res.redirect("/");
    res.render("./user-settings/reminders.ejs", {
        pageTitle: "Delover | Profil",
        bot: client,
        req,
        user: req.user,
        member: member,
        userSettings,
        reminders,
        moment: moment,
    });
});


Router.get("/:ID/", (req, res) => {
    res.redirect(`/dashboard/${req.params.ID}/select`);
});

Router.get("/:ID/select", checkAuth, checkGuild, async (req, res) => {
    res.render("selectclass.ejs", {
        pageTitle: "Delover | Wybierz Ustawienia",
        bot: client,
        req,
        guild: req.guild,
        member: req.member,
    });
});

Router.get("/:ID/main", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);
    res.render("./server-settings/main.ejs", {
        pageTitle: "Delover | Główne Ustawienia",
        bot: client,
        req,
        guild: req.guild,
        member: req.member,
        settings: guildConf,
    });
});

Router.get("/:ID/modlog", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);
    res.render("./server-settings/modlog.ejs", {
        pageTitle: "Delover | Ustawienia kanału modlog",
        bot: client,
        req,
        guild: req.guild,
        member: req.member,
        settings: guildConf,
    });
});

Router.get("/:ID/muted", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);
    res.render("./server-settings/muted.ejs", {
        pageTitle: "Delover | Główne Roli Wyciszony",
        bot: client,
        req,
        guild: req.guild,
        member: req.member,
        settings: guildConf,
    });
});

Router.get("/:ID/welcome", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);
    const alert = req.user.alert;
    req.user.alert = null;
    res.render("./server-settings/welcome.ejs", {
        pageTitle: "Delover | Powitania",
        bot: client,
        req,
        guild: req.guild,
        member: req.member,
        settings: guildConf,
    });
});

Router.get("/:ID/goodbye", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);
    const alert = req.user.alert;
    req.user.alert = null;

    res.render("./server-settings/goodbye.ejs", {
        pageTitle: "Delover | Pożegnania",
        bot: client,
        req,
        guild: req.guild,
        member: req.member,
        settings: guildConf,
        alert: alert,
    });
});

Router.get("/:ID/colors", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);
    const alert = req.user.alert;
    req.user.alert = null;

    res.render("./server-settings/colors.ejs", {
        pageTitle: "Delover | Kolory",
        bot: client,
        req,
        guild: req.guild,
        member: req.member,
        settings: guildConf,
        alert: alert,
    });
});

Router.get("/:ID/permissions", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);
    const alert = req.user.alert;
    req.user.alert = null;

    res.render("./server-settings/permissions.ejs", {
        pageTitle: "Delover | Permisje",
        bot: client,
        req,
        guild: req.guild,
        member: req.member,
        settings: guildConf,
        alert: alert,
    });
});


Router.get("/:ID/proposals", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);

    res.render("./server-settings/proposals.ejs", {
        pageTitle: "Delover | Propozycje",
        bot: client,
        req,
        guild: req.guild,
        member: req.member,
        settings: guildConf,
    });
});

Router.get("/:ID/antyinvite", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);

    res.render("./server-settings/antyinvite.ejs", {
        pageTitle: "Delover | Antyinvite",
        bot: client,
        req,
        guild: req.guild,
        member: req.member,
        settings: guildConf,
    });
});

Router.get("/:ID/autoresponders", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);

    res.render("./server-settings/autoresponders.ejs", {
        pageTitle: "Delover | Autorespondery",
        bot: client,
        req,
        guild: req.guild,
        member: req.member,
        settings: guildConf,
    });
});

Router.get("/:ID/leveling", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);

    res.render("./server-settings/leveling.ejs", {
        pageTitle: "Delover | Poziomy",
        bot: client,
        req,
        guild: req.guild,
        member: req.member,
        settings: guildConf,
    });
});

Router.get("/:ID/autorole", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);

    res.render("./server-settings/autorole.ejs", {
        pageTitle: "Delover | Autorole",
        bot: client,
        req,
        guild: req.guild,
        member: req.member,
        settings: guildConf,
    });
});

Router.get("/:ID/embed", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);

    res.render("./server-settings/embed-sender.ejs", {
        pageTitle: "Delover | Embed Sender",
        bot: client,
        req,
        guild: req.guild,
        member: req.member,
        settings: guildConf,
        validated: req.user.validatedBody,
    });
});

Router.get("/:ID/broadcast", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);

    res.render("./server-settings/broadcast.ejs", {
        pageTitle: "Delover | Ogłoszenia",
        bot: client,
        req,
        guild: req.guild,
        member: req.member,
        settings: guildConf,
    });
});

Router.get("/:ID/snipe", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);

    res.render("./server-settings/snipe.ejs", {
        pageTitle: "Delover | Snipe",
        bot: client,
        req,
        guild: req.guild,
        member: req.member,
        settings: guildConf,
    });
});

module.exports = Router;

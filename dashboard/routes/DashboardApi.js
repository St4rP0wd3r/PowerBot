const Router = require("express").Router();
const { inspect } = require("util");
const checkAuth = require("../middlewares/dashboard/checkAuth");
const checkGuild = require("../middlewares/dashboard/checkGuild");

const cooldownsList = {
    "/main/prefixes/remove": 2,
    "/main/prefixes/add": 2,
    "main/modlog/": 2,
    "main/muted/": 2,
    "main/muted/auto/": 2,
    "welcome/": 2,
    "goodbye/": 2,
    "permissions/add/": 2,
    "permissions/remove/": 2,
    "proposals/channels/add/": 2,
    "proposals/channels/remove": 2,
    "proposals/": 2,
    "antyinvite/channels/add/": 2,
    "antyinvite/channels/roles/": 2,
    "antyinvite/roles/add/": 2,
    "antyinvite/roles/remove/": 2,
    "antyinvite/": 2,
    "autoresponders/add/": 2,
    "autoresponders/remove/": 2,
    "embed/": 5,
    "leveling/roles/add/": 2,
    "leveling/roles/remove/": 2,
    "leveling/": 2,
};
const { Collection } = require("discord.js-light");
const cooldowns = new Collection();

Router.get("/auth", dashboard.passport.authenticate("discord"));

Router.get("/auth/callback", dashboard.passport.authenticate("discord", { failureRedirect: "/dashboard/api/auth" }), async (req, res) => {
    if (req.session.backURL) {
        const url = req.session.backURL;
        req.session.backURL = null;
        res.redirect(url);
    } else {
        res.redirect("/dashboard");
    }
});

Router.get("/auth/logout", checkAuth, (req, res) => {
    req.session.destroy(() => {
        req.logout();
        res.redirect("/");
    });
});

Router.use(async (req, res, next) => {
    if (!client.config.perms.developer.includes(req.user.id)) {
        const url = req.url.split("/").slice(3).join("/");
        const cooldownAmount = (cooldownsList[url] || 2) * 1000;
        if (cooldowns.has(`${req.user.id}_${cooldownsList[url]}`)) {
            const expirationTime = cooldowns.get(`${req.user.id}_${cooldownsList[url]}`) + cooldownAmount;

            if (Date.now() < expirationTime) {
                const timeLeft = (expirationTime - Date.now()) / 1000;

                return res.json({
                    alert: {
                        color: "red",
                        message: `Poczekaj ${timeLeft.toFixed(1)} przed kolejnym użyciem panelu`,
                        type: "alert-danger",
                    },
                    success: false,
                    code: 400,
                });
            }
        }

        cooldowns.set(`${req.user.id}_${cooldownsList[url]}`, Date.now());
        setTimeout(() => cooldowns.delete(`${req.user.id}_${cooldownsList[url]}`), cooldownAmount);
        next();
    } else next();
});


// Settings

Router.post("/settings/:ID/main/prefixes/add", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);
    const prefix = req.body?.prefix;

    if (!prefix) {
        res.json({
            alert: {
                color: "red",
                message: "Nie podano prefixu",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else if (prefix.length > 5) {
        res.json({
            alert: {
                color: "red",
                message: "Prefix jest dłuższy niż 5 znaków",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else if (guildConf.prefixes.includes(prefix)) {
        res.json({
            alert: {
                color: "red",
                message: "Posiadasz już taki prefix",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else {
        res.json({
            alert: {
                color: "green",
                message: "Dodano prefix",
                type: "alert-success",
            },
            success: true,
            code: 200,
        });
        await guildConf.prefixes.push(prefix);
        await guildConf.update({
            prefixes: guildConf.prefixes,
        });
    }
});

Router.post("/settings/:ID/main/prefixes/remove", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);
    const prefix = req.body?.prefix;
    if (!prefix) {
        res.json({
            alert: {
                color: "red",
                message: "Nie podano prefixu",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else if (!guildConf.prefixes.includes(prefix)) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie posiadasz takiego prefixu",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else if (guildConf.prefixes.length === 1) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie możesz usunąć ostatniego prefixu",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else {
        res.json({
            alert: {
                color: "green",
                message: "Usunięto prefix",
                type: "alert-success",
            },
            success: true,
            code: 200,
        });
        await guildConf.prefixes.deleteOne(prefix);
        await guildConf.update({
            prefixes: guildConf.prefixes,
        });
    }
});

// Modlog

Router.post("/settings/:ID/main/modlog", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);
    if (req.body.modlogChannel) {
        if (req.guild.channels.cache.get(req.body.modlogChannel) && req.body.modlogChannel === "Brak") {
            res.json({
                alert: {
                    color: "green",
                    message: "Zapisano ustawienia",
                    type: "alert-success",
                },
                success: true,
                code: 200,
            });
            await guildConf.update({
                modlog: {
                    channel: req.body.modlogChannel === "Brak" ? null : req.guild.channels.cache.get(req.body.modlogChannel).id,
                },
            });
        }
    }

    if (typeof req.body.status === "boolean") {
        const status = req.body.status;
        await guildConf.update({
            modlog: {
                status: status,
            },
        });
    }
    res.json({
        alert: {
            color: "green",
            message: "Zapisano ustawienia",
            type: "alert-success",
        },
        success: true,
        code: 200,
    });
});

// Muted

Router.post("/settings/:ID/main/muted", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);
    if (req.body.mutedRole) {
        if (!req.guild.roles.cache.get(req.body.mutedRole) && req.body.mutedRole !== "Brak") {
            res.json({
                alert: {
                    color: "red",
                    message: "Nie znaleziono takiej roli",
                    type: "alert-danger",
                },
                success: false,
                code: 400,
            });
        } else {
            res.json({
                alert: {
                    color: "green",
                    message: "Zapisano ustawienia",
                    type: "alert-success",
                },
                success: true,
                code: 200,
            });

            guildConf.update({
                mutedRole: req.body.mutedRole === "Brak" ? null : req.body.mutedRole,
            });
        }
    }
});

// MutedAuto

Router.post("/settings/:ID/main/muted/auto", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);
    if (guildConf.mutedRole && req.guild.roles.cache.get(guildConf.mutedRole)) {
        const role = req.guild.roles.cache.get(guildConf.mutedRole);
        req.guild.channels.cache.forEach(channel => {
            channel.updateOverwrite(role, {
                SEND_MESSAGES: false,
                SPEAK: false,
                ADD_REACTIONS: false,
            }).catch(() => null);
        });
        if (role) await guildConf.update({ mutedRole: role.id });
    } else {
        req.guild.roles.create({
            data: {
                name: "Wyciszony",
                color: "#ff1100",
                permissions: [],
            },
        }).then(async role => {
            req.guild.channels.cache.forEach(async channel => {
                channel.updateOverwrite(role, {
                    SEND_MESSAGES: false,
                    SPEAK: false,
                    ADD_REACTIONS: false,
                }).catch(() => null);
                if (!role) await guildConf.update({ mutedRole: null });
                if (role) await guildConf.update({ mutedRole: role.id });
            });
        }).catch(() => null);
    }
    res.json({
        alert: {
            color: "green",
            message: "Skonfigurowano",
            type: "alert-success",
        },
        success: true,
        code: 200,
    });
});

// Welcome

Router.post("/settings/:ID/welcome", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);
    if (req.body.channel) {
        if (!req.guild.channels.cache.get(req.body.channel) && req.body.channel !== "Brak") {
            return res.json({
                alert: {
                    color: "red",
                    message: "Nie znaleziono kanału",
                    type: "alert-danger",
                },
                success: false,
                code: 400,
            });
        } else {
            await guildConf.update({
                welcome: {
                    channel: req.body.channel === "Brak" ? null : req.guild.channels.cache.get(req.body.channel).id,
                },
            });
        }
    }

    if (req.body.color) {
        await guildConf.update({
            welcome: {
                color: req.body.color,
            },
        });
    }

    if (req.body.message) {
        if (req.body.message > 2048) {
            return res.json({
                alert: {
                    color: "red",
                    message: "Wiadomość jest zbyt długa",
                    type: "alert-danger",
                },
                success: false,
                code: 400,
            });
        } else {
            await guildConf.update({
                welcome: {
                    message: req.body.message,
                },
            });
        }
    }

    if (req.body.title) {
        if (req.body.title > 256) {
            return res.json({
                alert: {
                    color: "red",
                    message: "Tytuł jest zbyt duży",
                    type: "alert-danger",
                },
                success: false,
                code: 400,
            });
        } else {
            await guildConf.update({
                welcome: {
                    title: req.body.title,
                },
            });
        }
    }

    if (typeof req.body.status === "boolean") {
        const status = req.body.status;
        await guildConf.update({
            welcome: {
                status: status,
            },
        });
    }
    return res.json({
        alert: {
            color: "green",
            message: "Zapisano ustawienia",
            type: "alert-success",
        },
        success: true,
        code: 200,
    });
});

// Goodbye

Router.post("/settings/:ID/goodbye", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);
    if (req.body.channel) {
        if (!req.guild.channels.cache.get(req.body.channel) && req.body.channel !== "Brak") {
            return res.json({
                alert: {
                    color: "red",
                    message: "Nie znaleziono kanału",
                    type: "alert-danger",
                },
                success: false,
                code: 400,
            });
        } else {
            await guildConf.update({
                goodbye: {
                    channel: req.body.channel === "Brak" ? null : req.guild.channels.cache.get(req.body.channel).id,
                },
            });
        }
    }

    if (req.body.color) {
        await guildConf.update({
            goodbye: {
                color: req.body.color,
            },
        });
    }

    if (req.body.message) {
        if (req.body.message > 2048) {
            return res.json({
                alert: {
                    color: "red",
                    message: "Wiadomość jest zbyt długa",
                    type: "alert-danger",
                },
                success: false,
                code: 400,
            });
        } else {
            await guildConf.update({
                goodbye: {
                    message: req.body.message,
                },
            });
        }
    }

    if (req.body.title) {
        if (req.body.title > 256) {
            return res.json({
                alert: {
                    color: "red",
                    message: "Tytuł jest zbyt duży",
                    type: "alert-danger",
                },
                success: false,
                code: 400,
            });
        } else {
            await guildConf.update({
                goodbye: {
                    title: req.body.title,
                },
            });
        }
    }

    if (typeof req.body.status === "boolean") {
        const status = req.body.status;
        await guildConf.update({
            goodbye: {
                status: status,
            },
        });
    }
    return res.json({
        alert: {
            color: "green",
            message: "Zapisano ustawienia",
            type: "alert-success",
        },
        success: true,
        code: 200,
    });
});

// Colors

Router.post("/settings/:ID/colors", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);

    guildConf.update({
        colors: {
            done: req.body.done || "#000000",
            error: req.body.error || "#000000",
        },
    });

    res.json({
        alert: {
            color: "green",
            message: "Zapisano ustawienia",
            type: "alert-success",
        },
        success: true,
        code: 200,
    });
});

// Permissions Add

Router.post("/settings/:ID/permissions/add", checkAuth, checkGuild, async (req, res) => {
    const settings = await client.database.servers.get(req.guild.id);
    const perms = { Administrator: true, Moderator: true, Pomocnik: true };
    if (!req.body.role && !req.guild.roles.cache.get(req.body.role) && !perms[req.body.permission]) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie znaleziono takiej permisji",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else if (settings.permissions.roles.find(x => x.roleid === req.body.role)) {
        return res.json({
            alert: {
                color: "red",
                message: "Ta rola już ma permisje",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else {
        settings.permissions.roles.push({
            roleid: req.body.role,
            perm: req.body.permission,
        });
        settings.update({ permissions: settings.permissions });
        res.json({
            alert: {
                color: "green",
                message: "Dodano permisje",
                type: "alert-success",
            },
            data: {
                roleName: req.guild.roles.cache.get(req.body.role)?.name,
            },
            success: true,
            code: 200,
        });
    }
});

// Permissions Remove


Router.post("/settings/:ID/permissions/remove", checkAuth, checkGuild, async (req, res) => {
    const settings = await client.database.servers.get(req.guild.id);
    const perm = settings.permissions.roles.find(x => x.roleid === req.body.roleid);
    if (!perm) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie znaleziono takiej permisji",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else {
        res.json({
            alert: {
                color: "green",
                message: "Usunięto permisje",
                type: "alert-success",
            },
            success: true,
            code: 200,
        });
        settings.permissions.roles.deleteOne(perm);
        settings.update({ permissions: settings.permissions });
    }
});

// Proposals Channels Add


Router.post("/settings/:ID/proposals/channels/add", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);
    const channel = req.body?.channel;

    if (!channel) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie podano kanału",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else if (guildConf.proposals.channels.includes(channel)) {
        return res.json({
            alert: {
                color: "red",
                message: "Posiadasz już taki kanał",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else if (!req.guild.channels.cache.get(channel)) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie znaleziono kanału",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else {
        res.json({
            alert: {
                color: "green",
                message: "Dodano kanał",
                type: "alert-success",
            },
            success: true,
            code: 200,
            data: {
                channelName: req.guild.channels.cache.get(channel)?.name,
            },
        });
        await guildConf.proposals.channels.push(channel);
        await guildConf.update({
            proposals: {
                channels: guildConf.proposals.channels,
            },
        });
    }
});

// Proposals Channels Remove

Router.post("/settings/:ID/proposals/channels/remove", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);
    const channel = req.body?.channel;

    if (!channel) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie podano kanału",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else if (!guildConf.proposals.channels.includes(channel)) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie posiadasz takiego kanału",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else {
        res.json({
            alert: {
                color: "green",
                message: "Kanał został usunięty",
                type: "alert-success",
            },
            success: true,
            code: 200,
        });
        await guildConf.proposals.channels.deleteOne(channel);
        await guildConf.update({
            proposals: {
                channels: guildConf.proposals.channels,
            },
        });
    }
});

// Proposals Settings

Router.post("/settings/:ID/proposals/", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);
    if (req.body.comment) {
        await guildConf.update({
            proposals: {
                comment: req.body.comment,
            },
        });
    }

    if (typeof req.body.status === "boolean") {
        const status = req.body.status;
        await guildConf.update({
            proposals: {
                status: status,
            },
        });
    }

    res.json({
        alert: {
            color: "green",
            message: "Zapisano ustawienia",
            type: "alert-success",
        },
        success: true,
        code: 200,
    });

});

// Antyinvite Channels Add

Router.post("/settings/:ID/antyinvite/channels/add", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);
    const channel = req.body?.channel;

    if (!channel) {
        req.user.alert = {
            color: "red",
            message: "Nie podano prefixu",
            type: "alert-danger",
        };
    } else if (guildConf.antyinvite.channels.includes(channel)) {
        req.user.alert = {
            color: "red",
            message: "Posiadasz już taki kanał",
            type: "alert-danger",
        };
    } else if (!req.guild.channels.cache.get(channel)) {
        req.user.alert = {
            color: "red",
            message: "Nie znaleziono takiego kanału",
            type: "alert-danger",
        };
    } else {
        req.user.alert = {
            color: "green",
            message: "Dodano kanał",
            type: "alert-success",
        };
        await guildConf.antyinvite.channels.push(channel);
        await guildConf.update({
            antyinvite: {
                channels: guildConf.antyinvite.channels,
            },
        });
    }
    res.redirect(
        `/dashboard/${req.params.ID}/antyinvite#antyinviteChannelsList`);
});

// Antyinvite Channels Remove

Router.post("/settings/:ID/antyinvite/channels/remove", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);
    const channel = req.body?.channel;

    if (!channel) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie podano kanału",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else if (!guildConf.antyinvite.channels.includes(channel)) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie posiadasz takiego kanału",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else {
        res.json({
            alert: {
                color: "green",
                message: "Usunięto kanał",
                type: "alert-success",
            },
            success: true,
            code: 200,
        });
        await guildConf.antyinvite.channels.deleteOne(channel);
        await guildConf.update({
            antyinvite: {
                channels: guildConf.antyinvite.channels,
            },
        });
    }
});

// Antyinvite Roles Add


Router.post("/settings/:ID/antyinvite/roles/add", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);
    const role = req.body?.role;

    if (!role) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie podano roli",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else if (guildConf.antyinvite.roles.includes(role)) {
        return res.json({
            alert: {
                color: "red",
                message: "Już posiadasz taką role",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else if (!req.guild.roles.cache.get(role)) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie znaleziono roli",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else {
        res.json({
            alert: {
                color: "green",
                message: "Dodano role",
                type: "alert-success",
            },
            data: {
                roleName: req.guild.roles.cache.get(role)?.name,
            },
            success: true,
            code: 200,
        });
        await guildConf.antyinvite.roles.push(role);
        await guildConf.update({
            antyinvite: {
                roles: guildConf.antyinvite.roles,
            },
        });
    }
});

// Antyinvite Roles Remove


Router.post("/settings/:ID/antyinvite/roles/remove", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);
    const role = req.body?.role;

    if (!role) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie posiadasz kanału",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else if (!guildConf.antyinvite.roles.includes(role)) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie posiadasz takiej roli",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else {
        res.json({
            alert: {
                color: "green",
                message: "Usunięto role",
                type: "alert-success",
            },
            success: true,
            code: 200,
        });
        await guildConf.antyinvite.roles.deleteOne(role);
        await guildConf.update({
            antyinvite: {
                roles: guildConf.antyinvite.roles,
            },
        });
    }
});

// Antyinvite


Router.post("/settings/:ID/antyinvite", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);

    if (typeof req.body.status === "boolean") {
        const status = req.body.status;
        await guildConf.update({
            antyinvite: {
                status: status,
            },
        });
    }

    res.json({
        alert: {
            color: "green",
            message: "Zapisano ustawienia",
            type: "alert-success",
        },
        success: true,
        code: 200,
    });
});

// Autoresponders Add

Router.post("/settings/:ID/autoresponders/add", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);

    if (!req.body.msg) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie podano wiadomości",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else if (!req.body.reply) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie znaleziono takiego odpowiedzi",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else if (guildConf.autoresponders.find(x => x.msg.toLowerCase() === req.body?.msg?.trim().toLowerCase())) {
        return res.json({
            alert: {
                color: "red",
                message: "Autoresponder o tej wiadomoścni już istnieje",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else {
        const arid = guildConf.autoresponders.length + 1;

        guildConf.autoresponders.push({
            id: arid,
            msg: req.body.msg,
            reply: req.body.reply,
        });

        await guildConf.update({
            autoresponders: guildConf.autoresponders,
        });
        res.json({
            alert: {
                color: "green",
                message: "Dodano autoresponder",
                type: "alert-success",
            },
            data: {
                id: arid,
            },
            success: true,
            code: 200,
        });
    }
});

// Autoresponders Remove

Router.post("/settings/:ID/autoresponders/remove", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);

    const id = parseInt(req.body.ar);

    const ar = guildConf.autoresponders.find(x => x.id === id);
    if (!ar) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie znaleziono takiego autorespondera",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else {
        guildConf.autoresponders.deleteOne(ar);
        await guildConf.update({
            autoresponders: guildConf.autoresponders,
        });

        res.json({
            alert: {
                color: "green",
                message: "Usunięto autoresponder",
                type: "alert-success",
            },
            success: true,
            code: 200,
        });
    }
});

// Embed wip

Router.post("/settings/:ID/embed/", checkAuth, checkGuild, async (req, res) => {
    const channel = req.guild.channels.cache.get(req.body.channel);
    if (!channel) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie podano kanału",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    }

    const title = req.body.title;

    if (!title || title.length > 256) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie podano tytułu lub jest on zbyt długi",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    }

    const desc = req.body.description;

    if (!desc || desc.length > 2048) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie podano opisu lub jest on zbyt długi",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    }

    if (req.body.webhookAvatarURL) {
        if (!req.body.webhookAvatarURL.includes(".png") && !req.body.webhookAvatarURL.includes(".jpg") && !req.body.webhookAvatarURL.includes(".jpeg")) {
            return res.json({
                alert: {
                    color: "red",
                    message: "Podano niepoprawny link do avataru webhooka",
                    type: "alert-danger",
                },
                success: false,
                code: 400,
            });
        }
    }


    await client.events.get("webhookInit").run(req.guild, channel);

    await req.guild.webhook.setChannel(channel);

    const embed = new client.Embed()
        .setColor(req.body.color)
        .setTitle(title)
        .setDescription(desc);

    await req.guild.webhook.send({
        username: req.body.webhookName || req.member.user.tag,
        avatarURL: req.body.webhookAvatarURL || req.member.user.displayAvatarURL({ format: "png" }),
        embeds: [embed],
    });

    res.json({
        alert: {
            color: "green",
            message: "Wysłano wiadomośc embed",
            type: "alert-success",
        },
        success: true,
        code: 200,
    });
});

Router.post("/settings/:ID/leveling/roles/add", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);
    const level = parseInt(req.body?.level);
    const role = req.body?.role;
    if (!role || !level) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie podano roli lub poziomu",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else if (guildConf.leveling.roles.find(x => x.level === level)) {
        return res.json({
            alert: {
                color: "red",
                message: "Już posiadasz taki poziom",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else if (!req.guild.roles.cache.get(role)) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie znaleziono roli",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else {
        res.json({
            alert: {
                color: "green",
                message: "Dodano role",
                type: "alert-success",
            },
            data: {
                roleName: req.guild.roles.cache.get(role)?.name,
            },
            success: true,
            code: 200,
        });
        await guildConf.leveling.roles.push({
            roleid: role,
            level,
        });
        await guildConf.update({
            leveling: {
                roles: guildConf.leveling.roles,
            },
        });
    }
});

// Antyinvite Roles Remove


Router.post("/settings/:ID/leveling/roles/remove", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);
    const level = parseInt(req.body?.level);

    if (!level) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie podano poziomu",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else if (!guildConf.leveling.roles.find(x => x.level === level)) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie posiadasz takiej roli",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else {
        res.json({
            alert: {
                color: "green",
                message: "Usunięto role",
                type: "alert-success",
            },
            success: true,
            code: 200,
        });
        await guildConf.leveling.roles.deleteOne(guildConf.leveling.roles.find(x => x.level === level));
        await guildConf.update({
            leveling: {
                roles: guildConf.leveling.roles,
            },
        });
    }
});

// Antyinvite


Router.post("/settings/:ID/leveling/", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);

    if (typeof req.body.status === "boolean") {
        const status = req.body.status;
        await guildConf.update({
            leveling: {
                status: status,
            },
        });
    }

    const message = req.body.message;

    if (typeof message?.text === "string") {
        await guildConf.update({
            leveling: {
                message: {
                    text: message.text,
                },
            },
        });
    }
    if (typeof message?.embed === "boolean") {
        await guildConf.update({
            leveling: {
                message: {
                    embed: message.embed,
                },
            },
        });
    }

    if (parseInt(req.body.xp)) {
        await guildConf.update({
            leveling: {
                xpNeeded: parseInt(req.body.xp),
            },
        });
    }

    res.json({
        alert: {
            color: "green",
            message: "Zapisano ustawienia",
            type: "alert-success",
        },
        success: true,
        code: 200,
    });
});

Router.post("/settings/:ID/autorole/roles/add", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);
    const role = req.body?.role;

    if (!role) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie podano roli",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else if (guildConf.autorole.roles.includes(role)) {
        return res.json({
            alert: {
                color: "red",
                message: "Już posiadasz taką role",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else if (!req.guild.roles.cache.get(role)) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie znaleziono roli",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else {
        res.json({
            alert: {
                color: "green",
                message: "Dodano role",
                type: "alert-success",
            },
            data: {
                roleName: req.guild.roles.cache.get(role)?.name,
            },
            success: true,
            code: 200,
        });
        await guildConf.autorole.roles.push(role);
        await guildConf.update({
            autorole: {
                roles: guildConf.autorole.roles,
            },
        });
    }
});

// autorole Roles Remove


Router.post("/settings/:ID/autorole/roles/remove", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);
    const role = req.body?.role;

    if (!role) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie podano roli",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else if (!guildConf.autorole.roles.includes(role)) {
        return res.json({
            alert: {
                color: "red",
                message: "Nie posiadasz takiej roli",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else {
        res.json({
            alert: {
                color: "green",
                message: "Usunięto role",
                type: "alert-success",
            },
            success: true,
            code: 200,
        });
        await guildConf.autorole.roles.deleteOne(role);
        await guildConf.update({
            autorole: {
                roles: guildConf.autorole.roles,
            },
        });
    }
});

// autorole


Router.post("/settings/:ID/autorole", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);

    if (typeof req.body.status === "boolean") {
        const status = req.body.status;
        await guildConf.update({
            autorole: {
                status: status,
            },
        });
    }

    res.json({
        alert: {
            color: "green",
            message: "Zapisano ustawienia",
            type: "alert-success",
        },
        success: true,
        code: 200,
    });
});

Router.post("/settings/:ID/broadcast", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);

    if (typeof req.body.status === "boolean") {
        guildConf.update({
            broadcast: { status: req.body.status },
        });
    }

    if (req.body.color) {
        guildConf.update({
            broadcast: { color: req.body.color },
        });
    }

    const channel = req.guild.channels.cache.get(req.body.channel);
    if (!channel && req.body.channel !== "Brak") {
        return res.json({
            alert: {
                color: "red",
                message: "Nie podano kanału",
                type: "alert-danger",
            },
            success: false,
            code: 400,
        });
    } else {
        guildConf.update({
            broadcast: {
                channel: req.body.channel === "Brak" ? null : channel.id,
            },
        });
    }


    res.json({
        alert: {
            color: "green",
            message: "Zapisano ustawienia",
            type: "alert-success",
        },
        success: true,
        code: 200,
    });
});

Router.post("/settings/:ID/snipe", checkAuth, checkGuild, async (req, res) => {
    const guildConf = await client.database.servers.get(req.guild.id);

    if (typeof req.body.status === "boolean") {
        guildConf.update({
            snipe: { status: req.body.status },
        });
    }

    res.json({
        alert: {
            color: "green",
            message: "Zapisano ustawienia",
            type: "alert-success",
        },
        success: true,
        code: 200,
    });
});


// Router.get("/github", (req, res) => {
//     const token = client.config.tokens.github;
//     if (!req.query?.auth || req.query.auth !== token) return res.status(401).json({
//         status: 401,
//         message: "Unathorized",
//     });
//     console.log(req.body);
// });

module.exports = Router;

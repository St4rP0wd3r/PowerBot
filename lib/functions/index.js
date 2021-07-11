const fetch = require("node-fetch");
const { WebhookClient } = require("discord.js-light");

module.exports = new class Functions {
    async getJsonFromApi(url) {
        return await (await fetch(url)).json();
    }

    async postWebhook(url, opts) {
        new WebhookClient(url.split("/")[5], url.split("/")[6])?.send(opts.content || "", {
            files: opts.files || [],
            embeds: opts.embeds || [],
        });
    }

    async postJsonToApi(url, body) {
        return await (await fetch(url, {
            method: "POST",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
        }));
    }

    async getUser(message, args) {
        if (!args?.length) return null;
        return await this._fetchUser(this.parseMention(args)) || client.users.cache.find(x => x.username === args) || this._fetchUser(this.parseMention(args));
    }

    async getMember(message, args) {
        return await this._fetchGuildUser(message.guild, args) || message.guild.members.cache.find(x => x.user.username === args) || await this._fetchGuildUser(message.guild, this.parseMention(args));
    }

    async _fetchGuildUser(guild, id) {
        return guild.members.cache.get(id) || await guild.members.fetch(id).catch(() => null);
    }

    async _fetchUser(ID) {
        return client.users.cache.get(ID) || client.users.fetch(ID).catch(() => null);
    }

    parseMention(mention) {
        mention = mention.replace(/ /g, "");
        mention = mention.replace(/^\D+/g, "");
        if (mention.endsWith(">")) mention = mention.slice(0, -1);
        return mention;
    }

    async getUserPerms(message) {
        const member = message.member;
        const settings = await client.database.servers.get(message.guild.id);
        if (!member) return 1;
        let number = 1;
        if (client.config.perms.developer.includes(member.id)) return 6;
        if (member.hasPermission("MANAGE_MESSAGES") || member.hasPermission("KICK_MEMBERS") || message.member.roles.cache.some(r => !!settings.permissions?.roles?.find(x => x.roleid === r.id && x.perm === "Pomocnik"))) number++;
        if (member.hasPermission("BAN_MEMBERS") || message.member.roles.cache.some(r => !!settings.permissions?.roles?.find(x => x.roleid === r.id && x.perm === "Moderator"))) number++;
        if (member.hasPermission("ADMINISTRATOR") || message.member.roles.cache.some(r => !!settings.permissions?.roles?.find(x => x.roleid === r.id && x.perm === "Administrator"))) number++;
        if (member.id === member.guild.ownerID) number++;
        return number;
    }

    formatSizeUnits(bytes) {
        if (bytes >= 1073741824) bytes = (bytes / 1073741824).toFixed(2) + " GB";
        else if (bytes >= 1048576) bytes = (bytes / 1048576).toFixed(2) + " MB";
        else if (bytes >= 1024) bytes = (bytes / 1024).toFixed(2) + " KB";
        else if (bytes > 1) bytes = bytes + " B";
        else if (bytes === 1) bytes = bytes + " B";
        else bytes = "0 B";

        return bytes;
    }

    removeUndefineds(obj) {
        if (obj === undefined) return null;
        if (typeof obj === "object") for (const key in obj) if (obj.hasOwnProperty(key)) obj[key] = this.removeUndefineds(obj[key]);
        return obj;
    };

    async getWinners(message, reactionProvided, winnerCount) {
        const guild = message.guild;
        const reactions = message.reactions.cache;
        const reaction = reactions.get(reactionProvided) || reactions.find((r) => r.emoji.name === reactionProvided);
        if (!reaction) return [];
        const users = (await reaction.users.fetch({ cache: false })).filter((u) => !u.bot);
        const rolledWinners = users.random(winnerCount);
        const winners = [];

        for (const u of rolledWinners) {
            const isValidEntry = !winners?.some((winner) => winner?.id === u?.id);
            if (isValidEntry) winners?.push(u);
            else {
                for (const user of users.array()) {
                    const alreadyRolled = winners?.some((winner) => winner?.id === user?.id);
                    if (alreadyRolled || !user) continue;
                    winners?.push(user);
                    break;
                }
            }
        }
        return winners.map((user) => guild.member(user) || user);
    }

    get errors() {
        return require("./errors");
    }

};

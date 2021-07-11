const nodeFetch = require("node-fetch");

const { fetchChannelPermissions, fetchTextChannelData, fetchVoiceChannelData } = require("./util");

exports.getBans = async function getBans(guild) {
    const bans = [];
    const cases = await guild.fetchBans();
    cases.forEach((ban) => {
        bans.push({
            id: ban.user.id,
            reason: ban.reason,
        });
    });
    return bans;
};

exports.getRoles = async function getRoles(guild) {
    const roles = [];
    guild.roles.cache
        .filter((role) => !role.managed)
        .sort((a, b) => b.position - a.position)
        .forEach((role) => {
            const roleData = {
                name: role.name,
                color: role.hexColor,
                hoist: role.hoist,
                permissions: role.permissions.bitfield,
                mentionable: role.mentionable,
                position: role.position,
                isEveryone: guild.id === role.id,
            };
            roles.push(roleData);
        });
    return roles;
};

exports.getEmojis = async function getEmojis(guild, options) {
    const emojis = [];
    guild.emojis.cache.forEach(async (emoji) => {
        const eData = {
            name: emoji.name,
        };
        eData.base64 = (await nodeFetch(emoji.url).then((res) => res.buffer())).toString("base64");
        emojis.push(eData);
    });
    return emojis;
};

exports.getChannels = async function getChannels(guild, options) {
    return new Promise(async (resolve) => {
        const channels = {
            categories: [],
            others: [],
        };
        const categories = guild.channels.cache
            .filter((ch) => ch.type === "category")
            .sort((a, b) => a.position - b.position)
            .array();
        for (const category of categories) {
            const categoryData = {
                name: category.name,
                permissions: fetchChannelPermissions(category),
                children: [],
            };
            const children = category.children.sort((a, b) => a.position - b.position).array();
            for (const child of children) {
                if (child.type === "text" || child.type === "news") {
                    const channelData = await fetchTextChannelData(child);
                    categoryData.children.push(channelData);
                } else {
                    const channelData = await fetchVoiceChannelData(child);
                    categoryData.children.push(channelData);
                }
            }
            channels.categories.push(categoryData);
        }

        const others = guild.channels.cache
            .filter((ch) => !ch.parent && ch.type !== "category")
            .sort((a, b) => a.position - b.position)
            .array();
        for (const channel of others) {
            if (channel.type === "text") {
                const channelData = await fetchTextChannelData(channel);
                channels.others.push(channelData);
            } else {
                const channelData = await fetchVoiceChannelData(channel);
                channels.others.push(channelData);
                t;
            }
        }
        resolve(channels);
    });
};
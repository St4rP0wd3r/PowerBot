const { loadCategory, loadChannel } = require("./util");

exports.loadConfig = (guild, backupData) => {
    const configPromises = [];
    if (backupData.name) configPromises.push(guild.setName(backupData.name));

    if (backupData.iconBase64) configPromises.push(guild.setIcon(Buffer.from(backupData.iconBase64, "base64")));
    else if (backupData.iconURL) configPromises.push(guild.setIcon(backupData.iconURL));

    if (backupData.splashBase64) {
        configPromises.push(guild.setSplash(Buffer.from(backupData.splashBase64, "base64")));
    } else if (backupData.splashURL) {
        configPromises.push(guild.setSplash(backupData.splashURL));
    }
    if (backupData.bannerBase64) {
        configPromises.push(guild.setBanner(Buffer.from(backupData.bannerBase64, "base64")));
    } else if (backupData.bannerURL) {
        configPromises.push(guild.setBanner(backupData.bannerURL));
    }
    if (backupData.region) {
        configPromises.push(guild.setRegion(backupData.region));
    }
    if (backupData.verificationLevel) {
        configPromises.push(guild.setVerificationLevel(backupData.verificationLevel));
    }
    if (backupData.defaultMessageNotifications) {
        configPromises.push(guild.setDefaultMessageNotifications(backupData.defaultMessageNotifications));
    }
    const changeableExplicitLevel = guild.features.includes("COMMUNITY");
    if (backupData.explicitContentFilter && changeableExplicitLevel) {
        configPromises.push(guild.setExplicitContentFilter(backupData.explicitContentFilter));
    }
    return Promise.all(configPromises);
};

/**
 * Restore the guild roles
 */
exports.loadRoles = (guild, backupData) => {
    const rolePromises = [];
    backupData.roles.forEach((roleData) => {
        if (roleData.isEveryone) {
            rolePromises.push(
                guild.roles.cache.get(guild.id).edit({
                    name: roleData.name,
                    color: roleData.color,
                    permissions: roleData.permissions,
                    mentionable: roleData.mentionable,
                }),
            );
        } else {
            rolePromises.push(
                guild.roles.create({
                    data: {
                        name: roleData.name,
                        color: roleData.color,
                        hoist: roleData.hoist,
                        permissions: roleData.permissions,
                        mentionable: roleData.mentionable,
                    },
                }),
            );
        }
    });
    return Promise.all(rolePromises);
};
exports.loadChannels = (guild, backupData, options) => {
    const loadChannelPromises = [];
    backupData.channels.categories.forEach((categoryData) => {
        loadChannelPromises.push(
            new Promise((resolve) => {
                loadCategory(categoryData, guild).then((createdCategory) => {
                    categoryData.children.forEach((channelData) => {
                        loadChannel(channelData, guild, createdCategory, options);
                        resolve(true);
                    });
                });
            }),
        );
    });
    backupData.channels.others.forEach((channelData) => {
        loadChannelPromises.push(loadChannel(channelData, guild, null, options));
    });
    return Promise.all(loadChannelPromises);
};
exports.loadAFK = (guild, backupData) => {
    const afkPromises = [];
    if (backupData.afk) {
        afkPromises.push(guild.setAFKChannel(guild.channels.cache.find((ch) => ch.name === backupData.afk.name)));
        afkPromises.push(guild.setAFKTimeout(backupData.afk.timeout));
    }
    return Promise.all(afkPromises);
}
;

/**
 * Restore guild emojis
 */
exports.loadEmojis = (guild, backupData) => {
    const emojiPromises = [];
    backupData.emojis.forEach((emoji) => {
        if (emoji.url) {
            emojiPromises.push(guild.emojis.create(emoji.url, emoji.name));
        } else if (emoji.base64) {
            emojiPromises.push(guild.emojis.create(Buffer.from(emoji.base64, "base64"), emoji.name));
        }
    });
    return Promise.all(emojiPromises);
}
;

exports.loadBans = (guild, backupData) => {
    const banPromises = [];
    backupData.bans.forEach((ban) => {
        banPromises.push(
            guild.members.ban(ban.id, {
                reason: ban.reason,
            }),
        );
    });
    return Promise.all(banPromises);
};

exports.loadEmbedChannel = (guild, backupData) => {
    const embedChannelPromises = [];
    if (backupData.widget.channel) {
        embedChannelPromises.push(
            guild.setWidget({
                enabled: backupData.widget.enabled,
                channel: guild.channels.cache.find((ch) => ch.name === backupData.widget.channel),
            }),
        );
    }
    return Promise.all(embedChannelPromises);
};
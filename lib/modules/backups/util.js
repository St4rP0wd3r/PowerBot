exports.fetchChannelPermissions = function fetchChannelPermissions(channel) {
    const permissions = [];
    channel.permissionOverwrites
        .filter((p) => p.type === "role")
        .forEach((perm) => {
            const role = channel.guild.roles.cache.get(perm.id);
            if (role) {
                permissions.push({
                    roleName: role.name,
                    allow: perm.allow.bitfield,
                    deny: perm.deny.bitfield,
                });
            }
        });
    return permissions;
};


exports.fetchVoiceChannelData = async function fetchVoiceChannelData(channel) {
    return new Promise(async (resolve) => {
        const channelData = {
            type: "voice",
            name: channel.name,
            bitrate: channel.bitrate,
            userLimit: channel.userLimit,
            parent: channel.parent ? channel.parent.name : null,
            permissions: exports.fetchChannelPermissions(channel),
        };
        resolve(channelData);
    });
};

exports.fetchTextChannelData = async function fetchTextChannelData(channel) {
    return new Promise(async (resolve) => {
        const channelData = {
            type: "text",
            name: channel.name,
            nsfw: channel.nsfw,
            rateLimitPerUser: channel.type === "text" ? channel.rateLimitPerUser : undefined,
            parent: channel.parent ? channel.parent.name : null,
            topic: channel.topic,
            permissions: exports.fetchChannelPermissions(channel),
            messages: [],
            isNews: channel.type === "news",
        };
        const messageCount = 0;
        const fetchOptions = { limit: 100 };
        let lastMessageId;
        let fetchComplete = false;
        try {
            while (!fetchComplete) {
                if (lastMessageId) fetchOptions.before = lastMessageId;

                const fetched = await channel.messages.fetch(fetchOptions);
                if (fetched.size === 0) break;
                lastMessageId = fetched.last().id;
                fetched.forEach((msg) => {
                    if (!msg.author || channelData.messages.length >= messageCount) {
                        fetchComplete = true;
                        return;
                    }
                    channelData.messages.push({
                        username: msg.author.username,
                        avatar: msg.author.displayAvatarURL(),
                        content: msg.cleanContent,
                        embeds: msg.embeds,
                        files: msg.attachments.map((a) => {
                            return {
                                name: a.name,
                                attachment: a.url,
                            };
                        }),
                        pinned: msg.pinned,
                    });
                });
            }
            resolve(channelData);
        } catch {
            resolve(channelData);
        }
    });
};

exports.loadCategory = async function loadCategory(categoryData, guild) {
    return new Promise((resolve) => {
        guild.channels.create(categoryData.name, { type: "category" }).then(async (category) => {
            const finalPermissions = [];
            categoryData.permissions.forEach((perm) => {
                const role = guild.roles.cache.find((r) => r.name === perm.roleName);
                if (role) {
                    finalPermissions.push({
                        id: role.id,
                        allow: perm.allow,
                        deny: perm.deny,
                    });
                }
            });
            await category.overwritePermissions(finalPermissions);
            resolve(category);
        });
    });
};


exports.loadChannel = async function loadChannel(channelData, guild, category) {
    return new Promise(async (resolve) => {
        const createOptions = {
            type: null,
            parent: category,
        };
        if (channelData.type === "text") {
            createOptions.topic = channelData.topic;
            createOptions.nsfw = channelData.nsfw;
            createOptions.rateLimitPerUser = channelData.rateLimitPerUser;
            createOptions.type = channelData.isNews && guild.features.includes("NEWS") ? "news" : "text";
        } else if (channelData.type === "voice") {
            const maxBitrate = [64000, 128000, 256000, 384000];
            let bitrate = channelData.bitrate;
            while (bitrate > maxBitrate[guild.premiumTier]) {
                bitrate = maxBitrate[maxBitrate.indexOf(guild.premiumTier) - 1];
            }
            createOptions.bitrate = bitrate;
            createOptions.userLimit = channelData.userLimit;
            createOptions.type = "voice";
        }
        guild.channels.create(channelData.name, createOptions).then(async (channel) => {
            /* Update channel permissions */
            const finalPermissions = [];
            channelData.permissions.forEach((perm) => {
                const role = guild.roles.cache.find((r) => r.name === perm.roleName);
                if (role) {
                    finalPermissions.push({
                        id: role.id,
                        allow: perm.allow,
                        deny: perm.deny,
                    });
                }
            });
            await channel.overwritePermissions(finalPermissions);

            resolve(channel);

        });
    });
};

exports.clearGuild = async function clearGuild(guild) {
    guild.roles.cache
        .filter((role) => !role.managed && role.editable && role.id !== guild.id)
        .forEach((role) => {
            role.delete().cartch(() => null)
        });
    guild.channels.cache.forEach((channel) => {
        channel.delete().catch(() => null);
    });
    guild.emojis.cache.forEach((emoji) => {
        emoji.delete().catch(() => null);
    });
    const webhooks = await guild.fetchWebhooks();
    webhooks.forEach((webhook) => {
        webhook.delete().catch(() => null);
    });
    const bans = await guild.fetchBans();
    bans.forEach((ban) => {
        guild.members.unban(ban.user).catch(() => null);
    });
    const integrations = await guild.fetchIntegrations();
    integrations.forEach((integration) => {
        integration.delete();
    });
    guild.setAFKChannel(null);
    guild.setAFKTimeout(60 * 5);
    guild.setIcon(null);
    guild.setBanner(null).catch(() => {
    });
    guild.setSplash(null).catch(() => {
    });
    guild.setDefaultMessageNotifications("MENTIONS");
    guild.setWidget({
        enabled: false,
        channel: null,
    });
    if (!guild.features.includes("COMMUNITY")) {
        guild.setExplicitContentFilter("DISABLED");
        guild.setVerificationLevel("NONE");
    }
    guild.setSystemChannel(null);
    guild.setSystemChannelFlags(["WELCOME_MESSAGE_DISABLED", "BOOST_MESSAGE_DISABLED"]);
};
const createMaster = require("./create");
const loadMaster = require("./load");
const utilMaster = require("./util");
const SnowflakeUtil = require("discord.js-light").SnowflakeUtil;
const nodeFetch = require("node-fetch");
exports.create = async (guild, options = {
                            backupID: null,
                            maxMessagesPerChannel: 10,
                            jsonBeautify: true,
                            doNotBackup: [],
                            saveImages: "base64",
                        },
) => {
    return new Promise(async (resolve, reject) => {
            try {
                const backupData = {
                    name: guild.name,
                    region: guild.region,
                    verificationLevel: guild.verificationLevel,
                    explicitContentFilter: guild.explicitContentFilter,
                    defaultMessageNotifications: guild.defaultMessageNotifications,
                    afk: guild.afkChannel ? { name: guild.afkChannel.name, timeout: guild.afkTimeout } : null,
                    widget: {
                        enabled: guild.widgetEnabled,
                        channel: guild.widgetChannel ? guild.widgetChannel.name : null,
                    },
                    channels: { categories: [], others: [] },
                    roles: [],
                    bans: [],
                    emojis: [],
                    createdTimestamp: Date.now(),
                    guildID: guild.id,
                    id: options.backupID ?? SnowflakeUtil.generate(Date.now()),
                };
                if (guild.iconURL()) {
                    if (options && options.saveImages && options.saveImages === "base64") {
                        backupData.iconBase64 = (
                            await nodeFetch(guild.iconURL({ dynamic: true })).then((res) => res.buffer())
                        ).toString("base64");
                    }
                    backupData.iconURL = guild.iconURL({ dynamic: true });
                }
                if (guild.splashURL()) {
                    if (options && options.saveImages && options.saveImages === "base64") {
                        backupData.splashBase64 = (await nodeFetch(guild.splashURL()).then((res) => res.buffer())).toString(
                            "base64",
                        );
                    }
                    backupData.splashURL = guild.splashURL();
                }
                if (guild.bannerURL()) {
                    if (options && options.saveImages && options.saveImages === "base64") {
                        backupData.bannerBase64 = (await nodeFetch(guild.bannerURL()).then((res) => res.buffer())).toString(
                            "base64",
                        );
                    }
                    backupData.bannerURL = guild.bannerURL();
                }
                if (!options || !(options.doNotBackup || []).includes("bans"))
                    backupData.bans = await createMaster.getBans(guild);

                if (!options || !(options.doNotBackup || []).includes("roles"))
                    backupData.roles = await createMaster.getRoles(guild);

                if (!options || !(options.doNotBackup || []).includes("emojis")) {
                    backupData.emojis = await createMaster.getEmojis(guild, options);

                    if (!options || !(options.doNotBackup || []).includes("channels"))
                        backupData.channels = await createMaster.getChannels(guild, options);


                    resolve(backupData);
                }
            } catch (e) {
                return reject(e);
            }
        },
    );
};

exports.load = async (backup, guild,
                      options = {
                          clearGuildBeforeRestore: true,
                          maxMessagesPerChannel: 10,
                      },
) => {
    return new Promise(async (resolve, reject) => {
        if (!guild) return reject("Invalid guild");

        try {
            const backupData = backup;
            try {
                if (options.clearGuildBeforeRestore === undefined || options.clearGuildBeforeRestore) {
                    await utilMaster.clearGuild(guild);
                }
                await Promise.all([
                    loadMaster.loadConfig(guild, backupData),
                    loadMaster.loadRoles(guild, backupData),
                    loadMaster.loadChannels(guild, backupData, options),
                    loadMaster.loadAFK(guild, backupData),
                    loadMaster.loadEmojis(guild, backupData),
                    loadMaster.loadBans(guild, backupData),
                    loadMaster.loadEmbedChannel(guild, backupData),
                ]);
            } catch (e) {
                return reject(e);
            }
            return resolve(backupData);
        } catch (e) {
            return reject("No backup found");
        }
    });
}
;
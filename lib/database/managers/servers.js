const r = require("rethinkdb");
module.exports = class ServerManager {
    constructor(connection) {
        this.conn = connection;
    }

    async get(guildID) {
        const conn = this.conn;
        const settings = await r.table("Servers").get(guildID).run(this.conn) || await this.setDefault(guildID);

        for (const x of Object.keys(require("../../../data/database/defaults/settings"))) {
            if (!settings.hasOwnProperty(x)) {
                const nProp = require("../../../data/database/defaults/settings")[x];
                await r.table("Servers").get(guildID).update({ [x]: nProp }).run(conn);
                Object.assign(settings, { [x]: nProp });
            }
        }

        return new class ServerConfig {
            constructor() {
                Object.assign(this, settings);
            }

            async update(settings) {
                Object.assign(this, settings);
                return await r.table("Servers").get(guildID).update(settings).run(conn);
            }

            async toJSON() {
                return await r.table("Servers").get(guildID).run(conn);
            }
        };
    }

    async setDefault(guildID) {
        const defaultServerConfig = require("../../../data/database/defaults/settings.js");
        defaultServerConfig.id = guildID;
        await r.table("Servers").insert(defaultServerConfig).run(this.conn);
        return defaultServerConfig;
    };
};

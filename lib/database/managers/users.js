const r = require("rethinkdb");
module.exports = class ServerManager {
    constructor(connection) {
        this.conn = connection;
    }

    async get(userID) {
        const conn = this.conn;
        const settings = await r.table("Users").get(userID).run(this.conn) || await this.setDefault(userID);
        for (const x of Object.keys(require("../../../data/database/defaults/users"))) {
            if (!settings.hasOwnProperty(x)) {
                const nProp = require("../../../data/database/defaults/users")[x];
                await r.table("Users").get(userID).update({ [x]: nProp }).run(conn);
                Object.assign(settings, { [x]: nProp });
            }
        }


        return new class UsersConfig {
            constructor() {
                Object.assign(this, settings);
            }

            async update(settings) {
                Object.assign(this, settings);
                return await r.table("Users").get(userID).update(settings).run(conn);
            }
        };
    }

    async setDefault(userID) {
        const defaultUserConfig = require("../../../data/database/defaults/users.js");
        defaultUserConfig.id = userID;
        await r.table("Users").insert(defaultUserConfig).run(this.conn);
        return defaultUserConfig;
    };

    async list() {
        return await r.table("Users").coerceTo("array").run(this.conn);
    }
};

const r = require("rethinkdb");
module.exports = class MutesManager {
    constructor(connection) {
        this.conn = connection;
    }

    async add(guildID, userID) {
        await r.table("Mutes").insert({
            userid: userID,
            guildid: guildID,
            active: true,
        }).run(this.conn);
        return true;
    }

    async get(guildID, userID) {
        const conn = this.conn;

        const val = (await r.table("Mutes").getAll([guildID, userID], { index: "get" }).coerceTo("array").run(this.conn))[0]
        if (!val) return false;
        return new class Mute {
            constructor() {
                Object.assign(this, val);
            }

            async remove() {
                return await r.table("Mutes").get(this.id).delete().run(conn);
            }
        };
    }


};
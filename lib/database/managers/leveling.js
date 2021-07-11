const r = require("rethinkdb");
module.exports = class LevelingManager {
    constructor(connection) {
        this.conn = connection;
    }

    async get(guildID, userID) {
        const conn = this.conn;
        const info = (await r.table("Leveling").getAll([guildID, userID], { index: "get" }).coerceTo("array").run(this.conn))[0] || await this.setDefault(guildID, userID);
        return new class Level {
            constructor() {
                Object.assign(this, info);
            }

            async update(body) {
                return await r.table("Leveling").get(this.id).update(body).run(conn);
            }
        };
    }

    async setDefault(guildID, userID) {
        const inserted = await r.table("Leveling").insert({
            xp: 0,
            level: 0,
            userid: userID,
            guildid: guildID,
        }).run(this.conn);
        return {
            xp: 0,
            level: 0,
            userid: userID,
            guildid: guildID,
            id: inserted.generated_keys[0],
        };
    }

    async getAll(guildID) {
        return (await r.table("Leveling").getAll([guildID], { index: "getAll" }).orderBy(r.desc("level"), r.desc("xp")).limit(200).coerceTo("array").run(this.conn));
    }

};
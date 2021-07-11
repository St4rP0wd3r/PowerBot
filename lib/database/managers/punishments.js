const r = require("rethinkdb");
module.exports = class PunishmentsManager {
    constructor(connection) {
        this.conn = connection;
    }

    async get(guildID, ID) {
        const obj = (await r.table("Punishments").getAll([parseInt(ID), guildID], { index: "get" }).coerceTo("array").run(this.conn))[0];
        const conn = this.conn;

        return new class Punishment {
            constructor() {
                Object.assign(this, obj);
            }

            async remove() {
                await r.table("Punishments").get(this.id).update({
                    deleted: true,
                }).run(conn);
                return true;
            }

            async update(body) {
                await r.table("Punishments").get(this.id).update(body).run(conn);
                return true;
            }
        };
    }

    async list(guildID) {
        return await r.table("Punishments").getAll([guildID], { index: "getAll" }).coerceTo("array").run(this.conn);
    }

    async create(guildid, userid, {
        moderator,
        date,
        hide,
        reason,
        type,
    }) {
        const conn = this.conn;
        const caseid = (await this.list(guildid)).length + 1;
        const obj = {
            guildid: guildid,
            userid: userid,
            moderatorid: moderator,
            date: date,
            hide: hide,
            reason: reason,
            type: type,
            caseid: caseid,
            deleted: false,
        };
        r.table("Punishments").insert(obj).run(this.conn);

        return new class Punishments {
            constructor() {
                Object.assign(this, obj);
            }

            async remove() {
                await r.table("Punishments").get(this.id).update({
                    deleted: true,
                }).run(conn);
                return true;
            }

            async update(body) {
                await r.table("Punishments").get(this.id).update(body).run(conn);
                return true;
            }
        };
    }

    async history(guildID, userID) {
        return await r.table("Punishments").getAll([guildID, userID], { index: "history" }).orderBy(r.desc("caseid")).coerceTo("array").run(this.conn);
    }

};
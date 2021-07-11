const r = require("rethinkdb");

class Tempmutes {
    constructor(conn) {
        this.conn = conn;
    }

    async add(guildid, userid, {
        moderator,
        date,
        caseid,
    }) {
        await r.table("Tempmutes").insert({
            userid: userid,
            guildid: guildid,
            moderatorid: moderator,
            date: date,
            caseid: caseid,
        }).run(this.conn);
        return {
            userid: userid,
            guildid: guildid,
            moderatorid: moderator,
            date: date,
            caseid: caseid,
        };
    }

    async get(guildID, userID) {
        const tb = await r.table("Tempmutes").getAll([guildID, userID], { index: "get" }).coerceTo("array").run(this.conn);
        if (!tb[0]) return false;
        return new class Tempban {
            constructor() {
                Object.assign(this, tb);
            }

            async remove() {
                return await r.table("Tempmutes").get(tb[0].id).delete().run(this.conn);
            }
        };
    }

    async interval() {
        const conn = this.conn;
        const obj = [];
        const arr = await r.table("Tempmutes").between(1, Date.now(), { index: "endDate" }).coerceTo("array").run(this.conn);

        arr.forEach(tb => {
            obj.push(new class Tempban {
                constructor() {
                    Object.assign(this, tb);
                }

                async remove() {
                    return await r.table("Tempmutes").get(tb.id).delete().run(conn);
                }
            });
        });

        return obj;
    }
}

module.exports = Tempmutes;
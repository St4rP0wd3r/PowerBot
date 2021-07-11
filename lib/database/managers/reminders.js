const r = require("rethinkdb");

class Reminders {
    constructor (conn) {
        this.conn = conn;
    }

    async add (userID, time, text) {
        const remindid = (await r.table("Reminders").getAll([userID], { index: "getAll" }).coerceTo("array").run(this.conn)).length + 1;

        const inserted = await r.table("Reminders").insert({
            userid: userID,
            end: time,
            text: text,
            remindid: remindid,
        }).run(this.conn);
        const id = inserted.generated_keys[0];
        const conn = this.conn;
        return new class Remind {
            constructor () {
                Object.assign(this, {
                    userid: userID,
                    end: time,
                    text: text,
                    remindid: remindid,
                });
            }

            async update (settings) {
                Object.assign(this, settings);
                return await r.table("Reminders").get(id).update(settings).run(conn);
            }

            async remove () {
                return await r.table("Reminders").get(id).delete().run(conn);
            }
        };
    }

    async get (userID, remindID) {
        const conn = this.conn;
        const remind = (await r.table("Reminders").getAll([userID, remindID], { index: "get" }).coerceTo("array").run(this.conn))[0];
        if (!remind) return null;
        return new class Remind {
            constructor () {
                Object.assign(this, remind);
            }

            async update (settings) {
                Object.assign(this, settings);
                return await r.table("Reminders").get(remind.id).update(settings).run(conn);
            }

            async remove () {
                return await r.table("Reminders").get(remind.id).delete().run(conn);
            }
        };
    }

    async getAll (userID) {
        const reminds = await r.table("Reminders").getAll([userID], { index: "getAll" }).orderBy(r.desc("remindid")).coerceTo("array").run(this.conn);
        const conn = this.conn;
        const array = [];
        reminds.forEach(obj => {
            array.push(new class Remind {
                constructor () {
                    Object.assign(this, obj);
                }

                async update (settings) {
                    Object.assign(this, settings);
                    return await r.table("Reminders").get(obj.id).update(settings).run(conn);
                }

                async remove () {
                    return await r.table("Reminders").get(obj.id).delete().run(conn);
                }
            });
        });
        return array;
    }

    async interval () {
        const conn = this.conn;

        const reminds = await r.table("Reminders").between(1, Date.now(), { index: "endDate" }).coerceTo("array").run(this.conn);
        const array = [];
        reminds.forEach(obj => {
            array.push(new class Remind {
                constructor () {
                    Object.assign(this, obj);
                }

                async update (settings) {
                    Object.assign(this, settings);
                    return await r.table("Reminders").get(obj.id).update(settings).run(conn);
                }

                async remove () {
                    return await r.table("Reminders").get(obj.id).delete().run(conn);
                }
            });
        });
        return array;
    }

}

module.exports = Reminders;

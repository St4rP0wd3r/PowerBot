const r = require("rethinkdb");
module.exports = class MutesManager {
    constructor(connection) {
        this.conn = connection;
    }

    async add({ user = null, reedemed = false, time = 0 }) {
        const { generated_keys } = await r.table("Premium").insert({ user, reedemed, end: time }).run(client.database.conn);
        return { id: generated_keys[0] };
    }

    async get(id) {
        const conn = this.conn;
        const val = await r.table("Premium").get(id).run(client.database.conn);
        if (!val) return false;
        return new class Premium {
            constructor() {
                Object.assign(this, val);
            }

            async remove() {
                return await r.table("Premium").get(this.id).delete().run(conn);
            }

            async update(body) {
                return await r.table("Premium").get(this.id).update(body).run(conn);
            }
        };
    }

    async interval() {
        const conn = this.conn;
        const reminds = await r.table("Premium").between(1, Date.now(), { index: "end" }).coerceTo("array").run(this.conn);
        const array = [];
        reminds.forEach(val => {
            array.push(new class Premium {
                constructor() {
                    Object.assign(this, val);
                }

                async remove() {
                    return await r.table("Premium").get(this.id).delete().run(conn);
                }

                async update(body) {
                    return await r.table("Premium").get(this.id).update(body).run(conn);
                }
            });
        });
        return array;
    }
};
const r = require("rethinkdb");

class BackupsManager {
    constructor(conn) {
        this.conn = conn;
    }

    async create(authorID, data) {
        const settings = { data, authorid: authorID };
        const { generated_keys } = await r.table("Backups").insert(settings).run(this.conn);
        const conn = this.conn;
        settings.id = generated_keys[0];
        return new class Backup {
            constructor() {
                Object.assign(this, settings);
            }

            async update(settings) {
                Object.assign(this, settings);
                return await r.table("Backups").get(this.id).update(settings).run(conn);
            }

            async remove() {
                return await r.table("Backups").get(this.id).delete().run(conn);
            }
        };
    }

    async get(ID) {
        const conn = this.conn;
        const settings = await r.table("Backups").get(ID).run(this.conn);

        if (!settings) return null;
        return new class Backup {
            constructor() {
                Object.assign(this, settings);
            }

            async update(settings) {
                Object.assign(this, settings);
                return await r.table("Backups").get(this.id).update(settings).run(conn);
            }

            async remove() {
                return await r.table("Backups").get(this.id).delete().run(conn);
            }
        };
    }
}

module.exports = BackupsManager;
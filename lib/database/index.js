const r = require("rethinkdb");
const { readdirSync } = require("fs");
const config = require("../config");
module.exports = class Database {
    async init() {
        console.log(`Attempt to connect to database...`);

        this.conn = await r.connect({
            db: config.database.db,
        }).catch(() => {
            console.warn("Unable to connect to the database");
            process.exit(1);
        });

        console.log(`Database connected`);

        this.conn.on("error", () => {
            console.warn("Disconnected from the database");
            process.exit(1);
        });

        this.servers = new (require("./managers/servers"))(this.conn);
        this.punishments = new (require("./managers/punishments"))(this.conn);
        this.tempbans = new (require("./managers/tempbans"))(this.conn);
        this.tempmutes = new (require("./managers/tempmutes"))(this.conn);
        this.reminders = new (require("./managers/reminders"))(this.conn);
        this.users = new (require("./managers/users"))(this.conn);
        this.mutes = new (require("./managers/mutes"))(this.conn);
        this.leveling = new (require("./managers/leveling"))(this.conn);
        this.giveaways = new (require("./managers/giveaways"))(this.conn);
        this.backups = new (require("./managers/backups"))(this.conn);
        this.premium = new (require("./managers/premium"))(this.conn);
    }

    get defaults() {
        const dirs = {};
        for (const file of readdirSync("./src/data/defaults")) dirs[file.split(".")[0]] = require(`./src/data/database/defaults/${file}`);
        return dirs;
    }

};
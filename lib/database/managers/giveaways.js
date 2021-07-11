const r = require("rethinkdb");

class GiveawaysManager {
    constructor(conn) {
        this.conn = conn;
    }

    async create({ guildID, messageID, channelID, authorID, reaction, end, prize, winners = 1 }) {
        await r.table("Giveaways").insert({
            guildid: guildID,
            messageid: messageID,
            channelid: channelID,
            reaction: reaction,
            ended: false,
            winners: winners,
            end: end,
            prize: prize,
            author: authorID,
        }).run(this.conn);
        const conn = this.conn;
        const settings = {
            guildid: guildID,
            messageid: messageID,
            channelid: channelID,
            reaction: reaction,
            ended: false,
            winners: winners,
            end: end,
            prize: prize,
            author: authorID,
        };
        return new class Giveaway {
            constructor() {
                Object.assign(this, settings);
            }

            async update(settings) {
                Object.assign(this, settings);
                return await r.table("Giveaways").get(this.id).update(settings).run(conn);
            }

            async end() {
                Object.assign(this, { ended: true });
                return await r.table("Giveaways").get(this.id).update({ ended: true }).run(conn);
            }

            async remove() {
                return await r.table("Giveaways").get(this.id).delete().run(conn);
            }
        };
    }

    async get(guildID, messageID) {
        const conn = this.conn;
        const settings = (await r.table("Giveaways").getAll([guildID, messageID], { index: "get" }).coerceTo("array").run(this.conn))[0];
        return new class Giveaway {
            constructor() {
                Object.assign(this, settings);
            }

            async update(settings) {
                Object.assign(this, settings);
                return await r.table("Giveaways").get(this.id).update(settings).run(conn);
            }

            async remove() {
                return await r.table("Giveaways").get(this.id).delete().run(conn);
            }
        };
    }

    async list(guildID) {
        const conn = this.conn;
        const reminds = await r.table("Giveaways").getAll([guildID], { index: "list" }).coerceTo("array").run(this.conn);
        const array = [];
        reminds.forEach(obj => {
            array.push(new class Giveaway {
                constructor() {
                    Object.assign(this, obj);
                }

                async update(settings) {
                    Object.assign(this, settings);
                    return await r.table("Giveaways").get(this.id).update(settings).run(conn);
                }

                async remove() {
                    return await r.table("Giveaways").get(this.id).delete().run(conn);
                }
            });
        });
        return array;
    }

    async interval() {
        const conn = this.conn;
        const reminds = await r.table("Giveaways").filter(r.row("ended").eq(false)).coerceTo("array").run(this.conn);
        const array = [];
        reminds.forEach(obj => {
            array.push(new class Giveaway {
                constructor() {
                    Object.assign(this, obj);
                }

                async update(settings) {
                    Object.assign(this, settings);
                    return await r.table("Giveaways").get(this.id).update(settings).run(conn);
                }

                async remove() {
                    return await r.table("Giveaways").get(this.id).delete().run(conn);
                }
            });
        });
        return array;
    }
}

module.exports = GiveawaysManager;
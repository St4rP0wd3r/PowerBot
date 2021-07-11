module.exports = {
    tables: {
        Servers: {
            indexes: [],
        },
        Punishments: {
            indexes: [
                "r.table(\"Punishments\").indexCreate(\"getAll\", [r.row(\"guildid\")]).run(conn)",
                "r.table(\"Punishments\").indexCreate(\"get\", [r.row(\"caseid\"), r.row(\"guildid\")]).run(conn)",
                "r.table(\"Punishments\").indexCreate(\"history\", [r.row(\"guildid\"), r.row(\"userid\")]).run(conn)",
            ],
        },
        Tempbans: {
            indexes: [
                "r.table(\"Tempbans\").indexCreate(\"endDate\", r.row(\"date\")(\"expires\")).run(conn)",
                "r.table(\"Tempbans\").indexCreate(\"get\", [r.row(\"userid\"), r.row(\"guildid\")]).run(conn)",
            ],
        },
        Tempmutes: {
            indexes: [
                "r.table(\"Tempmutes\").indexCreate(\"endDate\", r.row(\"date\")(\"expires\")).run(conn)",
                "r.table(\"Tempmutes\").indexCreate(\"get\", [r.row(\"userid\"), r.row(\"guildid\")]).run(conn)",
            ],
        },
        Reminders: {
            indexes: [
                "r.table(\"Reminders\").indexCreate(\"getAll\", [r.row(\"userid\")]).run(conn)",
                "r.table(\"Reminders\").indexCreate(\"get\", [r.row(\"userid\"), r.row(\"remindid\")]).run(conn)",
                "r.table(\"Reminders\").indexCreate(\"endDate\", r.row(\"end\")).run(conn)",
            ],
        },
        Users: {
            indexes: [],
        },
        Mutes: {
            indexes: [
                "r.table(\"Mutes\").indexCreate(\"get\", [r.row(\"guildid\"), r.row(\"userid\")]).run(conn)",
            ],
        },
        Leveling: {
            indexes: [
                "r.table(\"Leveling\").indexCreate(\"get\", [r.row(\"guildid\"), r.row(\"userid\")]).run(conn)",
                "r.table(\"Leveling\").indexCreate(\"getAll\", [r.row(\"guildid\")]).run(conn)",
            ],
        },
        Session: {
            indexes: [],
        },
        Giveaways: {
            indexes: [
                "r.table('Giveaways').indexCreate('get', [r.row('guildid'), r.row('messageid')]).run(conn)",
                "r.table('Giveaways').indexCreate('list', [r.row('guildid')]).run(conn)",
            ],
        },
    },
};
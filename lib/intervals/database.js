const ms = require("../../lib/modules/Ms");
const { execSync } = require("child_process");
const { MessageAttachment } = require("discord.js-light");
const { unlinkSync } = require("fs");
module.exports = () => {
    if (client.config.settings.node === "development") return;
    setInterval(async () => {
            const date = Date.now();

            execSync(`cd /root/rethinkdb && rethinkdb-dump -f backup_${date}.tar.gz`);
            const file = new MessageAttachment(`/root/rethinkdb/backup_${date}.tar.gz`);
            client.functions.postWebhook(client.config.webhooks.database, {
                files: [file],
            });

            setTimeout(() => unlinkSync(`/root/rethinkdb/backup_${date}.tar.gz`), 1000);
        }
        ,
        ms("12h"),
    );
};
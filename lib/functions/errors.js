const { MessageAttachment } = require("discord.js-light");

module.exports = new class {
    async hadleCommandError(message, error, command) {
        if (message.member.permissionLevel === 6) {
            const embed = new client.Embed(message)
                .setDescription(`<:check_red:814098202063405056> **Error**\n\n\`\`\`js\n${error.stack}\`\`\``)
                .setColor(message.guild.settings.colors.error);
            message.reply(embed);
        } else {
            console.error(error);
            const embed2 = new client.Embed(message)
                .setDescription(`<:check_red:814098202063405056> Wystąpił błąd podczas wykonywania twojego polecenia. Został on automatycznie zgłoszony do developerów i zostanie szybko naprawiony. Jeśli błąd wystąpił podczas użycia ważnej dla Ciebie funkcji, dołącz na [serwer developerski](http://discord.gg/XG2b7VCMKe) `)
                .setColor(message.guild.settings.colors.error);
            message.reply(embed2);
            if (client.config.settings.node !== "production") return;

            const embed = new client.Embed()
                .setColor("RED")
                .addField("Autor", `${message.author.tag} - ${message.author.id}`)
                .addField("Serwer", `${message.guild.name} - ${message.guild.id}`)
                .addField("Treść wiadomosci", message.content.length < 1023 ? message.content : "Zbyt duża")
                .addField("ID wiadomości", `${message.id}`)
                .addField("Kanał", `${message.channel.name} - ${message.channel.id}`)
                .addField("Komenda", `${command.conf.name}`)
                .setDescription(`\`\`\`js\n${error.stack?.length < 2047 ? error.stack : "\"W pliku\""}\`\`\``)
                .addField("Link do wiadomośći", `[\`Click!\`](${message.url})`)
                .setAuthor("Error w komendzie", client.user.displayAvatarURL());
            if (error.stack?.length > 2047) {
                const path = `./cache/${Math.randomInt(1, 999999)}_error_stack_${message.author.id}.txt`;
                await fs.writeFileSync(path, error.stack);
                const file = new MessageAttachment(path, "error.txt");
                client.functions.postWebhook(client.config.webhooks.errors, {
                    embeds: [embed],
                    files: [file],
                });
                setTimeout(() => fs.unlinkSync(path), 500);

                const embed2 = new client.Embed(message)
                    .setDescription(`<:check_red:814098202063405056> Wystąpił błąd podczas wykonywania twojego polecenia. Został on automatycznie zgłoszony do developerów i zostanie szybko naprawiony. Jeśli błąd wystąpił podczas użycia ważnej dla Ciebie funkcji, dołącz na [serwer developerski](http://discord.gg/XG2b7VCMKe) `)
                    .setColor(message.guild.settings.colors.error);
                message.reply(embed2);
            } else {
                client.functions.postWebhook(client.config.webhooks.errors, {
                    embeds: [embed],
                });
            }
        }
    }
};

const BaseCommand = require("../../lib/structures/bot/Command");
const fetch = require("node-fetch");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "nbp",
            aliases: ["kursy", "kursy-walut", "kurs-walut"],
            description: "Pokazuje aktualne kursy walut",
            usage: "<p>nbp",
            category: "Zabawa",
        });
    }

    async run(message) {
        const body = await fetch("http://api.nbp.pl/api/exchangerates/tables/a?format=json").then(r => r.json());
        const embed = new client.Embed(message)
            .addField(`Dolar Amerykański [\`${body[0].rates[1].code}\`]`, `${body[0].rates[1].mid}`) //USD
            .addField(`Euro [\`${body[0].rates[7].code}\`]`, `${body[0].rates[7].mid}`) //EUR
            .addField(`Brytyjski funt szterling [\`${body[0].rates[10].code}\`]`, `${body[0].rates[10].mid}`) //GBP
            .addField(`Frank szwajcarsk [\`${body[0].rates[9].code}\`]`, `${body[0].rates[9].mid}`) //CHF
            .addField(`Korona czeska [\`${body[0].rates[13].code}\`]`, `${body[0].rates[13].mid}`) //CZK
            .addField(`Korona duńska [\`${body[0].rates[14].code}\`]`, `${body[0].rates[14].mid}`) //DKK
            .addField(`Korona norweska [\`${body[0].rates[16].code}\`]`, `${body[0].rates[16].mid}`) //NOK
            .addField(`Korona szwedzka [\`${body[0].rates[17].code}\`]`, `${body[0].rates[17].mid}`) //SEK
            .addField(`Hrywna ukraińska [\`${body[0].rates[11].code}\`]`, `${body[0].rates[11].mid}`) //UAH
            .addField(`Rubel rosyjski [\`${body[0].rates[29].code}\`]`, `${body[0].rates[29].mid}`) //RUB
            .addField(`Juan chiński [\`${body[0].rates[33].code}\`]`, `${body[0].rates[34].mid}`) //CNY
            .addField(`Jen japoński [\`${body[0].rates[12].code}\`]`, `${body[0].rates[12].mid}`); //JPY
        message.reply(embed);

    }
};



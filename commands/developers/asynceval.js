const { inspect } = require("util");
const BaseCommand = require("../../lib/structures/bot/Command");


module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "asynceval",
            aliases: ["ae"],
            permissionLevel: 6,
            description: "Wykonuje kod javascript",
            usage: "<p>asynceval <kod>",
            category: "Deweloperskie",
        });
    }

    async run(message, { args, guildConf }) {
        const sender = new client.Sender(message);
        const toEval = (code) => {
            return eval(`
                const evaluate = async () => {
                    ${code}
                }
                evaluate();
            `);
        };
        let query = args.join(" ") || null;
        let hrDiff;
        let evaled;
        try {
            let hrStart = process.hrtime();
            evaled = await toEval(query);
            hrDiff = process.hrtime(hrStart);
        } catch (err) {
            if (query?.length > 1012) query = query?.substring(0, 1010) + "...";
            if (err.stack.toString().length > 1012) err.stack = err.stack.toString().substring(0, 1010) + "...";
            const embederror = new client.Embed(message)
                .setDescription(`<:check_red:814098202063405056> Error`)
                .addField("Input:", `\`\`\`js\n${query}\n\`\`\``)
                .addField("Output:", `\`\`\`js\n${err.stack}\n\`\`\``)
                .setColor("RED");
            return message.reply(embederror).catch(() => null);
        }
        let inspected = inspect(evaled, { depth: 0 });
        if (query?.length > 1012) query = query?.substring(0, 1010) + "...";
        if (inspected.toString().length > 1012) inspected = inspected.toString().substring(0, 1010) + "...";
        const embedgut = new client.Embed(message)
            .setDescription(`<:check_green:814098229712781313> Eval`)
            .addField("Input:", `\`\`\`js\n${query}\n\`\`\``)
            .addField("Output:", `\`\`\`js\n${inspected}\n\`\`\``)
            .addField("Type:", `\`\`\`yaml\n${extendedtypeof(evaled)}\n\`\`\``)
            .addField("Time:", `\`\`\`yaml\n${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ""}${hrDiff[1] / 1000000}ms.\`\`\``)
            .setColor("GREEN");
        message.reply(embedgut).catch(() => null);

    }

};


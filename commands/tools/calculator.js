const BaseCommand = require("../../lib/structures/bot/Command");
const { MessageComponent, MessageActionRow } = require("../../lib/structures/components");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "calculator",
            aliases: ["calc", "kalkulator"],
            description: "Kalkulator",
            usage: "<p>calculator",
            category: "Kalkulator",
        });
    }

    async run(message, { args }) {
        const i = (length) => {
            const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let result = "";
            for (let i = 0; i < length; i++) {
                result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
            }
            return result;
        };

        let str = "0";
        let stringify = "```\n" + str + "\n```";
        if (args[0]) {
            str = args.join(" ");
            stringify = "```\n" + args.join(" ") + "\n```";
        }
        const embed = new client.Embed(message)
            .setTitle("Kalkulator")
            .setDescription("```" + str + "```")
            .setColor(message.guild.settings.colors.done);

        const calc1 = i(20);
        const calc2 = i(20);
        const calc3 = i(20);
        const calc4 = i(20);
        const calc5 = i(20);
        const calc6 = i(20);
        const calc7 = i(20);
        const calc8 = i(20);
        const calc9 = i(20);
        const calc10 = i(20);
        const calc11 = i(20);
        const calc12 = i(20);
        const calc13 = i(20);
        const calc14 = i(20);
        const calc15 = i(20);
        const calc16 = i(20);
        const calc17 = i(20);
        const calc18 = i(20);
        const calc19 = i(20);
        const calc20 = i(20);

        const btn1 = new MessageComponent().setLabel("1").setStyle("2").setID(calc1);
        const btn2 = new MessageComponent().setLabel("2").setStyle("2").setID(calc2);
        const btn3 = new MessageComponent().setLabel("3").setStyle("2").setID(calc3);
        const btnplus = new MessageComponent().setLabel("+").setStyle("1").setID(calc4);
        const btn4 = new MessageComponent().setLabel("4").setStyle("2").setID(calc5);
        const btn5 = new MessageComponent().setLabel("5").setStyle("2").setID(calc6);
        const btn6 = new MessageComponent().setLabel("6").setStyle("2").setID(calc7);
        const btnminus = new MessageComponent().setLabel("-").setStyle("1").setID(calc8);
        const btn7 = new MessageComponent().setLabel("7").setStyle("2").setID(calc9);
        const btn8 = new MessageComponent().setLabel("8").setStyle("2").setID(calc10);
        const btn9 = new MessageComponent().setLabel("9").setStyle("2").setID(calc11);
        const btndziel = new MessageComponent().setLabel("/").setStyle("1").setID(calc12);
        const btn0 = new MessageComponent().setLabel("00").setStyle("2").setID(calc13);
        const btn00 = new MessageComponent().setLabel("0").setStyle("2").setID(calc14);
        const btndot = new MessageComponent().setLabel(".").setStyle("2").setID(calc15);
        const btnmnoz = new MessageComponent().setLabel("*").setStyle("1").setID(calc16);
        const btnreset = new MessageComponent().setLabel("C").setStyle("red").setID(calc17);
        const btnstop = new MessageComponent().setLabel("OFF").setStyle("red").setID(calc18);
        const btnequals = new MessageComponent().setLabel("=").setStyle("green").setID(calc19);
        const btnDel = new MessageComponent().setLabel("<--").setStyle("red").setID(calc20);

        const filter = m => m.clicker?.user?.id === message.author.id;

        const list1 = new MessageActionRow()
            .addComponents([btn1, btn2, btn3, btnplus, btnreset]);
        const list2 = new MessageActionRow()
            .addComponents([btn4, btn5, btn6, btnminus, btnstop]);
        const list3 = new MessageActionRow()
            .addComponents([btn7, btn8, btn9, btndziel, btnDel]);
        const list4 = new MessageActionRow()
            .addComponents([btn00, btn0, btndot, btnmnoz, btnequals]);
        const msg = await message.reply(embed, {
            components: [list1, list2, list3, list4],
        });

        const edit = async (no_components) => {
            embed.setDescription(stringify);
            if (no_components) await msg.edit(embed);
            else await msg.edit(embed, {
                save_components: true,
            });
        };

        const calc = msg.createButtonCollector(filter);

        calc.on("collect", async btn => {

            if (btn.id === calc1) {
                str += "1";
                stringify = "```\n" + str + "\n```";
                await edit();
            } else if (btn.id === calc2) {
                str += "2";
                stringify = "```\n" + str + "\n```";
                await edit();
            } else if (btn.id === calc3) {
                str += "3";
                stringify = "```\n" + str + "\n```";
                edit();
            } else if (btn.id === calc4) {
                str += "+";
                stringify = "```\n" + str + "\n```";
                edit();
            } else if (btn.id === calc5) {
                str += "4";
                stringify = "```\n" + str + "\n```";
                edit();
            } else if (btn.id === calc6) {
                str += "5";
                stringify = "```\n" + str + "\n```";
                edit();
            } else if (btn.id === calc7) {
                str += "6";
                stringify = "```\n" + str + "\n```";
                edit();
            } else if (btn.id === calc8) {
                str += "-";
                stringify = "```\n" + str + "\n```";
                edit();
            } else if (btn.id === calc9) {
                str += "7";
                stringify = "```\n" + str + "\n```";
                edit();
            } else if (btn.id === calc10) {
                str += "8";
                stringify = "```\n" + str + "\n```";
                edit();
            } else if (btn.id === calc11) {
                str += "9";
                stringify = "```\n" + str + "\n```";
                edit();
            } else if (btn.id === calc12) {
                str += "/";
                stringify = "```\n" + str + "\n```";
                edit();
            } else if (btn.id === calc13) {
                str += "00";
                stringify = "```\n" + str + "\n```";
                edit();
            } else if (btn.id === calc14) {
                str += "0";
                stringify = "```\n" + str + "\n```";
                edit();
            } else if (btn.id === calc15) {
                str += ".";
                stringify = "```\n" + str + "\n```";
                edit();
            } else if (btn.id === calc16) {
                str += "*";
                stringify = "```\n" + str + "\n```";
                edit();
            } else if (btn.id === calc17) {
                str = " ";
                stringify = "```\n0\n```";
                edit();
            } else if (btn.id === calc20) {
                if (str.length === 1) return edit();
                str = str.toString().substring(0, str.length - 1);
                stringify = "```\n" + str + "\n```";

                edit();
            } else if (btn.id === calc18) {
                let embedStop = new client.Embed(message)
                    .setDescription(`<:check_green:814098229712781313> Kalkulator został zatrzymany`)
                    .setColor(message.guild.settings.colors.done);
                await msg.edit(embedStop);
            } else if (btn.id === calc19) {
                try {
                    str = require("mathjs").evaluate(str);
                    if (str.toString().includes("NaN") || str.toString().includes("Infinity")) throw new Error("Syntax");
                    stringify = "```\n" + str.toString() + "\n```";
                    edit();

                } catch (err) {
                    let errorCode = "Nieznany błąd";
                    if (err.stack.includes("Syntax")) errorCode = "Nieprawidłowe działanie";
                    stringify = "```\n" + "BŁĄD" + "\n```\n\nBłąd: " + errorCode;
                    await edit();
                    str = " ";
                }
            }
        });
    }
};
const BaseCommand = require("../../lib/structures/bot/Command");
const { MessageComponent, MessageActionRow } = require("../../lib/structures/components");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "rps",
            aliases: ["pkn"],
            description: "Gra w papier kamien nozyce",
            usage: "<p>rpc",
            category: "Gry",
            flags: null,
            disabled: false,
            permissionLevel: 1,
        });
    }

    async run(message, { args, flags, prefix, guildConf }) {
        const randomInt = Math.randomInt(1, 99999999);

        let btn1 = new MessageComponent()
            .setID(`${randomInt}_rock`)
            .setStyle(2)
            .setLabel("🗻");

        let btn2 = new MessageComponent()
            .setID(`${randomInt}_paper`)
            .setStyle(2)
            .setLabel("📰");

        let btn3 = new MessageComponent()
            .setID(`${randomInt}_scissors`)
            .setStyle(2)
            .setLabel("✂");

        let btnList = new MessageActionRow()
            .addComponents([btn1, btn2, btn3]);

        const embed = new client.Embed(message)
            .setDescription("Wybierz rzecz");

        const msg = await message.reply(null, {
            embed,
            components: btnList,
        });
        const buttonsIDS = [`${randomInt}_scissors`, `${randomInt}_paper`, `${randomInt}_rock`];
        const AIChoices = ["scissors", "paper", "rock"];
        const translatedChoices = { scissors: "Nożyce", paper: "Papier", rock: "Kamień" };

        const collector = msg.createButtonCollector((btn) => btn.clicker?.user?.id === message.author.id);
        collector.on("collect", btn => {


            if (!buttonsIDS.includes(btn.id)) return;
            const AiChoose = AIChoices.random();
            const UserChoose = btn.id.toString().split("_")[1];
            collector.stop();
            switch (UserChoose) {
                case "rock": {
                    switch (AiChoose) {
                        case "scissors":
                            return win(AiChoose, UserChoose);
                        case "rock":
                            return tie(AiChoose, UserChoose);
                        case "paper":
                            return lose(AiChoose, UserChoose);
                    }
                    break;
                }
                case "paper": {
                    switch (AiChoose) {
                        case "scissors":
                            return lose(AiChoose, UserChoose);
                        case "rock":
                            return win(AiChoose, UserChoose);
                        case "paper":
                            return tie(AiChoose, UserChoose);
                    }
                    break;
                }
                case "scissors": {
                    switch (AiChoose) {
                        case "scissors":
                            return tie(AiChoose, UserChoose);
                        case "rock":
                            return lose(AiChoose, UserChoose);
                        case "paper":
                            return win(AiChoose, UserChoose);
                    }
                    break;
                }
            }
        });

        const win = (AiChoose, UserChoose) => {
            msg.edit(new client.Embed(message).setDescription(`Wygrałeś!\nBot wybrał: ${translatedChoices[AiChoose]}\nTy wybrałeś: ${translatedChoices[UserChoose]}`));
        };
        const lose = (AiChoose, UserChoose) => {
            msg.edit(new client.Embed(message).setDescription(`Przegrałeś!\nBot wybrał: ${translatedChoices[AiChoose]}\nTy wybrałeś: ${translatedChoices[UserChoose]}`));
        };
        const tie = (AiChoose, UserChoose) => {
            msg.edit(new client.Embed(message).setDescription(`Remis!\nBot wybrał: ${translatedChoices[AiChoose]}\nTy wybrałeś: ${translatedChoices[UserChoose]}`));
        };
        setTimeout(() => collector.stop(), 1000 * 60);
    }
};
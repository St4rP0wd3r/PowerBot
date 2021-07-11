const BaseCommand = require("../../lib/structures/bot/Command");
const fetch = require("node-fetch");
const { MessageComponent, MessageActionRow } = require("../../lib/structures/components");
const apps = {
    "youtube": "755600276941176913",
    "poker": "755827207812677713",
    "betrayal": "773336526917861400",
    "fishing": "814288819477020702",
    "chess": "832012586023256104",
};

const getInvite = async (applicationID, voiceChannelId) => {
    return await fetch(`https://discord.com/api/v8/channels/${voiceChannelId}/invites`, {
        method: "POST",
        body: JSON.stringify({
            max_age: 86400,
            max_uses: 0,
            target_application_id: applicationID,
            target_type: 2,
            temporary: false,
            validate: null,
        }),
        headers: {
            "Authorization": `Bot ${client.token}`,
            "Content-Type": "application/json",
        },
    }).then(res => res.json());

};
module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "activity",
            aliases: ["together"],
            description: "Activity",
            usage: "<p>activity <aktywność>",
            category: "",
            flags: null,
            disabled: false,
            permissionLevel: 1,
            args: [{
                name: "aktywność",
                ifFail: "Musisz podać poprawną aktywność (`<youtube/poker/betrayal/fishing/chess>`)",
                description: "Together",
                required: true,
                check: (args => !(!args[0] || !apps[args[0]])),
            }],
        });
    }

    async run(message, { args }) {
        const sender = new client.Sender(message);
        if (!message.member.voice?.channel) return sender.error("Musisz wejść na kanał głosowy");
        const activity = apps[args[0]];
        const invite = await getInvite(activity, message.member.voice.channel.id);
        message.reply(null, {
            embed: new client.Embed(message)
                .setDescription(`Otwarto właśnie ${args[0]} together na kanale <#${message.member.voice.channel.id}>`),
            components: new MessageActionRow({
                components: [new MessageComponent({
                    url: `https://discord.gg/${invite.code}`,
                    label: "Dołącz",
                    style: 5,
                })],
            }),
        });
    }
};
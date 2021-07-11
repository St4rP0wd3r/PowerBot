module.exports = {
    prefixes: [
        "&",
    ],
    modlog: {
        status: false,
        channel: null,
    },
    logs: {
        status: false,
        channel: null,
    },
    premium: {
        id: null,
        status: false,
    },
    autorole: {
        status: false,
        roles: [],
    },
    broadcast: {
        crosspost: false,
        channel: null,
        status: false,
        color: "#ff8c00",
    },
    snipe: {
        status: false,
    },
    verify: {
        status: false,
        roles: [],
        channel: null,
    },
    reactionroles: [],
    // economy: {
    //     vault: "<a:RainbowPepe:824324338051579975>",
    //     multiplier: 200,
    //     replies: {
    //         work: ["Obciągnąłeś skelejkowi i otrzymałeś {cash}", "Kliknąłeś CTRL + R i zamieniłeś wszystkie vary na lety, zarobiłeś {cash}"],
    //         crime: {
    //             fail: ["Wyjebałeś się idąc okraść starszą panią, {cash} wpadło ci do studzienki."],
    //             success: ["Okradłeś bank spermy i sprzedałęś ją w innym banku, zarobiłeś {cash}"],
    //         },
    //         slut: {
    //             fail: ["Rozciąłeś se jelito sztucznym kutachem i musiales zaplacic {cash} za operacje."],
    //             success: ["Spadły ci spodnie i ludzie zaczeli ci rzucac pieniadze, zebrales w sumie {cash}"],
    //         },
    //     },
    //     cooldown: {
    //         work: 20000,
    //         crime: 20000,
    //         slut: 20000,
    //     },
    // },
    mutedRole: null,
    colors: {
        done: "#2ecc71",
        error: "#e74c3c",
    },
    goodbye: {
        channel: null,
        color: "#e66465",
        message: "Żegnaj {user.tag}. Miejmy nadzieje że kiedyś wrócisz. Po twoim odejściu jest nas tylko {guild.members}",
        status: false,
        title: "Pożegnajmy użytkownika",
    },
    welcome: {
        channel: null,
        color: "#2ecc71",
        message: "Witaj {user}. Miejmy nadzieje że bedziesz sie tutaj dobrze czuł. Jesteś {guild.members} użytkownikiem na tym serwerze",
        status: false,
        title: "Powitajmy nowego użytkownika",
    },
    antyinvite: {
        status: false,
        roles: [],
        channels: [],
        users: [],
    },
    permissions: {
        roles: [],
    },
    proposals: {
        channels: [],
        comment: "//",
        status: false,
    },
    autoresponders: [],
    leveling: {
        status: false,
        message: {
            embed: true,
            text: "Gratuluje {user}, zdobyłeś {level} poziom",
            type: "messageChannel",
        },
        xpNeeded: 170,
        roles: [],
    },
};
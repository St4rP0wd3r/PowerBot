const { MessageComponent, MessageActionRow } = require("../components");

class Menu {

    constructor(opts = {}) {
        const {
            channel,
            userID,
            pages = [],
            page = 0,
            time = 120000,
            message,
        } = opts;
        if (!channel || !userID || !message) throw new Error("ReactionPageMenuError: not provided channel or userID or message");
        this.channel = channel;
        this.pages = pages;
        this.time = time;
        this.page = page;
        this.userID = userID;
        this.catch = () => {
        };
        this.randomID = Math.randomInt(1, 99999999999);
        this.message = message;
        const content = this.pages[0];
        if (typeof content === "object") {
            if (!content.footer) content.footer = {};
            content.footer.text = `1/${this.pages.length}`;
        }
        message.reply(typeof content === "object" ? "" : pages[page], {
            embed: typeof content === "object" ? pages[page] : null,
            components: new MessageActionRow().addComponents([
                new MessageComponent({
                    label: " Poprzednia strona",
                    style: 1,
                    id: `${this.randomID}_menu_back`,
                }),
                new MessageComponent({
                    label: "Następna strona",
                    style: 1,
                    id: `${this.randomID}_menu_next`,
                }),
            ]),
        }).then(msg => {
            this.msg = msg;
            this.createCollector(this.userID);
        }).catch(this.catch);
    }

    select(pg = 0, no_buttons) {
        this.page = pg;
        const content = this.pages[pg];
        if (typeof content === "object") {
            if (!content.footer) content.footer = {};
            content.footer.text = `${pg + 1}/${this.pages.length}`;
        }
        this.msg.edit(content, {
            save_components: !no_buttons,
        });
        return true;
    }

    createCollector(uid) {
        clearTimeout(this.timeout);
        const collector = this.msg.createButtonCollector((btn) => btn.clicker.user.id === uid);
        collector.on("collect", (btn) => {
            (1);
            switch (btn.id) {
                case `${this.randomID}_menu_back`: {
                    if (this.page !== 0) this.select(this.page - 1);
                    break;
                }
                case `${this.randomID}_menu_next`: {
                    if (this.page < this.pages.length - 1) this.select(this.page + 1);
                    break;
                }
            }
        });
        this.timeout = setTimeout(() => {
            collector.stop();
            this.msg.edit(this.pages[this.page]);
        }, 1000 * 60);
    }
}

module.exports = Menu;
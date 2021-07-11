const { readFileSync } = require("fs");
const conf = {}
const NEWLINE = "\n";
const RE_NEWLINES = /\\n/g;
const RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
const NEWLINES_MATCH = /\n|\r|\r\n/;

class Config {
    constructor(path = "./.env") {
        const file = readFileSync(path, "utf-8").split(NEWLINES_MATCH);
        for (const env of file) {
            const keyValueArr = env.match(RE_INI_KEY_VAL);
            if (!keyValueArr) continue;
            const key = keyValueArr[1];
            let val = (keyValueArr[2] || "");
            const end = val.length - 1;
            const isDoubleQuoted = val[0] === "\"" && val[end] === "\"";
            const isSingleQuoted = val[0] === "\"" && val[end] === "\"";
            if (isSingleQuoted || isDoubleQuoted) {
                val = val.substring(1, end);
                if (isDoubleQuoted) val = val.replace(RE_NEWLINES, NEWLINE);
            } else val = val.trim();

            conf[key] = val;
        }
    }

    get tokens() {
        return {
            main: conf.TOKENS_BOT,
            github: conf.TOKENS_GITHUB,
            apis: {
                alexflipnote: conf.TOKENS_API_ALEXFLIPNOTE,
            },
        };
    }

    get dashboard() {
        return {
            clientID: conf.DASHBOARD_CLIENTID,
            secret: conf.DASHBOARD_CLIENTSECRET,
            port: conf.DASHBOARD_PORT,
            redirects: {
                main: conf.DASHBOARD_REDIRECT,
                add: conf.DASHBOARD_ADDREDIRECT,
            },
        };
    }

    get database() {
        return {
            db: conf.DATABASE_DB,
            password: null,
            host: null,
        };
    }

    get settings() {
        return {
            node: conf.NODE_ENV,
            debug: conf.DEBUG === "true",
        };
    }

    get perms() {
        return {
            developer: [ /* Aleks */ '423494758862946324', /* Remixiak */ '647194026935582761', /* Sebt08 */ '589811823189032960'],
        }; 
    }

    get captcha() {
        return {
            secret: conf.RECAPCHA_SECRET,
            sitekey: conf.RECAPTCHA_SITEKEY,
        };
    }

    get links() {
        return {
            support: conf.LINKS_SUPPORT,
            site: conf.LINKS_SITE,
        };
    }

    get api() {
        return {
            tokens: require("../data/api/tokens"),
        };
    }

    get webhooks() {
        return {
            ready: conf.WEBHOOKS_READY,
            api: conf.WEBHOOKS_API,
            guilds: conf.WEBHOOKS_GUILDS,
            errors: conf.WEBHOOKS_ERRORS,
            rejection: conf.WEBHOOKS_REJECTION,
            database: conf.WEBHOOKS_DATABASE,
            debug: conf.WEBHOOKS_DEBUG,
        };
    }
}

module.exports = new Config();

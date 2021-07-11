const fetch = require("node-fetch");
const BASE_URL = "https://emkc.org/api/v1/piston";
const Store = {};

class OpenEval {
    constructor () {
        this.fetchLanguages();
    }

    get languages () {
        const langs = Object.keys(Store);
        if (!langs.length) return null;
        return langs;
    };

    async fetchLanguages () {
        try {
            const res = await fetch(`${BASE_URL}/versions`);
            const data = await res.json();

            for (const x of data) {
                Store[x.name] = x.version;
            }
            return Store;
        } catch (e) {
            throw new Error(`Couldn"t parse data! ${e}`);
        }
    };

    async eval (language, code, args = []) {
        if (typeof language !== "string") throw new Error("Language may not be empty!");
        if (typeof code !== "string") return;

        const payload = {
            language: language,
            source: code,
            args: args && Array.isArray(args) ? args : [],
        };

        try {
            const res = await fetch(`${BASE_URL}/execute`, {
                method: "POST",
                body: JSON.stringify(payload),
            });
            return await res.json();
        } catch (e) {
            throw new Error(`Couldn"t execute data! ${e}`);
        }
    };
}

module.exports = OpenEval;
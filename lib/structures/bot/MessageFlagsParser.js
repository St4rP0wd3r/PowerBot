class ExtenedArray extends Array {
    has(g) {
        return !!this.find(x => x.arg === g);
    }
}

module.exports = new class MessageFlagsParser {
    parse(args) {
        const parsedArgs = {};

        args.forEach((arg) => {
            const name = arg.split("=")[0].slice(2);
            if (!arg.split("=").slice(1).join(" ")) return parsedArgs[name] = null;
            parsedArgs[name] = arg.split("=").slice(1).join(" ");
        });

        return parsedArgs;
    }

    parseMessage(args) {
        let flags = new ExtenedArray()
        const messageFlags = args.filter((arg) => arg.startsWith("--"));
        Object.entries(this.parse(messageFlags)).forEach(([key, value]) => {
            if (value === null) flags.push({arg: key});
            else flags.push({
                arg: key,
                value: value,
            });

            if (value === null) args.splice(args.indexOf(`--${key}`), 1);
            else args.splice(args.indexOf(`--${key}=${value}`), 1);
        });

        return flags;
    }
};


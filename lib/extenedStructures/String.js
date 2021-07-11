const randomizeCase = (w) => w.split("").map((x) => Math.random() > 0.5 ? x.toUpperCase() : x.toLowerCase()).join("");

String.prototype.toBoolean = function () {
    switch (this.toLowerCase().trim()) {
        case "true":
        case "yes":
        case "1":
            return true;
        case "false":
        case "no":
        case "0":
        case "null":
        case "undefined":
            return false;
        default:
            return Boolean(this);
    }
};

String.prototype.toRandomCase = function () {
    return randomizeCase(this);
};
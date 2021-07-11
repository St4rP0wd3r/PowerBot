global.extendedtypeof = (x) => {
    const type = typeof x;
    switch (type) {
        case "object": {
            if (x instanceof RegExp) return "regexp";
            if (x instanceof Map) return "map";
            if (x instanceof Array) return "array";
            if (x === null) return "null";
            if (x.toString() === "[object Promise]") return "promise";
            return "object";
        }
        case "number": {
            return Math.floor(x) !== x ? "float" : "integer";
        }
        case "function": {
            if (x.toString().startsWith("(")) return "arrowfunction";
            if (x.toString().startsWith("async (")) return "asyncarrowfunction";
            if (x.toString().startsWith("async")) return "asyncfunction";
            if (x.toString().startsWith("class")) return "class";
            return "function";
        }
        default:
            return type;
    }
};
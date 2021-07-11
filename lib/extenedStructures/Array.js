Array.prototype.clear = function () {
    let cleared = [];
    for (const i of this) if (i) cleared.push(i);
    return cleared;
};

Array.prototype.deleteOne = function (x) {
    if (!x) return this;
    for (const i in this) if (this[i] === x) {
        this.splice(i, 1);
        return this;
    }
    return this;
};

Array.prototype.shuffle = function () {
    let arr = [];
    for (let i = 0; i < this.length; i++) arr[i] = this.splice(Math.floor(Math.random() * this.length), 1)[0];
    return arr;
};

Array.prototype.positionOf = function (x) {
    for (const i in this) if (this[i] && this[i] === x) return Number(i);
};

Array.prototype.chunk = function (chunkSize) {
    const arr = [];
    for (let i = 0; i < this.length; i += chunkSize) arr.push(this.slice(i, i + chunkSize));
    return arr;
};

Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)];
};
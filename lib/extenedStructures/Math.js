Math.randomInt = (x, y) => {
    if (!y) y = 0;
    if (!x) x = 1;
    if (y < x) return Math.floor(Math.random() * x - y) + y;
    return Math.floor(Math.random() * y - x) + x;
};

Math.randomHex = () => {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
};
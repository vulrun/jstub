module.exports = randomize;

function randomize(input = 20, charset) {
    if (typeof input !== "number" && typeof input !== "string") throw new Error("`input must be a number or string`");
    const numericals = "0123465789";
    const lowerAlpha = "abcdefghijklmnopqrstuvwxyz";
    const upperAlpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    if (typeof input === "number") {
        let set = charset ? charset : numericals + lowerAlpha + upperAlpha;
        let str = "";
        while (input--) str += set[0 | (Math.random() * set.length)];
        return str;
    }

    return String(input).replace(/[0-9a-z*]/gi, function (val) {
        if (numericals.indexOf(val) > -1) return numericals[0 | (Math.random() * numericals.length)];
        if (lowerAlpha.indexOf(val) > -1) return lowerAlpha[0 | (Math.random() * lowerAlpha.length)];
        if (upperAlpha.indexOf(val) > -1) return upperAlpha[0 | (Math.random() * upperAlpha.length)];
        return Math.random().toString(36)[2];
    });
}

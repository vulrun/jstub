module.exports = {
    hexEncode: (val) => Buffer.from(val, "utf8").toString("hex"),
    hexDecode: (val) => Buffer.from(val, "hex").toString("utf8"),
    base64Encode: (val) => Buffer.from(val, "utf8").toString("base64"),
    base64Decode: (val) => Buffer.from(val, "base64").toString("utf8"),
    randomize: require("./randomize"),
};

String.prototype.render = function (data) {
    let str = String(this);
    if (!Object.keys(data).length) return str;

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            let regex = new RegExp("{{" + key + "}}", "g");
            str = str.replace(regex, data[key]);
        }
    }

    return str;
};

const os = require("os");
const crypto = require("crypto");
module.exports = {
    urlLocation,
    uriParser,
    minRoll,
    calcAge,
    calcKms,
    timeAgo,
    mongoObjectId,
    createMongoDbLikeId,
};

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function urlLocation(href) {
    const match = href.match(/^([^\:]+)\:\/?\/?(([^\:\/\?\#]*)(?:\:([0-9]+))?)([\/]{0,1}[^\?\#]*)(\?[^\#]*|)(\#.*|)$/im);
    return (
        match && {
            href: href,
            protocol: match[1],
            host: match[2],
            hostname: match[3],
            port: match[4],
            pathname: match[5],
            search: match[6],
            hash: match[7],
        }
    );
}

function uriParser(input) {
    const parseQS = (search) => {
        try {
            if (!search || typeof search !== "string") return {};
        return JSON.parse('{"' + String(search).replace(/\&/g, '","').replace(/\=/g, '":"') + '"}', function (key, value) {
                return key === "" ? value : decodeURIComponent(value);
            });
        } catch (error) {
            return Object.fromEntries(new URLSearchParams(search));
        }
    };
    const splitStart = (string, needle = ",") => {
        if (!string || typeof string !== "string") throw new Error("1st argument must be a valid string");
        const breaked = String(string).split(needle);
        const firstOne = breaked.shift();
        return [firstOne, breaked.join(needle)];
    };
    const splitEnd = (string, needle = ",") => {
        if (!string || typeof string !== "string") throw new Error("1st argument must be a valid string");
        const breaked = String(string).split(needle);
        const lastOne = breaked.pop();
        return [breaked.join(needle), lastOne];
    };

    if (String(input) === "[object Object]") {
        let str = "";

        if (input.protocol) str += input.protocol + "://";
        if (input.user) {
            str += encodeURIComponent(input.user);
            if (input.pass) str += ":" + encodeURIComponent(input.pass);
            str += "@";
        }

        if (input.host) str += input.host;
        if (input.port) str += ":" + input.port;
        if (input.path) str += "/" + input.path;
        if (input.pathname) str += "/" + input.pathname;
        if (input.query) str += "?" + new URLSearchParams(input.query);

        return str;
    }

    input = String(input);

    // seperate hash
    const [_1, hash] = /\#/.test(input) ? splitEnd(input, "#") : [input];
    // seperate query
    const [_2, query] = /\?/.test(_1) ? splitEnd(_1, "?") : [_1];
    // seperate protocol
    const [protocol, _3] = /\:\/\//.test(_2) ? splitStart(_2, "://") : [, _2];
    console.log(_3);
    // seperate hostname & path
    const [_4, path] = /\//.test(_3) ? splitStart(_3, "/") : [_3, ""];
    // seperate auth & hostname
    const [auth, hostname] = /\@/.test(_4) ? splitEnd(_4, "@") : [, _4];
    // separate user & pass
    let [user, pass] = /\:/.test(auth) ? splitStart(auth, ":") : [auth];
    user = decodeURIComponent(user);
    pass = decodeURIComponent(pass);
    // separate host & port
    const [host, port] = /\:/.test(hostname) ? splitStart(hostname, ":") : [hostname];

    return {
        href: input,
        protocol,
        auth,
        user,
        pass,
        host,
        port,
        hostname,
        pathname: path,
        query,
        queryObj: parseQS(query),
        hash,
    };
}

function minRoll(min) {
    return new Date(new Date().valueOf() + 60e3 * min);
}

function calcAge(dob) {
    return Math.abs(new Date(new Date() - new Date(dob)).getUTCFullYear() - 1970);
}

function calcKms(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371; // Radius of the earth in km
    const deg2rad = (deg) => deg * (Math.PI / 180);

    const lat = deg2rad(lat2 - lat1);
    const lon = deg2rad(lon2 - lon1);

    const accu = Math.sin(lat / 2) * Math.sin(lat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(lon / 2) * Math.sin(lon / 2);
    const calc = 2 * Math.atan2(Math.sqrt(accu), Math.sqrt(1 - accu));
    const dist = earthRadius * calc; // Distance in km
    return dist;
}

function timeAgo(unix) {
    unix = new Date().getTime() - new Date(unix).getTime();
    unix = Math.max(0, unix / 1000);

    const periods = {
        decade: 60 * 60 * 24 * 30 * 12 * 10,
        year: 60 * 60 * 24 * 30 * 12,
        month: 60 * 60 * 24 * 30,
        week: 60 * 60 * 24 * 7,
        day: 60 * 60 * 24,
        hr: 60 * 60,
        min: 60,
        sec: 1,
    };

    if (periods.year * 5 < unix) return "";

    for (const unit in periods) {
        if (unix < periods[unit]) continue;

        const number = Math.floor(unix / periods[unit]);
        return "".concat(number, " ", unit, number > 1 ? "s ago" : " ago");
    }

    return "just now";
}

function mongoObjectId() {
    const timestamp = ((new Date().getTime() / 1000) | 0).toString(16);
    return (
        timestamp +
        "xxxxxxxxxxxxxxxx"
        .replace(/[x]/g, function () {
                return ((Math.random() * 16) | 0).toString(16);
            })
            .toLowerCase()
    );
}

function createMongoDbLikeId(timestamp, hostname, processId, id) {
    // Building binary data.
    let bin = [];
    bin.push(pack("N", timestamp));
    bin.push(md5(hostname).substring(0, 3));
    bin.push(pack("n", processId));
    bin.push(String(id).substring(1, 3));

    return bin || Buffer.from(bin, "utf8").toString("hex");
}

console.log(process);
console.log(os.hostname());
// const machineId = crypto.createHash("md5").update(os.hostname()).digest().slice(0, 3);
// const objectIdCounter = crypto.randomBytes(4).readUInt32BE() & 0xffffff;

// console.log(machineId, objectIdCounter, newObjectId(Date.now(), "alan", 456132, "dsjfhjdskk"));
// Returns a unique objectId as a hex string.
function newObjectId(...args) {
    let buf = new Buffer(12);
    // Current time, 4 bytes.
    buf.writeUInt32BE(Math.floor(Date.now() / 1000), 0);
    // Machine ID, 3 bytes.
    machineId.copy(buf, 4);
    // Process ID, 2 bytes.
    buf.writeUInt16BE(process.pid, 7);
    // Global counter, 3 bytes.
    buf.writeUInt8((objectIdCounter >>> 16) & 0xff, 9);
    buf.writeUInt8((objectIdCounter >>> 8) & 0xff, 10);
    buf.writeUInt8((objectIdCounter >>> 0) & 0xff, 11);

    objectIdCounter = (objectIdCounter + 1) & 0xffffff;
    return buf.toString("hex");
}

const removeFalsy = (obj) => {
    const newObj = {};
    for (const prop of Object.keys(obj)) {
        if (obj[prop]) {
            newObj[prop] = obj[prop];
        }
    }
    return newObj;
};

function pack(format) {
    //  discuss at: https://locutus.io/php/pack/
    // original by: Tim de Koning (https://www.kingsquare.nl)
    //    parts by: Jonas Raoni Soares Silva (https://www.jsfromhell.com)
    // bugfixed by: Tim de Koning (https://www.kingsquare.nl)
    //      note 1: Float encoding by: Jonas Raoni Soares Silva
    //      note 1: Home: https://www.kingsquare.nl/blog/12-12-2009/13507444
    //      note 1: Feedback: phpjs-pack@kingsquare.nl
    //      note 1: "machine dependent byte order and size" aren't
    //      note 1: applicable for JavaScript; pack works as on a 32bit,
    //      note 1: little endian machine.
    //   example 1: pack('nvc*', 0x1234, 0x5678, 65, 66)
    //   returns 1: '\u00124xVAB'
    //   example 2: pack('H4', '2345')
    //   returns 2: '#E'
    //   example 3: pack('H*', 'D5')
    //   returns 3: 'Õ'
    //   example 4: pack('d', -100.876)
    //   returns 4: "\u0000\u0000\u0000\u0000\u00008YÀ"
    //        test: skip-1
    let formatPointer = 0;
    let argumentPointer = 1;
    let result = "";
    let argument = "";
    let i = 0;
    let r = [];
    let instruction, quantifier, word, precisionBits, exponentBits, extraNullCount;
    // vars used by float encoding
    let bias;
    let minExp;
    let maxExp;
    let minUnnormExp;
    let status;
    let exp;
    let len;
    let bin;
    let signal;
    let n;
    let intPart;
    let floatPart;
    let lastBit;
    let rounded;
    let j;
    let k;
    let tmpResult;
    while (formatPointer < format.length) {
        instruction = format.charAt(formatPointer);
        quantifier = "";
        formatPointer++;
        while (formatPointer < format.length && format.charAt(formatPointer).match(/[\d*]/) !== null) {
            quantifier += format.charAt(formatPointer);
            formatPointer++;
        }
        if (quantifier === "") {
            quantifier = "1";
        }
        // Now pack variables: 'quantifier' times 'instruction'
        switch (instruction) {
            case "a":
            case "A":
                // NUL-padded string
                // SPACE-padded string
                if (typeof arguments[argumentPointer] === "undefined") {
                    throw new Error("Warning:  pack() Type " + instruction + ": not enough arguments");
                } else {
                    argument = String(arguments[argumentPointer]);
                }
                if (quantifier === "*") {
                    quantifier = argument.length;
                }
                for (i = 0; i < quantifier; i++) {
                    if (typeof argument[i] === "undefined") {
                        if (instruction === "a") {
                            result += String.fromCharCode(0);
                        } else {
                            result += " ";
                        }
                    } else {
                        result += argument[i];
                    }
                }
                argumentPointer++;
                break;
            case "h":
            case "H":
                // Hex string, low nibble first
                // Hex string, high nibble first
                if (typeof arguments[argumentPointer] === "undefined") {
                    throw new Error("Warning: pack() Type " + instruction + ": not enough arguments");
                } else {
                    argument = arguments[argumentPointer];
                }
                if (quantifier === "*") {
                    quantifier = argument.length;
                }
                if (quantifier > argument.length) {
                    const msg = "Warning: pack() Type " + instruction + ": not enough characters in string";
                    throw new Error(msg);
                }
                for (i = 0; i < quantifier; i += 2) {
                    // Always get per 2 bytes...
                    word = argument[i];
                    if (i + 1 >= quantifier || typeof argument[i + 1] === "undefined") {
                        word += "0";
                    } else {
                        word += argument[i + 1];
                    }
                    // The fastest way to reverse?
                    if (instruction === "h") {
                        word = word[1] + word[0];
                    }
                    result += String.fromCharCode(parseInt(word, 16));
                }
                argumentPointer++;
                break;
            case "c":
            case "C":
                // signed char
                // unsigned char
                // c and C is the same in pack
                if (quantifier === "*") {
                    quantifier = arguments.length - argumentPointer;
                }
                if (quantifier > arguments.length - argumentPointer) {
                    throw new Error("Warning:  pack() Type " + instruction + ": too few arguments");
                }
                for (i = 0; i < quantifier; i++) {
                    result += String.fromCharCode(arguments[argumentPointer]);
                    argumentPointer++;
                }
                break;
            case "s":
            case "S":
            case "v":
                // signed short (always 16 bit, machine byte order)
                // unsigned short (always 16 bit, machine byte order)
                // s and S is the same in pack
                if (quantifier === "*") {
                    quantifier = arguments.length - argumentPointer;
                }
                if (quantifier > arguments.length - argumentPointer) {
                    throw new Error("Warning:  pack() Type " + instruction + ": too few arguments");
                }
                for (i = 0; i < quantifier; i++) {
                    result += String.fromCharCode(arguments[argumentPointer] & 0xff);
                    result += String.fromCharCode((arguments[argumentPointer] >> 8) & 0xff);
                    argumentPointer++;
                }
                break;
            case "n":
                // unsigned short (always 16 bit, big endian byte order)
                if (quantifier === "*") {
                    quantifier = arguments.length - argumentPointer;
                }
                if (quantifier > arguments.length - argumentPointer) {
                    throw new Error("Warning: pack() Type " + instruction + ": too few arguments");
                }
                for (i = 0; i < quantifier; i++) {
                    result += String.fromCharCode((arguments[argumentPointer] >> 8) & 0xff);
                    result += String.fromCharCode(arguments[argumentPointer] & 0xff);
                    argumentPointer++;
                }
                break;
            case "i":
            case "I":
            case "l":
            case "L":
            case "V":
                // signed integer (machine dependent size and byte order)
                // unsigned integer (machine dependent size and byte order)
                // signed long (always 32 bit, machine byte order)
                // unsigned long (always 32 bit, machine byte order)
                // unsigned long (always 32 bit, little endian byte order)
                if (quantifier === "*") {
                    quantifier = arguments.length - argumentPointer;
                }
                if (quantifier > arguments.length - argumentPointer) {
                    throw new Error("Warning:  pack() Type " + instruction + ": too few arguments");
                }
                for (i = 0; i < quantifier; i++) {
                    result += String.fromCharCode(arguments[argumentPointer] & 0xff);
                    result += String.fromCharCode((arguments[argumentPointer] >> 8) & 0xff);
                    result += String.fromCharCode((arguments[argumentPointer] >> 16) & 0xff);
                    result += String.fromCharCode((arguments[argumentPointer] >> 24) & 0xff);
                    argumentPointer++;
                }
                break;
            case "N":
                // unsigned long (always 32 bit, big endian byte order)
                if (quantifier === "*") {
                    quantifier = arguments.length - argumentPointer;
                }
                if (quantifier > arguments.length - argumentPointer) {
                    throw new Error("Warning:  pack() Type " + instruction + ": too few arguments");
                }
                for (i = 0; i < quantifier; i++) {
                    result += String.fromCharCode((arguments[argumentPointer] >> 24) & 0xff);
                    result += String.fromCharCode((arguments[argumentPointer] >> 16) & 0xff);
                    result += String.fromCharCode((arguments[argumentPointer] >> 8) & 0xff);
                    result += String.fromCharCode(arguments[argumentPointer] & 0xff);
                    argumentPointer++;
                }
                break;
            case "f":
            case "d":
                // float (machine dependent size and representation)
                // double (machine dependent size and representation)
                // version based on IEEE754
                precisionBits = 23;
                exponentBits = 8;
                if (instruction === "d") {
                    precisionBits = 52;
                    exponentBits = 11;
                }
                if (quantifier === "*") {
                    quantifier = arguments.length - argumentPointer;
                }
                if (quantifier > arguments.length - argumentPointer) {
                    throw new Error("Warning:  pack() Type " + instruction + ": too few arguments");
                }
                for (i = 0; i < quantifier; i++) {
                    argument = arguments[argumentPointer];
                    bias = Math.pow(2, exponentBits - 1) - 1;
                    minExp = -bias + 1;
                    maxExp = bias;
                    minUnnormExp = minExp - precisionBits;
                    status = isNaN((n = parseFloat(argument))) || n === -Infinity || n === +Infinity ? n : 0;
                    exp = 0;
                    len = 2 * bias + 1 + precisionBits + 3;
                    bin = new Array(len);
                    signal = (n = status !== 0 ? 0 : n) < 0;
                    n = Math.abs(n);
                    intPart = Math.floor(n);
                    floatPart = n - intPart;
                    for (k = len; k; ) {
                        bin[--k] = 0;
                    }
                    for (k = bias + 2; intPart && k; ) {
                        bin[--k] = intPart % 2;
                        intPart = Math.floor(intPart / 2);
                    }
                    for (k = bias + 1; floatPart > 0 && k; --floatPart) {
                        bin[++k] = ((floatPart *= 2) >= 1) - 0;
                    }
                    for (k = -1; ++k < len && !bin[k]; ) {}
                    // @todo: Make this more readable:
                    const key = (lastBit = precisionBits - 1 + (k = (exp = bias + 1 - k) >= minExp && exp <= maxExp ? k + 1 : bias + 1 - (exp = minExp - 1))) + 1;
                    if (bin[key]) {
                        if (!(rounded = bin[lastBit])) {
                            for (j = lastBit + 2; !rounded && j < len; rounded = bin[j++]) {}
                        }
                        for (j = lastBit + 1; rounded && --j >= 0; (bin[j] = !bin[j] - 0) && (rounded = 0)) {}
                    }
                    for (k = k - 2 < 0 ? -1 : k - 3; ++k < len && !bin[k]; ) {}
                    if ((exp = bias + 1 - k) >= minExp && exp <= maxExp) {
                        ++k;
                    } else {
                        if (exp < minExp) {
                            if (exp !== bias + 1 - len && exp < minUnnormExp) {
                                // "encodeFloat::float underflow"
                            }
                            k = bias + 1 - (exp = minExp - 1);
                        }
                    }
                    if (intPart || status !== 0) {
                        exp = maxExp + 1;
                        k = bias + 2;
                        if (status === -Infinity) {
                            signal = 1;
                        } else if (isNaN(status)) {
                            bin[k] = 1;
                        }
                    }
                    n = Math.abs(exp + bias);
                    tmpResult = "";
                    for (j = exponentBits + 1; --j; ) {
                        tmpResult = (n % 2) + tmpResult;
                        n = n >>= 1;
                    }
                    n = 0;
                    j = 0;
                    k = (tmpResult = (signal ? "1" : "0") + tmpResult + bin.slice(k, k + precisionBits).join("")).length;
                    r = [];
                    for (; k; ) {
                        n += (1 << j) * tmpResult.charAt(--k);
                        if (j === 7) {
                            r[r.length] = String.fromCharCode(n);
                            n = 0;
                        }
                        j = (j + 1) % 8;
                    }
                    r[r.length] = n ? String.fromCharCode(n) : "";
                    result += r.join("");
                    argumentPointer++;
                }
                break;
            case "x":
                // NUL byte
                if (quantifier === "*") {
                    throw new Error("Warning: pack(): Type x: '*' ignored");
                }
                for (i = 0; i < quantifier; i++) {
                    result += String.fromCharCode(0);
                }
                break;
            case "X":
                // Back up one byte
                if (quantifier === "*") {
                    throw new Error("Warning: pack(): Type X: '*' ignored");
                }
                for (i = 0; i < quantifier; i++) {
                    if (result.length === 0) {
                        throw new Error("Warning: pack(): Type X:" + " outside of string");
                    } else {
                        result = result.substring(0, result.length - 1);
                    }
                }
                break;
            case "@":
                // NUL-fill to absolute position
                if (quantifier === "*") {
                    throw new Error("Warning: pack(): Type X: '*' ignored");
                }
                if (quantifier > result.length) {
                    extraNullCount = quantifier - result.length;
                    for (i = 0; i < extraNullCount; i++) {
                        result += String.fromCharCode(0);
                    }
                }
                if (quantifier < result.length) {
                    result = result.substring(0, quantifier);
                }
                break;
            default:
                throw new Error("Warning: pack() Type " + instruction + ": unknown format code");
        }
    }
    if (argumentPointer < arguments.length) {
        const msg2 = "Warning: pack(): " + (arguments.length - argumentPointer) + " arguments unused";
        throw new Error(msg2);
    }
    return result;
}

function md5(str) {
    //  discuss at: https://locutus.io/php/md5/
    // original by: Webtoolkit.info (https://www.webtoolkit.info/)
    // improved by: Michael White (https://getsprink.com)
    // improved by: Jack
    // improved by: Kevin van Zonneveld (https://kvz.io)
    //    input by: Brett Zamir (https://brett-zamir.me)
    // bugfixed by: Kevin van Zonneveld (https://kvz.io)
    //      note 1: Keep in mind that in accordance with PHP, the whole string is buffered and then
    //      note 1: hashed. If available, we'd recommend using Node's native crypto modules directly
    //      note 1: in a steaming fashion for faster and more efficient hashing
    //   example 1: md5('Kevin van Zonneveld')
    //   returns 1: '6e658d4bfcb59cc13f96c14450ac40b9'

    let hash;
    try {
        const crypto = require("crypto");
        const md5sum = crypto.createHash("md5");
        md5sum.update(str);
        hash = md5sum.digest("hex");
    } catch (e) {
        hash = undefined;
    }

    if (hash !== undefined) {
        return hash;
    }

    const utf8Encode = require("../xml/utf8_encode");
    let xl;

const _rotateLeft = function (lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    };

const _addUnsigned = function (lX, lY) {
        let lX4, lY4, lX8, lY8, lResult;
        lX8 = lX & 0x80000000;
        lY8 = lY & 0x80000000;
        lX4 = lX & 0x40000000;
        lY4 = lY & 0x40000000;
        lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
        if (lX4 & lY4) {
            return lResult ^ 0x80000000 ^ lX8 ^ lY8;
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
            } else {
                return lResult ^ 0x40000000 ^ lX8 ^ lY8;
            }
        } else {
            return lResult ^ lX8 ^ lY8;
        }
    };

const _F = function (x, y, z) {
        return (x & y) | (~x & z);
    };
const _G = function (x, y, z) {
        return (x & z) | (y & ~z);
    };
const _H = function (x, y, z) {
        return x ^ y ^ z;
    };
const _I = function (x, y, z) {
        return y ^ (x | ~z);
    };

const _FF = function (a, b, c, d, x, s, ac) {
        a = _addUnsigned(a, _addUnsigned(_addUnsigned(_F(b, c, d), x), ac));
        return _addUnsigned(_rotateLeft(a, s), b);
    };

const _GG = function (a, b, c, d, x, s, ac) {
        a = _addUnsigned(a, _addUnsigned(_addUnsigned(_G(b, c, d), x), ac));
        return _addUnsigned(_rotateLeft(a, s), b);
    };

const _HH = function (a, b, c, d, x, s, ac) {
        a = _addUnsigned(a, _addUnsigned(_addUnsigned(_H(b, c, d), x), ac));
        return _addUnsigned(_rotateLeft(a, s), b);
    };

const _II = function (a, b, c, d, x, s, ac) {
        a = _addUnsigned(a, _addUnsigned(_addUnsigned(_I(b, c, d), x), ac));
        return _addUnsigned(_rotateLeft(a, s), b);
    };

const _convertToWordArray = function (str) {
        let lWordCount;
        const lMessageLength = str.length;
        const lNumberOfWordsTemp1 = lMessageLength + 8;
        const lNumberOfWordsTemp2 = (lNumberOfWordsTemp1 - (lNumberOfWordsTemp1 % 64)) / 64;
        const lNumberOfWords = (lNumberOfWordsTemp2 + 1) * 16;
        const lWordArray = new Array(lNumberOfWords - 1);
        let lBytePosition = 0;
        let lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition);
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    };

const _wordToHex = function (lValue) {
        let wordToHexValue = "";
        let wordToHexValueTemp = "";
        let lByte;
        let lCount;

        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            wordToHexValueTemp = "0" + lByte.toString(16);
            wordToHexValue = wordToHexValue + wordToHexValueTemp.substr(wordToHexValueTemp.length - 2, 2);
        }
        return wordToHexValue;
    };

    let x = [];
    let k;
    let AA;
    let BB;
    let CC;
    let DD;
    let a;
    let b;
    let c;
    let d;
    const S11 = 7;
    const S12 = 12;
    const S13 = 17;
    const S14 = 22;
    const S21 = 5;
    const S22 = 9;
    const S23 = 14;
    const S24 = 20;
    const S31 = 4;
    const S32 = 11;
    const S33 = 16;
    const S34 = 23;
    const S41 = 6;
    const S42 = 10;
    const S43 = 15;
    const S44 = 21;

    str = utf8Encode(str);
    x = _convertToWordArray(str);
    a = 0x67452301;
    b = 0xefcdab89;
    c = 0x98badcfe;
    d = 0x10325476;

    xl = x.length;
    for (k = 0; k < xl; k += 16) {
        AA = a;
        BB = b;
        CC = c;
        DD = d;
        a = _FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
        d = _FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
        c = _FF(c, d, a, b, x[k + 2], S13, 0x242070db);
        b = _FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
        a = _FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
        d = _FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
        c = _FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
        b = _FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
        a = _FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
        d = _FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
        c = _FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
        b = _FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
        a = _FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
        d = _FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
        c = _FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
        b = _FF(b, c, d, a, x[k + 15], S14, 0x49b40821);
        a = _GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
        d = _GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
        c = _GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
        b = _GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
        a = _GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
        d = _GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = _GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
        b = _GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
        a = _GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
        d = _GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
        c = _GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
        b = _GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
        a = _GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
        d = _GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
        c = _GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
        b = _GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
        a = _HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
        d = _HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
        c = _HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
        b = _HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
        a = _HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
        d = _HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
        c = _HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
        b = _HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
        a = _HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
        d = _HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
        c = _HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
        b = _HH(b, c, d, a, x[k + 6], S34, 0x4881d05);
        a = _HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
        d = _HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
        c = _HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
        b = _HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);
        a = _II(a, b, c, d, x[k + 0], S41, 0xf4292244);
        d = _II(d, a, b, c, x[k + 7], S42, 0x432aff97);
        c = _II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
        b = _II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
        a = _II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
        d = _II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
        c = _II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
        b = _II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
        a = _II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
        d = _II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
        c = _II(c, d, a, b, x[k + 6], S43, 0xa3014314);
        b = _II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
        a = _II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
        d = _II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
        c = _II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
        b = _II(b, c, d, a, x[k + 9], S44, 0xeb86d391);
        a = _addUnsigned(a, AA);
        b = _addUnsigned(b, BB);
        c = _addUnsigned(c, CC);
        d = _addUnsigned(d, DD);
    }

    const temp = _wordToHex(a) + _wordToHex(b) + _wordToHex(c) + _wordToHex(d);

    return temp.toLowerCase();
}

const isObject = (v) => v && typeof v === "object";

function getDifference(a, b) {
    return Object.assign(...Array.from(new Set([...Object.keys(a), ...Object.keys(b)]), (k) => ({ [k]: isObject(a[k]) && isObject(b[k]) ? getDifference(a[k], b[k]) : a[k] === b[k] })));
}

var obj1 = { prop1: 1, prop2: "foo", prop3: { prop4: 2, prop5: "bar" } },
    obj2 = { prop1: 3, prop2: "foo", prop3: { prop4: 2, prop5: "foobar" }, prop6: "new" };

console.log(getDifference(obj1, obj2));

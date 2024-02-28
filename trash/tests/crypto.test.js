const { md5, sha256, hexEncode, hexDecode, base64Encode, base64Decode } = require("../src");

test("md5 sync function", () => {
    const items = {};

    for (const key in items) {
        const val = items[key];

        expect(md5(val)).toBe(key);
    }
});

test("sha256 sync function", () => {
    const items = {};

    for (const key in items) {
        const val = items[key];

        expect(sha256(val)).toBe(key);
    }
});

test("hexEncode sync function", () => {
    const items = {};

    for (const key in items) {
        const val = items[key];

        expect(hexEncode(val)).toBe(key);
    }
});

test("hexDecode sync function", () => {
    const items = {};

    for (const key in items) {
        const val = items[key];

        expect(hexDecode(val)).toBe(key);
    }
});

test("base64Encode sync function", () => {
    const items = {};

    for (const key in items) {
        const val = items[key];

        expect(base64Encode(val)).toBe(key);
    }
});

test("base64Decode sync function", () => {
    const items = {};

    for (const key in items) {
        const val = items[key];

        expect(base64Decode(val)).toBe(key);
    }
});

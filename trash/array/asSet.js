module.exports = asSet;

function asSet(array) {
    // make it unique
    array = array.filter((value, index, self) => self.indexOf(value) === index);

    this.get = (index) => (typeof index === "number" ? array[index] : array);

    this.has = (value) => ~array.indexOf(value);

    this.add = (value) => (array.indexOf(value) > -1 ? array.slice(0) : array.concat([value]));

    this.del = (value) => {
        const index = array.indexOf(value);
        if (index > -1) array.splice(index, 1);
        return array;
    };

    return this;
}

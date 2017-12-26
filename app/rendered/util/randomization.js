
export default class Randomization {

    /**
     * Returns a whole random number in-between or at "min" and "max" values.
     * @param {Number} min
     * @param {Number} max
     * @returns {Number}
     */
    static number(min, max) {
        let n = Math.round(Math.random() * (max + 1 - min) + min);
        n = n > max ? max : n;
        n = n < min ? min : n;
        return n;
    }

    static newid() {
        return Randomization.number(1000000, 9999999).toString() +
            Math.round(new Date().getTime() * 10000 * Math.random()).toString();
    }
}
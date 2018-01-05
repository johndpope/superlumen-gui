
/**
 * Utility class that provides functions for validating and working with secure information.
 */
export default class Security {

    /**
     * @typedef {Object} StrengthRank
     * @property {String} label - The label of the level of strength.
     * @property {Number} rank - The relative strength of the password as a fraction (0-1) with 1 being the strongest.
     */

    /**
     * Evaluates the given password for strength. Returns a strength label and fractional rank (0-1). 
     * @param {String} password 
     * @returns {StrengthRank}
     */
    static strength(password) {
        let lccCount = password.replace(/[^a-z]/g, '').length;
        let uccCount = password.replace(/[^A-Z]/g, '').length;
        let numCount = password.replace(/[^0-9]/g, '').length;
        let splCount = password.replace(/[a-zA-Z\d\s]/g, '').length;
        if (!password) {
            return { label: 'None', rank: 0 };
        }
        let unqChars = [];
        for (let x = 0; x < password.length; x++) {
            if (unqChars.indexOf(password[x]) === -1) {
                unqChars.push(password[x]);
            }
        }
        // console.log(`Strength:
        //     Length: ${(password.length > 14 ? 1 : password.length / 14)}
        //     Unique: ${(unqChars.length > 14 ? 1 : unqChars.length / 14)}
        //     `);
        let strength =
            ((password.length > 14 ? 1 : password.length / 14) * 0.4) + 
            ((unqChars.length > 14 ? 1 : unqChars.length / 14) * 0.3) +
            ((
                (lccCount > 0 ? 0.25 : 0) +
                (uccCount > 0 ? 0.25 : 0) +
                (numCount > 0 ? 0.25 : 0) +
                (splCount > 0 ? 0.25 : 0)
            ) * 0.3);
        let text = '';
        if (strength <= 0.2) {
            return { label: 'None', rank: strength };
        } else if (strength <= 0.5) {
            return { label: 'Weak', rank: strength };
        } else if (strength <= 0.7) {
            return { label: 'Medium', rank: strength };
        } else if (strength <= 0.85) {
            return { label: 'Strong', rank: strength };
        } else if (strength <= 0.95) {
            return { label: 'Great', rank: strength };
        } else {
            return { label: 'Superlumenal', rank: strength };
        }
    }

}
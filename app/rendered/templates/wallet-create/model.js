
export default class WalletCreateModel {
    constructor() {
        this.password = null;
        this.keyFilePath = null;
        this.recovery = {
            enabled: true,
            questions: null,
            answers: null
        },
        this.accounts = null;
    }
}
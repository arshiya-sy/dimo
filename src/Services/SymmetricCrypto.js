const CryptoJS = require('crypto-js/core');
const PBKDF2 = require('crypto-js/pbkdf2');
const AES = require('crypto-js/aes');
const sha1 = require('sha1');

export class SymmetricCrypto {
    constructor() {
        this.keySize = 256;
        this.ivSize = 128;
        this.saltSize = 128;
        this.iterations = 1000;
        this.generateSecret();
    }

    encrypt(input, secret = this.getKeyAndIv()) {
        const key = CryptoJS.enc.Hex.parse(secret.substr(0, 64));
        const iv = CryptoJS.enc.Hex.parse(secret.substr(64, 32));

        return AES.encrypt(input, key, {
            iv: iv,
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC
        }).toString();
    }

    decrypt(input, secret = this.getKeyAndIv()) {
        const key = CryptoJS.enc.Hex.parse(secret.substr(0, 64));
        const iv = CryptoJS.enc.Hex.parse(secret.substr(64, 32));

        const decrypted = AES.decrypt(input, key, {
            iv: iv,
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC
        })
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    getKeyAndIv() {
        return `${this.key.toString()}${this.iv.toString()}`;
    }

    getSHA1String(val) {
        return sha1(val);
    }

    generateSecret(password = '') {
        const salt = CryptoJS.lib.WordArray.random(this.saltSize / 8);

        this.secret = `${password}${window.crypto.getRandomValues(new Uint32Array(1))[0]}`.substring(0, 128);
        this.key = PBKDF2(this.secret, salt, {
            keySize: this.keySize / 32,
            iterations: this.iterations
        });
        this.iv = CryptoJS.lib.WordArray.random(this.ivSize / 8);
    }
}

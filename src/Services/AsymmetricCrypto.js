import forge from 'node-forge';

export class AsymmetricCrypto {
    constructor(publicKey) {
        this.publicKey = publicKey;
        if(!this.publicKey.includes("-----BEGIN PUBLIC KEY-----")){
            this.publicKey = "-----BEGIN PUBLIC KEY-----" + this.publicKey + "-----END PUBLIC KEY-----";
        }
        this.publicCrypto = forge.pki.publicKeyFromPem(this.publicKey);
    }

    encrypt(input) {
        const encryptData = this.publicCrypto.encrypt(input, 'RSA-OAEP');
        return forge.util.encode64(encryptData);
    }
}
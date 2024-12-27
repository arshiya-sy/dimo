import forge from 'node-forge';

export class SymmetricCrypto {
    constructor() {
        this.ivSize = 128;
        this.saltSize = 128;
        this.generateSecret();
    }

    encrypt(input, secret = this.getKeyAndIv()) {
        const key = secret.key;
        const iv = secret.iv;
        let cipher = forge.cipher.createCipher('AES-GCM', key);
        cipher.start({ iv: iv});
        cipher.update(forge.util.createBuffer(input, 'utf8'));
        cipher.finish();
        const tag = cipher.mode.tag;
        return `${forge.util.encode64(cipher.output.getBytes())}${forge.util.bytesToHex(tag.getBytes())}`;
    }

    decrypt(input, secret = this.getKeyAndIv()) {
        if (input.length <= 32){
            console.log("NodeforgeSymmCrypto.decrypt received data to decrypt is less than 32 bytes.")
            return ""
        }
        const key = secret.key
        const iv = secret.iv
        const tag = input.slice(input.length - 32);
        input = input.substr(0, input.length - 32);

        let deCipher = forge.cipher.createDecipher('AES-GCM', key);
        deCipher.start({
            iv: iv,
            tag: tag,
            tagLength: 256
        });
        deCipher.update(forge.util.createBuffer(forge.util.decode64(input)));
        deCipher.finish();
        return forge.util.decodeUtf8(deCipher.output.getBytes());
    }

    getKeyAndIv() {
        return {key: this.key, iv:this.iv};
    }

    getKeyAndIvForAsym() {
        return `aes-256-gcm;${forge.util.bytesToHex(this.key)};${forge.util.bytesToHex(this.iv)}`;
    }

    generateSecret(password = '') {
        const salt = forge.random.getBytesSync(this.saltSize / 8);
        const secret = `${password}${window.crypto.getRandomValues(new Uint32Array(1))[0]}`.substring(0, 128);
        this.iv = forge.random.getBytesSync(this.ivSize / 8);
        this.key = forge.pkcs5.pbkdf2(secret, salt, 1000, 32);
    }

}

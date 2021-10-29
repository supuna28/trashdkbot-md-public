"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hkdf = exports.sha256 = exports.hmacSign = exports.aesEncrypWithIV = exports.aesEncrypt = exports.aesDecryptWithIV = exports.aesDecrypt = exports.signedKeyPair = exports.Curve = void 0;
const curve25519_wrapper_1 = __importDefault(require("libsignal/src/curve25519_wrapper"));
const crypto_1 = require("crypto");
exports.Curve = {
    generateKeyPair: () => {
        const { pubKey, privKey } = curve25519_wrapper_1.default.keyPair(crypto_1.randomBytes(32));
        return {
            private: Buffer.from(privKey),
            public: Buffer.from(pubKey)
        };
    },
    sharedKey: (privateKey, publicKey) => {
        const shared = curve25519_wrapper_1.default.sharedSecret(publicKey, privateKey);
        return Buffer.from(shared);
    },
    sign: (privateKey, buf) => (Buffer.from(curve25519_wrapper_1.default.sign(privateKey, buf))),
    verify: (pubKey, message, signature) => {
        try {
            curve25519_wrapper_1.default.verify(pubKey, message, signature);
            return true;
        }
        catch (error) {
            if (error.message.includes('Invalid')) {
                return false;
            }
            throw error;
        }
    }
};
const signedKeyPair = (keyPair, keyId) => {
    const signKeys = exports.Curve.generateKeyPair();
    const pubKey = new Uint8Array(33);
    pubKey.set([5], 0);
    pubKey.set(signKeys.public, 1);
    const signature = exports.Curve.sign(keyPair.private, pubKey);
    return { keyPair: signKeys, signature, keyId };
};
exports.signedKeyPair = signedKeyPair;
/** decrypt AES 256 CBC; where the IV is prefixed to the buffer */
function aesDecrypt(buffer, key) {
    return aesDecryptWithIV(buffer.slice(16, buffer.length), key, buffer.slice(0, 16));
}
exports.aesDecrypt = aesDecrypt;
/** decrypt AES 256 CBC */
function aesDecryptWithIV(buffer, key, IV) {
    const aes = crypto_1.createDecipheriv('aes-256-cbc', key, IV);
    return Buffer.concat([aes.update(buffer), aes.final()]);
}
exports.aesDecryptWithIV = aesDecryptWithIV;
// encrypt AES 256 CBC; where a random IV is prefixed to the buffer
function aesEncrypt(buffer, key) {
    const IV = crypto_1.randomBytes(16);
    const aes = crypto_1.createCipheriv('aes-256-cbc', key, IV);
    return Buffer.concat([IV, aes.update(buffer), aes.final()]); // prefix IV to the buffer
}
exports.aesEncrypt = aesEncrypt;
// encrypt AES 256 CBC with a given IV
function aesEncrypWithIV(buffer, key, IV) {
    const aes = crypto_1.createCipheriv('aes-256-cbc', key, IV);
    return Buffer.concat([aes.update(buffer), aes.final()]); // prefix IV to the buffer
}
exports.aesEncrypWithIV = aesEncrypWithIV;
// sign HMAC using SHA 256
function hmacSign(buffer, key, variant = 'sha256') {
    return crypto_1.createHmac(variant, key).update(buffer).digest();
}
exports.hmacSign = hmacSign;
function sha256(buffer) {
    return crypto_1.createHash('sha256').update(buffer).digest();
}
exports.sha256 = sha256;
// HKDF key expansion
// from: https://github.com/benadida/node-hkdf
function hkdf(buffer, expandedLength, { info, salt }) {
    const hashAlg = 'sha256';
    const hashLength = 32;
    salt = salt || Buffer.alloc(hashLength);
    // now we compute the PRK
    const prk = crypto_1.createHmac(hashAlg, salt).update(buffer).digest();
    let prev = Buffer.from([]);
    const buffers = [];
    const num_blocks = Math.ceil(expandedLength / hashLength);
    const infoBuff = Buffer.from(info || []);
    for (var i = 0; i < num_blocks; i++) {
        const hmac = crypto_1.createHmac(hashAlg, prk);
        // XXX is there a more optimal way to build up buffers?
        const input = Buffer.concat([
            prev,
            infoBuff,
            Buffer.from(String.fromCharCode(i + 1))
        ]);
        hmac.update(input);
        prev = hmac.digest();
        buffers.push(prev);
    }
    return Buffer.concat(buffers, expandedLength);
}
exports.hkdf = hkdf;

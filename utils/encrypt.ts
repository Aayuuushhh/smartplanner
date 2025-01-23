import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const key = "achaiwithmasalabutsecretissecret"; // 32 bytes key
const iv = crypto.randomBytes(16);


export const encrypt = (text: string) => {
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

export const encryptObject = (obj: object) => {
    const jsonString = JSON.stringify(obj);
    return encrypt(jsonString);
};
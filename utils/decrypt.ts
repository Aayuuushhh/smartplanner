import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const key = "achaiwithmasalabutsecretissecret"; 

export const decrypt = (text: string) => {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

export const decryptObject = (encryptedText: string) => {
    const decryptedString = decrypt(encryptedText);
    return JSON.parse(decryptedString);
};
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export default async function generateFingerprint() {
    // Initialize an agent at application startup.
    const fp = await FingerprintJS.load();
    
    // Get the visitor identifier when you need it.
    const result = await fp.get();
    
    // The visitor identifier:
    return result.visitorId.substring(0, 17);
}
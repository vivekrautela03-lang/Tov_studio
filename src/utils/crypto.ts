// crypto.ts
// Handles client-side end-to-end encryption (E2EE) using AES-GCM

const STATIC_SALT = "tov-studio-secret-salt-123456";

/**
 * Derives a cryptographic key from a shared channel ID
 */
async function deriveKey(channelId: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(channelId + STATIC_SALT),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("salt-tov-studio"),
      iterations: 1000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts cleartext using AES-GCM
 */
export async function encryptMessage(text: string, channelId: string): Promise<string> {
  try {
    const key = await deriveKey(channelId);
    const enc = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      enc.encode(text)
    );

    // Combine IV and Encrypted buffer to base64
    const combined = new Uint8Array(iv.byteLength + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.byteLength);

    return btoa(String.fromCharCode(...combined));
  } catch (err) {
    console.error("Encryption failed, falling back to cleartext:", err);
    return text;
  }
}

/**
 * Decrypts ciphertext using AES-GCM
 */
export async function decryptMessage(cipherBase64: string, channelId: string): Promise<string> {
  try {
    // If it doesn't look like base64, return original
    if (!/^[A-Za-z0-9+/=]+$/.test(cipherBase64)) {
      return cipherBase64;
    }

    const key = await deriveKey(channelId);
    const raw = Uint8Array.from(atob(cipherBase64), (c) => c.charCodeAt(0));
    
    // Extract IV (first 12 bytes) and ciphertext
    const iv = raw.slice(0, 12);
    const ciphertext = raw.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (err) {
    // Fallback if it was saved as cleartext originally
    return cipherBase64;
  }
}

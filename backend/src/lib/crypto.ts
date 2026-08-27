import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const keyHex = process.env.CREDENTIALS_ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error("CREDENTIALS_ENCRYPTION_KEY must be set in .env before using credentials");
  }
  const key = Buffer.from(keyHex, "hex");
  if (key.length !== 32) {
    throw new Error(
      "CREDENTIALS_ENCRYPTION_KEY must be a 32-byte key, hex-encoded (64 hex characters). " +
        "Generate one with: openssl rand -hex 32"
    );
  }
  return key;
}

// Storage format: base64(iv[12 bytes] + authTag[16 bytes] + ciphertext).
// Keeping everything a single opaque string in one DB column, rather than
// three separate columns, keeps the Credential model simple — this format
// is only ever produced/consumed by this one file.
export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, ciphertext]).toString("base64");
}

export function decrypt(payload: string): string {
  const raw = Buffer.from(payload, "base64");
  const iv = raw.subarray(0, 12);
  const authTag = raw.subarray(12, 28);
  const ciphertext = raw.subarray(28);

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString("utf8");
}

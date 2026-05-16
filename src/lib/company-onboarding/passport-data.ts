import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";

export type ManualPassportData = {
  series: string;
  number: string;
  issuedBy: string;
  issuedAt: string;
  departmentCode?: string;
};

export type EncryptedPassportData = {
  payload: string;
  iv: string;
  tag: string;
};

function encryptionKey() {
  const secret = process.env.PASSPORT_STORAGE_SECRET || process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("PASSPORT_STORAGE_SECRET or JWT_SECRET is required for passport data encryption.");
  }
  return createHash("sha256").update(secret).digest();
}

export function encryptPassportData(data: ManualPassportData): EncryptedPassportData {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data), "utf8"), cipher.final()]);
  return {
    payload: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
  };
}

export function decryptPassportData(input: EncryptedPassportData): ManualPassportData {
  const decipher = createDecipheriv(ALGORITHM, encryptionKey(), Buffer.from(input.iv, "base64"));
  decipher.setAuthTag(Buffer.from(input.tag, "base64"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(input.payload, "base64")), decipher.final()]);
  return JSON.parse(decrypted.toString("utf8")) as ManualPassportData;
}

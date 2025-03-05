import CryptoJS from "crypto-js";

// อ่านค่าคีย์จาก environment variable
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPT_KEY || "default_key";

// ฟังก์ชันเข้ารหัส
export const encryptValue = (value: string): string => {
  return CryptoJS.AES.encrypt(value, ENCRYPTION_KEY).toString();
};

// ฟังก์ชันถอดรหัส
export const decryptValue = (encryptedValue: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedValue, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const encryptEmailValue = (value: string): string => {
  const base64Encoded = Buffer.from(value).toString("base64");
  return base64Encoded;
};

export const decryptEmailValue = (encryptedValue: string): string => {
  const decodedValue = Buffer.from(encryptedValue, "base64").toString("utf-8");
  return decodedValue;
};

import { randomBytes } from "crypto";

export function generateNonce() {
  return randomBytes(16).toString("base64");
}

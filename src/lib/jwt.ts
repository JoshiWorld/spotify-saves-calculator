import { env } from "@/env";
import jwt from "jsonwebtoken";

export function generateJWT(userId: string, email: string) {
  const payload = { userId, email };
  const secret = env.JWT_SECRET;

  return jwt.sign(payload, secret, { expiresIn: "30d" });
};

import { db } from "@/server/db";

export async function generateOtp(email: string) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-stelliger Code
  await db.verificationToken.create({
    data: {
      identifier: email,
      token: otp,
      expires: new Date(Date.now() + 5 * 60 * 1000), // Gültig für 5 Minuten
    },
  });
  return otp;
}

export async function verifyOtp(email: string, otp: string) {
  const otpRecord = await db.verificationToken.findUnique({
    where: { identifier: email, token: otp },
  });

  if (!otpRecord || otpRecord.expires < new Date()) {
    return false;
  }

  // OTP löschen nach Verwendung oder nach Ablaufzeit
  await db.verificationToken.delete({
    where: { identifier: email, token: otp },
  });

  return otpRecord.token === otp;
}

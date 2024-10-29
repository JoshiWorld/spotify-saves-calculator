import nodemailer from "nodemailer";
import { env } from "@/env";

export async function sendOtpEmail(email: string, otp: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const transporter = nodemailer.createTransport({
    host: env.EMAIL_SERVER_HOST,
    port: Number(env.EMAIL_SERVER_PORT),
    auth: {
      user: env.EMAIL_SERVER_USER,
      pass: env.EMAIL_SERVER_PASSWORD,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  await transporter.sendMail({
    from: `SmartSavvy <${env.EMAIL_FROM}>`,
    to: email,
    subject: "Ihr Einmal-Passcode (OTP) für den Login",
    text: `Ihr OTP für den Login lautet: ${otp}`,
  });
}

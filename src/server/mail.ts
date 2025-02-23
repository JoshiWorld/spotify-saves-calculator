import nodemailer from "nodemailer";
import { env } from "@/env";
import * as fs from "fs/promises";
import * as path from "path";

async function readEmailTemplate(templateName: string): Promise<string> {
  const templatePath = path.join(process.cwd(), "src", "emails", templateName);
  try {
    return await fs.readFile(templatePath, { encoding: "utf-8" });
  } catch (error) {
    console.error(
      `Fehler beim Lesen der Template-Datei ${templateName}:`,
      error,
    );
    throw new Error(
      `Template-Datei ${templateName} konnte nicht gelesen werden.`,
    );
  }
}

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

  const htmlTemplate = await readEmailTemplate("otp-email.html");
  const html = htmlTemplate.replace("{otp}", otp);

  await transporter.sendMail({
    from: `SmartSavvy <${env.EMAIL_FROM}>`,
    to: email,
    subject: "Ihr Einmal-Passcode (OTP) für den Login",
    html: html,
  });
}

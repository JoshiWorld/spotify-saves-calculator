import { env } from "@/env";
import { api } from "@/trpc/server";
import { LogType } from "@prisma/client";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  // @ts-expect-error || @ts-ignore
  host: env.EMAIL_SERVER_HOST,
  port: env.EMAIL_SERVER_PORT,
  secure: true,
  auth: {
    user: env.EMAIL_SERVER_USER,
    pass: env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendConfirmationEmail(email: string, firstName: string) {
  const mailOptions = {
    from: env.EMAIL_FROM,
    to: email,
    subject: "Kauf erfolgreich – Zugriff auf die Webseite",
    text: `Hallo ${firstName},\n\nDein Kauf war erfolgreich! Du kannst dich mit Deiner E-Mail-Adresse (${email}) auf unserer Webseite (smartsavvy.eu) anmelden.\n\nVielen Dank für Dein Vertrauen.\n\nDein SmartSavvy-Team`,
    html: `<p>Hallo ${firstName},</p><p>Dein Kauf war erfolgreich! Du kannst dich mit Deiner E-Mail-Adresse (<b>${email}</b>) auf unserer Webseite (<a href="https://smartsavvy.eu/login">SmartSavvy</a>) anmelden.</p><p>Vielen Dank für Dein Vertrauen.</p><p>Dein SmartSavvy-Team</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("E-Mail erfolgreich gesendet an:", email);
  } catch (error) {
    // @ts-expect-error || @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    await api.log.create({ message: error.toString(), logtype: LogType.ERROR });
    console.error("Fehler beim Senden der E-Mail:", error);
  }
}
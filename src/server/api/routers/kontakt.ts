import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import nodemailer from "nodemailer";
import { env } from "@/env";
import * as fs from "fs/promises";
import * as path from "path";

async function readEmailTemplate(templateName: string): Promise<string> {
  const templatePath = path.join(process.cwd(), "src", "emails", "kontakt", templateName);
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

export const kontaktRouter = createTRPCRouter({
  send: publicProcedure
    .input(
      z.object({
        name: z.string().min(2),
        surname: z.string().min(2),
        email: z.string().min(2).email(),
        content: z.string().min(50),
      }),
    )
    .mutation(async ({ input }) => {
      const { name, surname, email, content } = input;

      const customerMailSent = await sendCustomerMail(
        name,
        surname,
        email,
        content,
      );
      const supportMailSent = await sendSupportMail(
        name,
        surname,
        email,
        content,
      );

      if (
        customerMailSent.response !== "250 Ok" ||
        supportMailSent.response !== "250 Ok"
      ) {
        throw Error(
          `Fehler beim Senden der E-Mails. Customer-Mail=${customerMailSent.response}&Support-Mail=${supportMailSent.response}`,
        );
      }

      return true;
    }),
});

async function sendCustomerMail(
  name: string,
  surname: string,
  email: string,
  content: string,
) {
  try {
    const transporter = nodemailer.createTransport({
      host: env.EMAIL_SERVER_HOST,
      port: Number(env.EMAIL_SERVER_PORT),
      auth: {
        user: env.EMAIL_SERVER_USER,
        pass: env.EMAIL_SERVER_PASSWORD,
      },
    });

    const htmlTemplate = await readEmailTemplate("customer-email.html");
    const html = htmlTemplate
      .replace("{name}", name)
      .replace("{surname}", surname)
      .replace("{email}", email)
      .replace("{content}", content);

    return await transporter.sendMail({
      from: `SmartSavvy <${env.EMAIL_FROM}>`,
      to: email,
      subject: "Kontaktanfrage eingegangen",
      html: html,
    });
  } catch (error) {
    console.error("Fehler beim Senden der Kunden-E-Mail:", error);
    throw new Error("Kunden-E-Mail konnte nicht gesendet werden.");
  }
}

async function sendSupportMail(
  name: string,
  surname: string,
  email: string,
  content: string,
) {
  try {
    const transporter = nodemailer.createTransport({
      host: env.EMAIL_SERVER_HOST,
      port: Number(env.EMAIL_SERVER_PORT),
      auth: {
        user: env.EMAIL_SERVER_USER,
        pass: env.EMAIL_SERVER_PASSWORD,
      },
    });

    const htmlTemplate = await readEmailTemplate("support-email.html");
    const html = htmlTemplate
      .replace("{name}", name)
      .replace("{surname}", surname)
      .replace("{email}", email)
      .replace("{content}", content);

    return await transporter.sendMail({
      from: `SmartSavvy <${env.EMAIL_FROM}>`,
      to: "support@smartsavvy.eu",
      subject: `Kontakt - ${name} ${surname}`,
      html: html,
    });
  } catch (error) {
    console.error("Fehler beim Senden der Support-E-Mail:", error);
    throw new Error("Support-E-Mail konnte nicht gesendet werden.");
  }
}
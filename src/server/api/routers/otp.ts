import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { generateOtp } from "@/server/otp";
import { sendOtpEmail } from "@/server/mail";

export const otpRouter = createTRPCRouter({
  sendOTP: publicProcedure
    .input(
      z.object({
        email: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const otp = await generateOtp(input.email);

      return sendOtpEmail(input.email, otp);
    }),
});

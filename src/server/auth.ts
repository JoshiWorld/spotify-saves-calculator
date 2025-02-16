import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { v4 as uuid } from "uuid";
import { env } from "@/env";
import { db } from "@/server/db";
import { verifyOtp } from "./otp";
import { encode as defaultEncode } from "next-auth/jwt";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */

const adapter = PrismaAdapter(db) as Adapter;

export const authOptions: NextAuthOptions = {
  // debug: true,
  callbacks: {
    async session({ session, user }) {
      if (user) {
        session.user.id = user.id;
      }
      return session;
    },
    // session: ({ session, user }) => ({
    //   ...session,
    //   user: {
    //     ...session.user,
    //     id: user.id,
    //   },
    // }),
    async jwt({ token, user, account }) {
      if (account?.provider === "credentials") {
        token.credentials = true;
      }
      return token;
    },
    async signIn({ user, account }) {
      if (!user.email || !account) return false;

      const currentUser = await db.user.findUnique({
        where: {
          email: user.email,
        },
        select: {
          id: true,
        },
      });

      if (!currentUser) {
        return true;
      }

      const accounts = await db.account.findMany({
        where: {
          user: { id: currentUser.id },
        },
        select: {
          provider: true,
        },
      });

      if (
        !accounts ||
        accounts.length === 0 ||
        !accounts.some((a) => a.provider === account.provider)
      ) {
        await db.account.create({
          data: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            type: account.type,
            access_token: account.access_token,
            expires_at: account.expires_at,
            user: { connect: { id: currentUser.id } },
            refresh_token: account.refresh_token,
            id_token: account.id_token,
            scope: account.scope,
            session_state: account.session_state,
            token_type: account.token_type,
          },
        });
      }

      return true;
    },
  },
  pages: {
    signOut: "/app/logout",
    signIn: "/login",
    verifyRequest: "/auth/verify",
  },
  session: {
    strategy: "database",
  },
  adapter,
  secret: env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    EmailProvider({
      server: {
        host: env.EMAIL_SERVER_HOST,
        port: Number(env.EMAIL_SERVER_PORT),
        auth: {
          user: env.EMAIL_SERVER_USER,
          pass: env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: `SmartSavvy <${process.env.EMAIL_FROM}>`,
    }),
    CredentialsProvider({
      name: "OTP Login",
      credentials: {
        email: {
          label: "E-Mail",
          type: "text",
          placeholder: "max.mustermann@email.de",
        },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const { email, otp } = credentials;

        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
          },
        });

        if (!user) {
          const createdUser = await db.user.create({
            data: {
              email,
              emailVerified: new Date(),
              name: email,
            },
          });

          if(!createdUser) {
            throw new Error("Benutzer nicht gefunden.");
          }

          const isOtpValid = await verifyOtp(email, otp);
          if (!isOtpValid) {
            throw new Error("Ungültiger OTP.");
          }

          return { id: createdUser.id, email: createdUser.email };
        }

        const isOtpValid = await verifyOtp(email, otp);
        if (!isOtpValid) {
          throw new Error("Ungültiger OTP.");
        }

        return { id: user.id, email: user.email };
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  jwt: {
    encode: async function (params) {
      if (params.token?.credentials) {
        const sessionToken = uuid();

        if (!params.token.sub) {
          throw new Error("No user ID found in token");
        }

        const createdSession = await adapter?.createSession?.({
          sessionToken: sessionToken,
          userId: params.token.sub,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });

        if (!createdSession) {
          throw new Error("Failed to create session");
        }

        return sessionToken;
      }
      return defaultEncode(params);
    },
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);

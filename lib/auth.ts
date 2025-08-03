// lib/auth.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        mobile: { label: "Mobile", type: "text" },
      },
      async authorize(credentials) {
        if ((!credentials?.email && !credentials?.mobile) || !credentials?.password) {
          throw new Error("Email or mobile and password are required");
        }

        const filters: any[] = [];
        if (credentials.email) filters.push({ email: credentials.email.toLowerCase() });
        if (credentials.mobile) filters.push({ mobile: credentials.mobile });

        const user = await prisma.user.findFirst({
          where: { OR: filters },
        });

        if (!user) {
          throw new Error("Invalid credentials");
        }

        if (!user.password) {
            throw new Error("Invalid credentials");
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error("Invalid credentials");
          }


        return {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          image: user.image || undefined,
          isAdmin: user.isAdmin,
        } as any;
      },
    }),
  ],
  callbacks: {
    /**
     * OAuth signIn handler:
     * - If user exists → link account if needed
     * - If not → redirect to signup page to collect required fields
     */
    async signIn({ user, account }) {
      if (account && (account.provider === "google" || account.provider === "apple")) {
        if (!user.email) return false; // No email → block

        const normalizedEmail = user.email.toLowerCase();
        const existingUser = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (existingUser) {
          // Link account if not already linked
          const existingAccount = await prisma.account.findFirst({
            where: {
              provider: account.provider,
              providerAccountId: account.providerAccountId!,
            },
          });

          if (!existingAccount) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type ?? "oauth",
                provider: account.provider,
                providerAccountId: account.providerAccountId!,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at ?? undefined,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
            });
          }

          (user as any).id = existingUser.id;
          return true;
        } else {
          // Redirect new OAuth users to signup to fill password & mobile
          return `/signup?email=${encodeURIComponent(user.email)}`;
        }
      }

      return true; // Credentials login or other providers
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.mobile = (user as any).mobile;
        token.isAdmin = (user as any).isAdmin;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.mobile = token.mobile as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return url;
      try {
        const dest = new URL(url);
        if (dest.origin === baseUrl) return url;
      } catch {}
      return baseUrl;
    },
  },
};

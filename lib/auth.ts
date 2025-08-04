import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { NextAuthOptions, User } from "next-auth";

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

  const filters: { email?: string; mobile?: string }[] = [];
  if (credentials.email) filters.push({ email: credentials.email.toLowerCase() });
  if (credentials.mobile) filters.push({ mobile: credentials.mobile });

  const user = await prisma.user.findFirst({
    where: { OR: filters },
  });

  if (!user || !user.password) {
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
    image: user.image ?? undefined,
    mobile: user.mobile ?? undefined,
    isAdmin: user.isAdmin ?? false, // Always return a boolean
  };
}

    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account && account.provider === "google") {
        if (!user.email) return false;

        const normalizedEmail = user.email.toLowerCase();
        const existingUser = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (existingUser) {
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

          return true;
        } else {
          return `/signup?email=${encodeURIComponent(user.email)}`;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        // Fetch full user details from DB
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.mobile = dbUser.mobile ?? "";
          token.isAdmin = dbUser.isAdmin ?? false; // always boolean
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.mobile = token.mobile as string;
        session.user.isAdmin = (token.isAdmin as boolean) ?? false;
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

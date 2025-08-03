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
        mobile: { label: "Mobile", type: "text" }, // Add mobile for credentials
      },
      async authorize(credentials) {
        // Ensure that either email or mobile is provided, and that password is provided
        if ((!credentials?.email && !credentials?.mobile) || !credentials?.password) {
          throw new Error("Email or mobile and password are required");
        }

        // Query the user based on email or mobile
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.email },
              { mobile: credentials.mobile },
            ],
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        // Compare the password hash with the provided password
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        // Return user object with necessary details
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile, // Return mobile number along with other details
          image: user.image || undefined,
          isAdmin: user.isAdmin || false, // Return isAdmin status from user
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login", // Show error on login page
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.mobile = user.mobile;  // Include mobile in the JWT
        token.isAdmin = user.isAdmin; // Include isAdmin in JWT
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.mobile = token.mobile as string;  // Include mobile in session
        session.user.isAdmin = token.isAdmin as boolean; // Include isAdmin in session
      }
      return session;
    },
  },
};


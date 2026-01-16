// src/lib/auth.ts
import { NextAuthOptions, Profile } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { Connect } from "@/dbConfig/dbConfig";
import bcrypt from "bcrypt";
import UserMovie from "@/app/models/userModel";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
    };
  }
  interface User {
    id?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}

const validateEnvVars = () => {
  const requiredVars = ["GOOGLE_CLIENT_ID", "GOOGLE_SECRET", "NEXTAUTH_SECRET"];
  const missingVars = requiredVars.filter((key) => !process.env[key]);
  if (missingVars.length > 0) {
    throw new Error(`Missing environment variables: ${missingVars.join(", ")}`);
  }
};

validateEnvVars();

export const authOptions: NextAuthOptions = {
  jwt: { maxAge: 24 * 60 * 60 },
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }
        await Connect();
        const existingUser = await UserMovie.findOne({
          Email: credentials.email,
        });
        if (!existingUser) throw new Error("Invalid email or password.");

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          existingUser.Password
        );
        if (!isPasswordValid) throw new Error("Invalid email or password.");

        return {
          id: existingUser._id,
          email: existingUser.Email,
          name: existingUser.Name,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        try {
          await Connect();
          const { email, name } = profile as Profile;
          if (!email) throw new Error("No email found");
          let user = await UserMovie.findOne({ Email: email });
          if (!user) {
            const hashPass = await bcrypt.hash(email + Date.now(), 10);
            user = await UserMovie.create({
              Email: email,
              Name: name || "",
              Password: hashPass,
            });
          }
          return true;
        } catch (error) {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.id) session.user = { ...session.user, id: token.id as string };
      return session;
    },
  },
  pages: { signIn: "/login", error: "/error" },
};

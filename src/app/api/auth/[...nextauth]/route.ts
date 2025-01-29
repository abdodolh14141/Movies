import NextAuth, { NextAuthOptions, Profile } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { Connect } from "@/dbConfig/dbConfig";
import bcrypt from "bcrypt";
import User from "@/app/models/userModel";
import { JWT } from "next-auth/jwt";

// Type extensions for NextAuth
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

// Validate environment variables
const validateEnvVars = () => {
  const requiredVars = ["GOOGLE_CLIENT_ID", "GOOGLE_SECRET", "NEXTAUTH_SECRET"];
  const missingVars = requiredVars.filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    throw new Error(`Missing environment variables: ${missingVars.join(", ")}`);
  }
};

// Database connection wrapper
const ensureDatabaseConnection = async () => {
  try {
    await Connect();
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Database connection failed");
  }
};

const authOptions: NextAuthOptions = {
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
      authorize: async (credentials) => {
        try {
          await ensureDatabaseConnection();

          const { email, password } = credentials || {};

          if (!email || !password) {
            throw new Error("Email and password are required");
          }

          // Find the user by email
          const user = await User.findOne({ Email: email }); // Ensure email field matches DB
          if (!user) throw new Error("Invalid credentials");

          // Compare the provided password with the hashed password in the DB
          const isValid = await bcrypt.compare(password, user.Password); // Await this
          if (!isValid) throw new Error("Invalid credentials");

          // Return user data for the session
          return {
            id: user._id.toString(),
            email: user.Email,
            name: user.Name,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        try {
          await ensureDatabaseConnection();

          const { email, name } = profile as Profile;
          if (!email) throw new Error("No email found in profile");

          let user = await User.findOne({ Email: email });

          if (!user) {
            const hashPass = await bcrypt.hash(email + Date.now(), 10);
            user = await User.create({
              Email: email,
              Name: name || "",
              Password: hashPass,
            });
          }

          return true;
        } catch (error) {
          console.error("Google sign-in error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user = {
          ...session.user,
          id: token.id,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  events: {
    async signIn({ user }) {
      console.log(`User ${user.email} signed in`);
    },
    async signOut({ token }) {
      console.log(`User ${token.email} signed out`);
    },
  },
};

// Validate environment variables before initialization
validateEnvVars();

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST, authOptions };

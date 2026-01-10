import NextAuth, { NextAuthOptions, Profile } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { Connect } from "@/dbConfig/dbConfig";
import bcrypt from "bcrypt";
import UserMovie from "@/app/models/userModel";

// Type extensions for NextAuth to add custom properties
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

/**
 * Validates required environment variables.
 * Throws an error if any required variables are missing.
 */
const validateEnvVars = () => {
  const requiredVars = ["GOOGLE_CLIENT_ID", "GOOGLE_SECRET", "NEXTAUTH_SECRET"];
  const missingVars = requiredVars.filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    throw new Error(`Missing environment variables: ${missingVars.join(", ")}`);
  }
};

/**
 * NextAuth configuration options.
 */
const authOptions: NextAuthOptions = {
  jwt: {
    maxAge: 60 * 60, // 1 hour
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour
  },
  providers: [
    // Google OAuth provider
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
    // Credentials provider for email/password authentication
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "Enter Your Email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter Your Password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        try {
          await Connect(); // Connect to the database

          // Check if the user exists
          const existingUser = await UserMovie.findOne({
            Email: credentials.email,
          });
          if (!existingUser) {
            throw new Error("Invalid email or password.");
          }

          // Validate the password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            existingUser.Password
          );
          if (!isPasswordValid) {
            throw new Error("Invalid email or password.");
          }

          // Return the user object for JWT
          return {
            id: existingUser._id,
            email: existingUser.Email,
            name: existingUser.Name,
          };
        } catch (error: any) {
          throw new Error(`Authorization failed: ${error.message}`);
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET, // Secret for signing tokens
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  jwt: {
    maxAge: 24 * 60 * 60, // JWT expires in 24 hours
  },
  callbacks: {
    // Handle user sign-in
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        try {
          await Connect(); // Connect to the database

          const { email, name } = profile as Profile;
          if (!email) throw new Error("No email found in profile");

          // Check if the user already exists
          let user = await UserMovie.findOne({ Email: email });

          // If the user doesn't exist, create a new user
          if (!user) {
            const hashPass = await bcrypt.hash(email + Date.now(), 10); // Hash a temporary password
            user = await UserMovie.create({
              Email: email,
              Name: name || "",
              Password: hashPass,
            });
          }

          return true; // Allow sign-in
        } catch (error: any) {
          console.error("Google sign-in error:", error);
          return false; // Deny sign-in
        }
      }
      return true; // Allow sign-in for other providers
    },
    // Add user ID to the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // Add user ID to the session
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
    signIn: "/login", // Custom sign-in page
    error: "/error",
  },
  events: {
    // Log user sign-in events
    async signIn({ user }) {
      console.log(`User ${user.email} signed in`);
    },
    // Log user sign-out events
    async signOut({ token }) {
      console.log(`User ${token.email} signed out`);
    },
  },
};

// Validate environment variables before initializing NextAuth
validateEnvVars();

// Export NextAuth handler for GET and POST requests
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST, authOptions };

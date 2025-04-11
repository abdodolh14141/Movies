"use client";

import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";

interface FormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const router = useRouter();

  // Handle form submission for credentials sign-in
  const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    try {
      const resData = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false, // Prevent automatic redirection
      });

      if (resData?.ok) {
        toast.success("Successfully logged in!");
        router.push("/"); // Redirect to home page
      } else {
        toast.error("Invalid credentials, please try again.");
      }
    } catch (error: any) {
      toast.error(error);
    }
  };

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { redirect: false });
      toast.success("Redirecting to Google sign-in...");
    } catch (error: any) {
      toast.error("Failed to initiate Google sign-in.");
    }
  };

  // Check if the user is already logged in
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const session = await getSession();
        if (session?.user) {
          router.replace("/"); // Redirect to home page if already logged in
        }
      } catch (error: any) {
        console.error("Session check error:", error);
        toast.error(error);
      }
    };
    checkLogin();
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen shadow-2xl">
      <Toaster position="top-center" /> {/* Toast notifications */}
      <div className="p-6 max-w-7xl w-full bg-white rounded-lg shadow-md transform transition-all duration-500 hover:scale-110 hover:shadow-2xl">
        <h1 className="text-4xl font-bold text-black text-center mb-2">
          Login
        </h1>

        <div className="max-w-5xl w-full bg-white rounded-lg shadow-md mx-auto p-4">
          {/* Credentials Sign-In Form */}
          <form onSubmit={handleSubmit} className="p-4 m-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full p-3 m-3 border text-black rounded-md focus:outline-none focus:border-blue-500"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full p-3 border m-3 text-black rounded-md focus:outline-none focus:border-blue-500"
              required
            />
            <button
              type="submit"
              className="w-full p-3 m-3 bg-blue-500 text-white cursor-pointer font-semibold rounded-md hover:bg-blue-600 transition duration-200"
            >
              Sign In
            </button>
          </form>

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            className=" mx-auto p-3 m-3 bg-red-500 text-white cursor-pointer font-semibold rounded-md hover:bg-red-600 transition duration-200"
          >
            Sign In with Google
          </button>

          {/* Additional Links */}
          <div className="p-2 flex text-green-600 text-lg justify-around">
            <Link href="/signIn">I Don't Have an Account</Link>
            <Link href="/resetPassword">Forgot Password?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

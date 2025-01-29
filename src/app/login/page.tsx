"use client";

import React, { useState } from "react";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";
import { signIn } from "next-auth/react";

interface UserLogin {
  email: string;
  password: string;
}

export default function Login() {
  const [user, setUser] = useState<UserLogin>({
    email: "",
    password: "",
  });

  const router = useRouter();

  // Handles traditional email/password sign-up
  const onSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await signIn("credentials", {
        email: user.email,
        password: user.password,
        redirect: false,
      });

      if (res?.status === 200) {
        toast.success("Successfully signed up!");
        router.push("/");
      } else {
        toast.error("Sign-up failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Error during sign-up:", error);
      toast.error(error || "Error connecting to the server.");
    }
  };

  // Handles input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  // Handles Google Sign-In success
  const handleGoogleSuccess = async (response: any) => {
    try {
      // Sign in using NextAuth's Google provider
      const result = await signIn("google", {
        callbackUrl: "/", // Redirect to home page after sign-in
        redirect: false, // We want to handle redirection manually
      });

      if (result?.ok) {
        toast.success("Successfully signed in with Google!");
        router.push(result?.url || "/movies");
      }
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
      toast.error("Google Sign-In failed. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Toaster />
      <div className="w-full max-w-5xl p-8 rounded-lg text-black shadow-md transform transition-all duration-500 hover:scale-105 hover:shadow-xl bg-gradient-to-r from-blue-500 to-purple-600">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Login</h1>
        </header>
        <form onSubmit={onSignUp} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter Your Email"
              value={user.email}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter Your Password"
              value={user.password}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300"
          >
            Login
          </button>
        </form>
        <div className="mt-6 text-center">
          <div className="w-full py-2 px- text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300">
            <button
              onClick={handleGoogleSuccess}
              className="p-3 cursor-pointer hover:scale-125"
            >
              <img
                src="https://img.icons8.com/?size=100&id=EgRndDDLh8kS&format=png&color=000000"
                alt="image gmail"
                width={50}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

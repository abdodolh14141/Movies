"use client";

import React, { useState } from "react";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";
import { signIn } from "next-auth/react";

interface UserLogin {
  name: string;
  email: string;
  age: number;
  password: string;
}

export default function SignIn() {
  const [user, setUser] = useState<UserLogin>({
    name: "",
    email: "",
    age: 18,
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  // Handles traditional email/password sign-up
  const onSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post("/api/users/register", user);

      if (res.data.success) {
        toast.success(res.data.message);
        router.push("/login");
      } else {
        toast.error(res.data.message || "Sign-up failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Error during sign-up:", error);
      toast.error(
        error.response?.data?.message || "Error connecting to the server."
      );
    } finally {
      setIsLoading(false);
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
      const { credential } = response;

      // Sign in using NextAuth's Google provider
      const result = await signIn("google", {
        credential,
        callbackUrl: "/",
        redirect: false,
      });

      if (result?.ok) {
        toast.success("Successfully signed in with Google!");
        router.push(result?.url || "/movies");
      } else {
        toast.error("Google Sign-In failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
      toast.error("Google Sign-In failed. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Toaster />
      <div className="w-full max-w-7xl p-8 rounded-lg shadow-lg bg-white">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Sign Up</h1>
        </header>
        <form onSubmit={onSignUp} className="space-y-6 text-black">
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
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Enter Your Name"
              value={user.name}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              required
            />
          </div>
          <div>
            <label
              htmlFor="age"
              className="block text-sm font-medium text-gray-700"
            >
              Age
            </label>
            <input
              type="number"
              name="age"
              id="age"
              placeholder="Enter Your Age"
              min={18}
              max={60}
              value={user.age}
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
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300"
          >
            {isLoading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <div id="googleSignInButton" className="w-full">
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

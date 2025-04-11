"use client";

import axios from "axios";
import { useState } from "react";
import { toast, Toaster } from "sonner";

interface FormData {
  Name: string;
  Email: string;
  Message: string;
}
export default function About() {
  const [formData, setFormData] = useState<FormData>({
    Name: "",
    Email: "",
    Message: "",
  });

  interface ResponseData {
    data: any;
  }

  const ResConact = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    try {
      const resData: ResponseData = await axios.post(
        "/api/users/contact",
        formData
      );
      if (resData.data.success) {
        toast.success("Message sent successfully!");
        setFormData({
          Name: "",
          Email: "",
          Message: "",
        });
      } else {
        toast.error("Something went wrong, please try again later.");
      }
    } catch (error) {
      toast.error("Something went wrong, please try again later.");
    }
  };
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        {/* About Section */}
        <div className=" border-2 bg-white p-8 rounded-lg shadow-lg transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
          <h1 className="text-center text-4xl font-bold text-gray-800 mb-6">
            About This Project
          </h1>
          <p className="text-lg text-gray-700 mb-4">
            This is a modern web application designed to showcase movies and
            provide detailed information about them. It demonstrates the
            integration of advanced technologies like <strong>Next.js</strong>,{" "}
            <strong>TypeScript</strong>, and <strong>NextAuth.js</strong> for
            authentication, along with <strong>Mongoose</strong> for database
            management and <strong>Tailwind CSS</strong> for styling.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            The app supports authentication via email/password and Google,
            ensuring secure access to protected routes. It also provides a
            seamless user experience with responsive design and modern UI
            components.
          </p>
          {/* Tech Stack Section */}
          <div className="bg-white border-2 border-gray-200 p-8 rounded-lg shadow-lg mt-8 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Technologies Used
            </h2>
            <ul className="list-disc list-inside text-lg text-gray-700">
              <li className="mb-2">
                <strong>Next.js</strong> - A React framework for server-side
                rendering and static site generation.
              </li>
              <li className="mb-2">
                <strong>TypeScript</strong> - A typed superset of JavaScript
                that improves code quality and developer productivity.
              </li>
              <li className="mb-2">
                <strong>Mongoose</strong> - An ODM (Object Data Modeling)
                library for MongoDB, used for database management.
              </li>
              <li className="mb-2">
                <strong>Tailwind CSS</strong> - A utility-first CSS framework
                for building modern and responsive designs.
              </li>
              <li className="mb-2">
                <strong>NextAuth.js</strong> - A complete authentication
                solution for Next.js applications.
              </li>
            </ul>
          </div>

          {/* Features Section */}
          <div className="bg-white border-2 border-gray-200 p-8 rounded-lg shadow-lg mt-8 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Key Features
            </h2>
            <ul className="list-disc list-inside text-lg text-gray-700">
              <li className="mb-2">
                User authentication with email/password and Google.
              </li>
              <li className="mb-2">
                Protected routes for authenticated users only.
              </li>
              <li className="mb-2">
                Modern and responsive UI built with Tailwind CSS.
              </li>
              <li className="mb-2">
                Database integration using Mongoose for storing user and movie
                data.
              </li>
              <li className="mb-2">
                Detailed movie information, including ratings, reviews, and
                trailers.
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto bg-white border border-gray-200 p-8 rounded-lg shadow-lg mt-8 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Contact Us
          </h2>
          <p className="text-gray-600 mb-6">
            For any queries or feedback, please reach out to us.
          </p>
          <form onSubmit={ResConact}>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-gray-700 font-medium mb-2"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Name"
                onChange={(e) =>
                  setFormData({ ...formData, Name: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Email"
                onChange={(e) =>
                  setFormData({ ...formData, Email: e.target.value })
                }
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="message"
                className="block text-gray-700 font-medium mb-2"
              >
                Message
              </label>
              <textarea
                id="message"
                className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Message"
                onChange={(e) =>
                  setFormData({ ...formData, Message: e.target.value })
                }
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-300"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import axios from "axios";
import { useState } from "react";
import { toast, Toaster } from "sonner";
// Tip: Install 'lucide-react' for these icons
import { Code2, Zap, ShieldCheck, Mail, Send } from "lucide-react";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data } = await axios.post("/api/users/contact", formData);
      if (data.success) {
        toast.success("Message sent successfully!");
        setFormData({ Name: "", Email: "", Message: "" });
      }
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Toaster richColors position="top-center" />

      {/* Hero Section */}
      <section className="border-b border-gray-200 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold text-white mb-6 tracking-tight">
            About This <span className="text-blue-600">Project</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            A modern movie discovery platform built to showcase the power of
            full-stack development with{" "}
            <span className="font-semibold text-gray-800">Next.js 14</span>.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-10 space-y-12">
        {/* Tech & Features Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Tech Stack Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-hover hover:shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <Code2 className="text-blue-600 w-8 h-8" />
              <h2 className="text-2xl font-bold text-gray-800">Tech Stack</h2>
            </div>
            <ul className="space-y-4">
              {[
                { label: "Next.js", desc: "React Framework for SSR & Edge" },
                { label: "TypeScript", desc: "Type-safe development" },
                { label: "Mongoose", desc: "MongoDB object modeling" },
                { label: "NextAuth", desc: "Secure authentication" },
              ].map((tech) => (
                <li key={tech.label} className="flex flex-col">
                  <span className="font-bold text-gray-900">{tech.label}</span>
                  <span className="text-gray-500 text-sm">{tech.desc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Features Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-hover hover:shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="text-amber-500 w-8 h-8" />
              <h2 className="text-2xl font-bold text-gray-800">Key Features</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <ShieldCheck className="text-green-600 w-5 h-5 mt-1" />
                <p className="text-gray-700">
                  Google & Email Auth via NextAuth
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <ShieldCheck className="text-green-600 w-5 h-5 mt-1" />
                <p className="text-gray-700">Responsive UI with Tailwind CSS</p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <ShieldCheck className="text-green-600 w-5 h-5 mt-1" />
                <p className="text-gray-700">Dynamic Movie Data & Trailers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="max-w-8xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-blue-600 p-8 text-white text-center">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-3xl font-bold">Get In Touch</h2>
            <p className="opacity-90">
              Questions or feedback? We'd love to hear from you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Name
                </label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-black"
                  placeholder="John Doe"
                  value={formData.Name}
                  onChange={(e) =>
                    setFormData({ ...formData, Name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  required
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-black"
                  placeholder="john@example.com"
                  value={formData.Email}
                  onChange={(e) =>
                    setFormData({ ...formData, Email: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Message
              </label>
              <textarea
                required
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-black"
                placeholder="How can we help?"
                value={formData.Message}
                onChange={(e) =>
                  setFormData({ ...formData, Message: e.target.value })
                }
              ></textarea>
            </div>
            <button
              disabled={isSubmitting}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  Send Message <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

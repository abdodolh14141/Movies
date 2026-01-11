import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Provider from "@/context/Provider";
import { getServerSession } from "next-auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Improves performance by showing fallback font first
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Better metadata for SEO and deployment
export const metadata: Metadata = {
  title: "Movie App | Discover Your Favorites",
  description: "A professional movie database and tracking application.",
};

// Ensures the theme colors look right on mobile browsers
export const viewport: Viewport = {
  themeColor: "#111827", // Matches bg-gray-900
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased transition-colors duration-300`}
      >
        {/* Note: Removed GoogleOAuthProvider. 
            NextAuth handles Google login via your /api/auth routes.
            'Provider' should contain the NextAuth SessionProvider.
        */}
        <Provider session={session}>
          <div className="flex flex-col min-h-screen">
            <Nav />
            <main className="flex-grow">{children}</main>
          </div>
        </Provider>
      </body>
    </html>
  );
}

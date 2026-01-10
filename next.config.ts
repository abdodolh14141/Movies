// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... other configurations you may have (like compiler, output, etc.)

  images: {
    // List all external domains from which you will load images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "m.media-amazon.com", // <--- This is the key fix
        port: "",
        pathname: "/**", // Allows any path on this domain
      },
    ],
    // OR, for older Next.js versions (less preferred but still works):
    // domains: ['m.media-amazon.com'],
  },
};

module.exports = nextConfig;

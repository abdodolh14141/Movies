🎬 Movies Platform
A high-performance, full-stack web application for discovering and managing modern movies. Built with the latest Next.js 15 App Router features and a focus on sleek user experience.

✨ Features
Dynamic Movie Discovery: Real-time data fetching from the OMDB API with optimized performance using React Hooks.

Secure Authentication: Comprehensive auth system powered by NextAuth.js, featuring:

Email/Password credentials.

One-click Google OAuth integration.

Secure session management and password hashing with Bcrypt.

Rich Details: Deep-dive into movie specifics including plot summaries, ratings, and view counts.

Modern UI/UX:

Fully Responsive: Crafted with Tailwind CSS for a seamless experience on mobile, tablet, and desktop.

Fluid Animations: Enhanced with Framer Motion for premium-feel transitions.

## Tech Stack

- **Frontend**
  - Next.js 15.0.2
  - React 19.0.0
  - Tailwind CSS
  - Use framer-motion for animation

- **Backend**
  - MongoDB with Mongoose
  - NextAuth.js for authentication
  - Tybescribt

- **Authentication**
  - NextAuth.js
  - Google OAuth
  - Bcrypt for password hashing

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with the following variables:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_SECRET=your_google_secret
   NEXTAUTH_SECRET=your_nextauth_secret
   URL_MONGO=your_mongodb_connection_string
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # Reusable components
│   ├── models/           # MongoDB models
│   └── ...               # Other app features
├── context/              # React context providers
├── dbConfig/            # Database configuration
└── ...                  # Other project files
```

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

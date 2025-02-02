export default function About() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
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
        </div>

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
              <strong>TypeScript</strong> - A typed superset of JavaScript that
              improves code quality and developer productivity.
            </li>
            <li className="mb-2">
              <strong>Mongoose</strong> - An ODM (Object Data Modeling) library
              for MongoDB, used for database management.
            </li>
            <li className="mb-2">
              <strong>Tailwind CSS</strong> - A utility-first CSS framework for
              building modern and responsive designs.
            </li>
            <li className="mb-2">
              <strong>NextAuth.js</strong> - A complete authentication solution
              for Next.js applications.
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
    </div>
  );
}

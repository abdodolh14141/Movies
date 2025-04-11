"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import Link from "next/link";

interface Movie {
  id: number;
  title: string;
  rating: number;
  year: number;
  summary: string;
  medium_cover_image: string;
}

const Movies: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]); // Stores fetched movies
  const [loading, setLoading] = useState<boolean>(true); // Manages loading state
  const [error, setError] = useState<string | null>(null); // Stores error messages
  const [page, setPage] = useState<number>(1); // Manages the current page

  useMemo(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null); // Reset errors before fetching

      try {
        const response = await axios.get(
          `https://yts.mx/api/v2/list_movies.json?page=${page}&limit=50`
        );

        if (response.status === 200 && response.data.data.movies) {
          setMovies(response.data.data.movies); // Store fetched movies
        } else {
          throw new Error("No movies found");
        }
      } catch (err: any) {
        setError(err.message || "Error fetching data");
        toast.error(err.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [page]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-2xl">Loading movies...</p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <Toaster />
      <div className="header flex justify-center items-center mb-8">
        <h1 className="text-4xl font-bold text-center">Movies</h1>
        <img
          width={100}
          src="https://img.icons8.com/?size=512&id=121634&format=png"
          alt="Movies Icon"
        />
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {movies.length > 0 ? (
        <div className="movies-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {movies.map((movie) => (
            <Link href={`/movies/${movie.id}`} passHref key={movie.id}>
              <div className="movie-card group bg-white dark:bg-gray-800 w-full rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
                <div className="relative aspect-[2/3]">
                  <img
                    loading="lazy"
                    src={movie.medium_cover_image}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-4 space-y-2">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                    {movie.title}
                  </h2>

                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center text-gray-700 dark:text-gray-300">
                      {movie.rating}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {movie.year}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mt-2">
                    {movie.summary}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center">No movies available.</p>
      )}

      <div className="buttons flex justify-center mt-8">
        {/* Pagination buttons */}
        {[1, 2, 3, 4, 5, 6].map((num) => (
          <button
            key={num}
            onClick={() => setPage(num)}
            className={`bg-blue-500 text-white rounded-md px-4 py-2 mx-1 ${
              page === num ? "bg-blue-700" : "bg-blue-500"
            }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Movies;

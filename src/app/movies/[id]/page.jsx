"use client";

import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { toast, Toaster } from "sonner";
import { useParams, useRouter } from "next/navigation";

const API_BASE_URL = "https://yts.mx/api/v2";

const useMovieDetails = () => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  const fetchMovieDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/movie_details.json?movie_id=${id}`,
        { timeout: 5000 }
      );

      if (response.status === 200) {
        setMovie(response.data.data.movie);
      } else {
        throw new Error("Failed to fetch movie data.");
      }
    } catch (error) {
      setError(error.message);
      toast.error("Failed to fetch movie data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      const debounceTimer = setTimeout(() => fetchMovieDetails(), 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [id, fetchMovieDetails]);

  return { movie, loading, error, reload: fetchMovieDetails };
};

export default function MoviePage() {
  const { movie, loading, error, reload } = useMovieDetails();
  const router = useRouter();

  const handleBack = () => router.back();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="inline-block h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-2xl font-semibold text-gray-700">
            Loading movie details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
        <div className="text-center space-y-2">
          <div className="text-5xl">😞</div>
          <p className="text-xl font-semibold text-red-600">
            Error loading movie
          </p>
          <p className="text-gray-600 max-w-md">{error}</p>
        </div>
        <button
          onClick={reload}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2">
          <div className="text-5xl">🎬</div>
          <h1 className="text-2xl font-semibold text-gray-700">
            No movie data available
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <Toaster position="top-center" />

      <div className="max-w-7xl text-black mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="relative">
          {/* Back button */}
          <button
            onClick={handleBack}
            className="absolute top-6 left-6 z-10 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-md transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>

          {/* Movie content */}
          <div className="flex flex-col md:flex-row">
            {/* Movie poster */}
            <div className="md:w-2/5 p-6 flex justify-center bg-gray-100">
              <img
                src={movie.large_cover_image}
                alt={movie.title}
                className="w-full max-w-sm rounded-lg shadow-md object-cover aspect-[2/3] hover:shadow-lg transition-shadow"
              />
            </div>

            {/* Movie details */}
            <div className="md:w-3/5 p-6 md:p-8 space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {movie.title}{" "}
                  <span className="text-gray-500 font-normal">
                    ({movie.year})
                  </span>
                </h1>

                {movie.genres && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {movie.genres.map((genre) => (
                      <span
                        key={genre}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-800"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="prose max-w-none text-gray-700">
                <p>{movie.description_full || "No description available."}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-500 font-bold">★</span>
                  <span className="font-medium text-gray-700">Rating:</span>
                  <span>{movie.rating}/10</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">⏱</span>
                  <span className="font-medium text-gray-700">Runtime:</span>
                  <span>{movie.runtime} minutes</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">🗣</span>
                  <span className="font-medium text-gray-700">Language:</span>
                  <span>{movie.language}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">⬇️</span>
                  <span className="font-medium text-gray-700">Downloads:</span>
                  <span>{movie.download_count}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-red-500">❤️</span>
                  <span className="font-medium text-gray-700">Likes:</span>
                  <span>{movie.like_count}</span>
                </div>
              </div>

              <div className="flex flex-wrap absolute bottom-10 justify-around m-5 gap-4 pt-4">
                <a
                  href={movie.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg 
           shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  View on YTS
                </a>
                <button
                  onClick={handleBack}
                  className="bg-green-600 flex hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg 
                  shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

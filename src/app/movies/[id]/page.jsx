"use client";

import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { toast, Toaster } from "sonner";
import { useParams, useRouter } from "next/navigation";

const API_BASE_URL = "https://yts.mx/api/v2";

// Custom hook to fetch movie details
const useMovieDetails = () => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  const LoadingSpinner = () => <div className="spinner">Loading...</div>;

  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const fetchMovieDetails = useCallback(
    debounce(async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/movie_details.json?movie_id=${id}`,
          { timeout: 5000 } // 5 seconds timeout
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
    }, 300),
    [id]
  );

  useEffect(() => {
    if (id) fetchMovieDetails();
  }, [id, fetchMovieDetails]);

  if (loading) return <LoadingSpinner />;

  return { movie, loading, error, reload: fetchMovieDetails };
};

export default function MoviePage() {
  const { movie, loading, error, reload } = useMovieDetails();
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-2xl font-semibold text-gray-700 animate-pulse">
          Loading movie details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl font-semibold text-red-600 mb-4">{error}</p>
        <button
          onClick={reload}
          className="bg-blue-500 text-white py-2 px-6 rounded-md shadow-md hover:bg-blue-600 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-xl font-semibold">No movie data available.</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <Toaster />
      <div className="container mx-auto max-w-8xl bg-white p-8 rounded-lg shadow-lg">
        <div className="flex flex-row justify-center items-center md:flex-row p-5 gap-20 my-auto">
          <div className="md:w-1/3 text-center mx-30">
            <h1 className="text-4xl font-bold text-gray-800 mt-6">
              {movie.title}
            </h1>
            <img
              src={movie.large_cover_image}
              alt={movie.title}
              className="w-full h-auto rounded-md shadow-lg hover:scale-105 transform transition duration-300"
            />
          </div>
          <div className="md:w-2/3">
            <p className="text-lg text-black leading-relaxed mb-6">
              {movie.description_full || "No description available."}
            </p>
            <ul className="text-lg space-y-4 text-black justify-center mx-auto my-auto">
              <li>
                <strong>Year:</strong> {movie.year}
              </li>
              <li>
                <strong>Rating:</strong> {movie.rating} / 10
              </li>
              <li>
                <strong>Runtime:</strong> {movie.runtime} minutes
              </li>
              {movie.genres && (
                <li>
                  <strong>Genres:</strong> {movie.genres.join(", ")}
                </li>
              )}
              <li>
                <strong>Language:</strong> {movie.language}
              </li>
              <li>
                <strong>Download Count:</strong> {movie.download_count}
              </li>
              <li>
                <strong>Like Count:</strong> {movie.like_count}
              </li>
            </ul>
            <div className="mt-6 flex gap-4">
              <a
                href={movie.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white py-2 px-6 rounded-md shadow-md hover:bg-green-700 transition-all"
              >
                More Details
              </a>
              <button
                onClick={handleBack}
                className="bg-gray-700 text-white py-2 px-6 rounded-md shadow-md hover:bg-gray-800 transition-all"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import Link from "next/link";

const MovieDetail = ({ movie }: any) => {
  if (!movie) {
    return <p className="text-center text-gray-500">No movie available</p>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-10 bg-white shadow-lg rounded-lg">
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
        <img
          src={movie.medium_cover_image}
          alt={movie.title}
          className="w-64 h-64 object-cover rounded-md shadow-md"
          loading="lazy"
        />
        <div className="flex flex-col justify-center text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {movie.title}
          </h1>
          <p className="text-gray-600 mb-4 italic">Released: {movie.year}</p>
          <p className="text-gray-700 mb-2">Rating: ⭐ {movie.rating} / 10</p>
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-6">
            {movie.summary || "No summary available."}
          </p>
        </div>
      </div>
    </div>
  );
};

const MovieCard = ({ movie }: any) => (
  <Link href={`/movies/${movie.id}`} passHref key={movie.id}>
    <div className="movie-card max-w-6xl bg-white rounded-lg shadow-lg p-6 flex flex-col justify-between items-center transform transition duration-150 hover:scale-105 hover:shadow-xl cursor-pointer">
      <img
        src={movie.medium_cover_image}
        alt={movie.title}
        className="w-full h-64 object-cover rounded-md mb-4"
        loading="lazy"
      />
      <h2 className="text-xl font-semibold mb-2 text-center">{movie.title}</h2>
      <p className="text-sm text-gray-700 mb-1">Rating: {movie.rating} / 10</p>
      <p className="text-sm text-gray-500 mb-3">{movie.year}</p>
      <p className="text-sm text-gray-600 text-center line-clamp-3">
        {movie.summary}
      </p>
    </div>
  </Link>
);

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch movies on component mount
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get(
          "https://yts.mx/api/v2/list_movies.json?page=1&limit=50"
        );
        const movies = response?.data?.data?.movies;
        if (movies) {
          setData(movies);
        } else {
          toast.error("Unable to fetch movies.");
        }
      } catch (error: any) {
        toast.error(`Server Error: ${error.message}`);
      }
    };
    fetchMovies();
  }, []);

  // Auto-slide movies every 5 seconds
  useEffect(() => {
    if (data.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [data]);

  // Get the current movie and the next 5 movies
  const currentMovie = useMemo(() => data[currentIndex], [data, currentIndex]);
  const displayedMovies = useMemo(
    () => data.slice(currentIndex, currentIndex + 5),
    [data, currentIndex]
  );

  return (
    <>
      <div className="flex flex-col items-center justify-center my-6 p-6 rounded-md">
        <h1 className="text-4xl font-bold text-center mb-4">
          Welcome to Movie World{" "}
          <Link
            href="/movies"
            className="text-3xl text-green-600 rounded-lg p-2 font-bold hover:scale-105 transition-all hover:shadow-2xl hover:bg-yellow-950 transform"
          >
            Explore More
          </Link>
        </h1>
        <MovieDetail movie={currentMovie} />
      </div>

      <hr className="p-1 m-1 bg-black rounded-sm" />

      <div className="flex flex-col items-center w-full p-5 my-6">
        <p className="text-2xl font-bold text-center mb-4">
          Discover More Movies
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 w-full">
          {displayedMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </>
  );
}

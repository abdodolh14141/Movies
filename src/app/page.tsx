"use client";
import axios, { AxiosError } from "axios";
import { useEffect, useState, useMemo, useCallback, FormEvent } from "react";
import { Toaster, toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { Film, Star, Loader2, Search } from "lucide-react"; // Added Search icon

/* ------------------------------------------------------------------ */
/* Constants & API URL                                                */
/* ------------------------------------------------------------------ */
const OMDb_API_KEY = "ed49d703"; // Use a constant for the key
const BASE_API_URL = "https://www.omdbapi.com/?apikey=" + OMDb_API_KEY;
const INITIAL_SEARCH_TERM = "Avengers";
const FALLBACK_IMAGE_PATH = "/placeholder-movie.png";

/* ------------------------------------------------------------------ */
/* Types (Unchanged)                                                  */
/* ------------------------------------------------------------------ */

interface Movie {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Type: string;
}

interface ApiSearchResult {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

interface ApiSearchResponse {
  Search: ApiSearchResult[] | null;
  Response: "True" | "False";
  Error?: string;
}

/* ------------------------------------------------------------------ */
/* Data Mapping Utility (Unchanged)                                    */
/* ------------------------------------------------------------------ */

const normalizeMovieData = (data: ApiSearchResult[]): Movie[] => {
  return data.map((item) => ({
    imdbID: item.imdbID,
    Title: item.Title ?? "Unknown Title",
    Year: item.Year ?? "N/A",
    Poster:
      item.Poster && item.Poster !== "N/A" ? item.Poster : FALLBACK_IMAGE_PATH,
    Type: item.Type ?? "Movie",
  }));
};

/* ------------------------------------------------------------------ */
/* Movie Card Component (FIXED Link path)                              */
/* ------------------------------------------------------------------ */
const MovieCard = ({ movie }: { movie: Movie }) => (
  <Link
    // FIXED: Standardize link path to /movie/[imdbID]
    href={`/movie/${movie.imdbID}`}
    className="group movie-card w-full block"
    aria-label={`View details for ${movie.Title}`}
    // Removed toast on click as it's not standard UX for navigation
  >
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 flex flex-col items-center transform transition duration-200 group-hover:scale-[1.03] group-hover:shadow-2xl cursor-pointer border border-gray-100 dark:border-gray-700 h-full">
      <div className="relative w-full aspect-[2/3] mb-3">
        <Image
          src={movie.Poster}
          alt={`Poster for ${movie.Title}`}
          fill
          className="object-cover rounded-lg group-hover:opacity-85 transition-opacity"
          loading="lazy"
          sizes="(max-width: 600px) 50vw, 33vw"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = FALLBACK_IMAGE_PATH;
            target.srcset = "";
          }}
        />
        <span className="absolute top-1 right-1 px-2 py-0.5 text-xs font-bold text-white bg-red-600 rounded-lg shadow-md">
          {movie.Type.toUpperCase()}
        </span>
      </div>
      <h2 className="text-lg font-bold mb-1 text-center text-gray-900 dark:text-white line-clamp-2">
        {movie.Title}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
        ({movie.Year})
      </p>
    </div>
  </Link>
);

/* ------------------------------------------------------------------ */
/* Home Component                                                      */
/* ------------------------------------------------------------------ */

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(INITIAL_SEARCH_TERM);
  const [currentSearch, setCurrentSearch] = useState(INITIAL_SEARCH_TERM);

  // Re-usable fetch function using the currentSearch state
  const fetchMovies = useCallback(async (query: string) => {
    if (!query.trim()) {
      toast.warning("Please enter a search term.");
      setMovies([]);
      return;
    }

    setLoading(true);
    setCurrentSearch(query);
    const apiQueryUrl = `${BASE_API_URL}&s=${encodeURIComponent(
      query
    )}&type=movie`;

    try {
      const response = await axios.get<ApiSearchResponse>(apiQueryUrl);
      const data = response?.data;

      if (data && data.Response === "True" && data.Search) {
        const filteredResults = data.Search.filter(
          (item) => item.Poster !== "N/A"
        );
        const normalizedMovies = normalizeMovieData(filteredResults);

        setMovies(normalizedMovies);
        if (normalizedMovies.length === 0) {
          toast.info(`No high-quality movie posters found for "${query}".`);
        } else {
          toast.success(
            `Found ${normalizedMovies.length} results for "${query}".`
          );
        }
      } else {
        const errorMessage = data?.Error || `Search failed for "${query}".`;
        toast.error(errorMessage);
        setMovies([]);
      }
    } catch (error) {
      const e = error as AxiosError;
      toast.error(`Network Error: ${e.message}`);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load effect
  useEffect(() => {
    fetchMovies(INITIAL_SEARCH_TERM);
  }, [fetchMovies]);

  // Handle form submission
  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchMovies(searchTerm);
  };

  // Main banner movie is the first movie in the list
  const mainMovie = useMemo(() => movies[0] || null, [movies]);

  if (loading && movies.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-600 mb-4" />
        <div className="text-xl font-semibold text-gray-600 dark:text-gray-400">
          Loading {currentSearch} movies... 🍿
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Toaster richColors position="top-right" />

      <div className="flex flex-col items-center justify-center pt-10 pb-6 px-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-2 text-gray-900 dark:text-white">
          <Film className="inline h-10 w-10 text-indigo-600 mr-2" /> Movie
          Browser
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Search for popular movie collections or themes.
        </p>

        {/* --- Search Bar --- */}
        <form
          onSubmit={handleSearchSubmit}
          className="w-full max-w-xl mb-12 flex shadow-lg rounded-xl overflow-hidden"
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for a movie or franchise (e.g., Batman, Star Wars)"
            className="flex-1 p-4 text-lg border-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition-shadow"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin h-6 w-6" />
            ) : (
              <Search className="h-6 w-6" />
            )}
          </button>
        </form>

        {/* --- Main Banner Display (Improved Styling) --- */}
        {mainMovie && (
          <div className="w-full max-w-6xl mx-auto p-8 bg-gradient-to-br from-indigo-50 dark:from-gray-700 to-white dark:to-gray-800 shadow-2xl rounded-xl border border-indigo-200 dark:border-indigo-900">
            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-10">
              {/* Poster */}
              <div className="relative w-48 h-72 flex-shrink-0">
                <Image
                  src={mainMovie.Poster}
                  alt={mainMovie.Title}
                  fill
                  className="object-cover rounded-xl shadow-2xl border-4 border-indigo-400 dark:border-indigo-600"
                  loading="eager"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = FALLBACK_IMAGE_PATH;
                    target.srcset = "";
                  }}
                />
              </div>
              {/* Details */}
              <div className="flex flex-col justify-center text-center md:text-left flex-1">
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">
                  Featured Result
                </p>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                  {mainMovie.Title} ({mainMovie.Year})
                </h1>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 max-w-xl">
                  This is the first movie result from your search for **"
                  {currentSearch}"**. Click to see its full details and
                  technical specifications.
                </p>
                <Link
                  href={`/movie/${mainMovie.imdbID}`}
                  className="mt-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-all transform hover:scale-[1.02] shadow-xl self-center md:self-start flex items-center justify-center gap-2"
                >
                  <Star className="w-5 h-5" fill="currentColor" /> View Full
                  Details
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <hr className="h-0.5 w-4/5 mx-auto my-8 bg-gray-200 dark:bg-gray-700 rounded-sm" />

      <div className="flex flex-col items-center w-full p-6 my-6">
        <p className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">
          All {movies.length} Results for "{currentSearch}"
        </p>

        {/* List of Movies (Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 max-w-7xl w-full">
          {movies.map((movie) => (
            <MovieCard key={movie.imdbID} movie={movie} />
          ))}
        </div>

        {movies.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-lg">
            No movies found for the search term "{currentSearch}". Try a
            different query!
          </div>
        )}
      </div>
    </div>
  );
}

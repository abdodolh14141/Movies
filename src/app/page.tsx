"use client";
import axios, { AxiosError } from "axios";
import { useEffect, useState, useMemo, useCallback, FormEvent } from "react";
import { Toaster, toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import {
  Film,
  Star,
  Loader2,
  Search,
  Calendar,
  PlayCircle,
} from "lucide-react";

/* --- Constants --- */
const OMDb_API_KEY = "ed49d703";
const BASE_API_URL = "https://www.omdbapi.com/?apikey=" + OMDb_API_KEY;
const INITIAL_SEARCH_TERM = "Avengers";
const FALLBACK_IMAGE_PATH = "/placeholder-movie.png";

/* --- Types --- */
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

/* --- Utilities --- */
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

/* --- Movie Card Component --- */
const MovieCard = ({ movie }: { movie: Movie }) => (
  <Link
    href={`/movie/${movie.imdbID}`}
    className="group relative flex flex-col w-full h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
  >
    <div className="relative aspect-[2/3] overflow-hidden">
      <Image
        src={movie.Poster}
        alt={movie.Title}
        fill
        className="object-cover transform group-hover:scale-110 transition-transform duration-500"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <PlayCircle className="text-white w-10 h-10 mb-2" />
      </div>
      <span className="absolute top-2 right-2 px-2 py-1 text-[10px] font-bold tracking-widest text-white bg-indigo-600/90 backdrop-blur-md rounded-md uppercase">
        {movie.Type}
      </span>
    </div>

    <div className="p-4 flex flex-col flex-grow">
      <h2 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {movie.Title}
      </h2>
      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
        <Calendar className="w-3 h-3" />
        <span>{movie.Year}</span>
      </div>
    </div>
  </Link>
);

/* --- Main Home Component --- */
export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(INITIAL_SEARCH_TERM);
  const [currentSearch, setCurrentSearch] = useState(INITIAL_SEARCH_TERM);

  const fetchMovies = useCallback(async (query: string) => {
    if (!query.trim()) {
      toast.warning("Please enter a search term.");
      return;
    }
    setLoading(true);
    setCurrentSearch(query);
    try {
      const { data } = await axios.get<ApiSearchResponse>(
        `${BASE_API_URL}&s=${encodeURIComponent(query)}&type=movie`
      );
      if (data.Response === "True" && data.Search) {
        const normalized = normalizeMovieData(
          data.Search.filter((m) => m.Poster !== "N/A")
        );
        setMovies(normalized);
        toast.success(`Loaded ${normalized.length} results`);
      } else {
        toast.error(data.Error || "No results found");
        setMovies([]);
      }
    } catch (err) {
      toast.error("Network connection failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies(INITIAL_SEARCH_TERM);
  }, [fetchMovies]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchMovies(searchTerm);
  };

  const mainMovie = useMemo(() => movies[0] || null, [movies]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors">
      <Toaster richColors position="bottom-center" />

      {/* --- Header & Search Section --- */}
      <header className="relative py-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600/5 dark:bg-indigo-500/10 -z-10" />
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4">
            <Film className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight">
            Movie<span className="text-indigo-600">Browser</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover thousands of movies and franchises in one place.
          </p>

          <form
            onSubmit={handleSearchSubmit}
            className="relative max-w-2xl mx-auto group"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search (e.g. Inception, Marvel...)"
              className="w-full pl-6 pr-16 py-5 rounded-2xl bg-white dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500 shadow-xl outline-none transition-all dark:text-white text-lg"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-3 top-3 bottom-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </button>
          </form>
        </div>
      </header>

      {/* --- Featured Hero Section --- */}
      {mainMovie && !loading && (
        <section className="px-6 py-10">
          <div className="max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-gray-900 text-white min-h-[450px] flex items-center shadow-2xl">
              {/* Background Blur Image */}
              <div className="absolute inset-0 opacity-30">
                <Image
                  src={mainMovie.Poster}
                  alt="bg"
                  fill
                  className="object-cover blur-3xl scale-110"
                />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row items-center p-8 md:p-16 gap-10 w-full">
                <div className="w-48 md:w-64 aspect-[2/3] relative flex-shrink-0 shadow-2xl rounded-xl overflow-hidden border-4 border-white/10">
                  <Image
                    src={mainMovie.Poster}
                    alt={mainMovie.Title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 text-center md:text-left space-y-4">
                  <span className="px-3 py-1 bg-indigo-600 rounded-full text-xs font-bold tracking-widest uppercase">
                    Featured Today
                  </span>
                  <h2 className="text-4xl md:text-6xl font-bold">
                    {mainMovie.Title}
                  </h2>
                  <div className="flex items-center justify-center md:justify-start gap-4 text-gray-300">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> {mainMovie.Year}
                    </span>
                    <span className="px-2 py-0.5 border border-gray-500 rounded text-xs uppercase">
                      {mainMovie.Type}
                    </span>
                  </div>
                  <p className="text-gray-400 max-w-xl text-lg leading-relaxed">
                    This is the top result for{" "}
                    <span className="text-white font-medium">
                      "{currentSearch}"
                    </span>
                    . Explore high-quality details and technical specs for this
                    title.
                  </p>
                  <Link
                    href={`/movie/${mainMovie.imdbID}`}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 hover:bg-indigo-50 rounded-2xl font-bold transition-transform hover:scale-105 active:scale-95"
                  >
                    <Star className="w-5 h-5 fill-indigo-600 text-indigo-600" />{" "}
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- Movie Grid --- */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h3 className="text-3xl font-bold">Search Results</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Showing {movies.length} movies for "{currentSearch}"
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] bg-gray-200 dark:bg-gray-800 animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {movies.map((movie) => (
              <MovieCard key={movie.imdbID} movie={movie} />
            ))}
          </div>
        )}

        {!loading && movies.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h4 className="text-2xl font-bold">No movies found</h4>
            <p className="text-gray-500">
              Try searching for something else like "Interstellar" or "Pixar"
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

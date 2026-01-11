"use client";
import axios, { AxiosError } from "axios";
import { useEffect, useState, useMemo, useCallback, FormEvent } from "react";
import { Toaster, toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion"; // Add this
import {
  Film,
  Star,
  Loader2,
  Search,
  Calendar,
  PlayCircle,
  ArrowRight,
} from "lucide-react";

/* --- Constants & Types remain the same --- */
const OMDb_API_KEY = "ed49d703";
const BASE_API_URL = "https://www.omdbapi.com/?apikey=" + OMDb_API_KEY;
const INITIAL_SEARCH_TERM = "Avengers";
const FALLBACK_IMAGE_PATH = "/placeholder-movie.png";

interface Movie {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Type: string;
}

const normalizeMovieData = (data: any[]): Movie[] => {
  return data.map((item) => ({
    imdbID: item.imdbID,
    Title: item.Title ?? "Unknown Title",
    Year: item.Year ?? "N/A",
    Poster:
      item.Poster && item.Poster !== "N/A" ? item.Poster : FALLBACK_IMAGE_PATH,
    Type: item.Type ?? "Movie",
  }));
};

/* --- Animated Movie Card --- */
const MovieCard = ({ movie, index }: { movie: Movie; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.05 }}
    whileHover={{ y: -10 }}
  >
    <Link
      href={`/movie/${movie.imdbID}`}
      className="group relative flex flex-col w-full h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <Image
          src={movie.Poster}
          alt={movie.Title}
          fill
          className="object-cover transform group-hover:scale-110 transition-transform duration-700"
          sizes="(max-width: 640px) 50vw, 20vw"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
            <PlayCircle className="text-white w-12 h-12" />
          </motion.div>
        </div>
        <span className="absolute top-3 right-3 px-2 py-1 text-[10px] font-bold tracking-widest text-white bg-indigo-600 rounded-lg uppercase shadow-lg">
          {movie.Type}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {movie.Title}
        </h2>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="w-3 h-3" />
          <span>{movie.Year}</span>
        </div>
      </div>
    </Link>
  </motion.div>
);

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(INITIAL_SEARCH_TERM);
  const [currentSearch, setCurrentSearch] = useState(INITIAL_SEARCH_TERM);

  const fetchMovies = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setCurrentSearch(query);
    try {
      const { data } = await axios.get(
        `${BASE_API_URL}&s=${encodeURIComponent(query)}&type=movie`
      );
      if (data.Response === "True") {
        setMovies(normalizeMovieData(data.Search));
      } else {
        toast.error(data.Error);
        setMovies([]);
      }
    } catch (err) {
      toast.error("Connection failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies(INITIAL_SEARCH_TERM);
  }, [fetchMovies]);

  const mainMovie = useMemo(() => movies[0] || null, [movies]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Toaster richColors />

      {/* --- Search Header --- */}
      <header className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-500/20"
          >
            <Film className="h-10 w-10 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-black dark:text-white"
          >
            Find Your <span className="text-indigo-600">Cinema</span>
          </motion.h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchMovies(searchTerm);
            }}
            className="relative max-w-2xl mx-auto"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search movies..."
              className="w-full pl-8 pr-20 py-6 rounded-3xl bg-white dark:bg-gray-900 border-none shadow-2xl focus:ring-4 focus:ring-indigo-500/20 outline-none dark:text-white text-xl transition-all"
            />
            <button className="absolute right-3 top-3 bottom-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all">
              {loading ? <Loader2 className="animate-spin" /> : <Search />}
            </button>
          </form>
        </div>
      </header>

      {/* --- Featured Hero Section --- */}
      <AnimatePresence mode="wait">
        {mainMovie && !loading && (
          <motion.section
            key={mainMovie.imdbID}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="px-6 py-10 max-w-7xl mx-auto"
          >
            <div className="relative group overflow-hidden rounded-[40px] bg-gray-900 min-h-[500px] flex items-center shadow-3xl">
              <div className="absolute inset-0">
                <Image
                  src={mainMovie.Poster}
                  alt="bg"
                  fill
                  className="object-cover opacity-40 blur-2xl scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/60 to-transparent" />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row items-center p-12 md:p-20 gap-12 w-full">
                <motion.div
                  whileHover={{ rotateY: 15, rotateX: 5 }}
                  style={{ perspective: 1000 }}
                  className="w-64 aspect-[2/3] relative flex-shrink-0 shadow-2xl rounded-2xl overflow-hidden border-2 border-white/20"
                >
                  <Image
                    src={mainMovie.Poster}
                    alt={mainMovie.Title}
                    fill
                    className="object-cover"
                  />
                </motion.div>

                <div className="flex-1 space-y-6 text-center md:text-left">
                  <span className="px-4 py-1.5 bg-indigo-600/20 text-indigo-400 border border-indigo-600/30 rounded-full text-xs font-bold tracking-tighter uppercase">
                    Trending Now
                  </span>
                  <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter leading-tight">
                    {mainMovie.Title}
                  </h2>
                  <div className="flex items-center justify-center md:justify-start gap-6 text-gray-400">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" /> {mainMovie.Year}
                    </span>
                    <span className="px-3 py-1 bg-white/10 rounded-lg text-white text-sm font-bold uppercase">
                      {mainMovie.Type}
                    </span>
                  </div>
                  <Link
                    href={`/movie/${mainMovie.imdbID}`}
                    className="inline-flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white hover:bg-indigo-500 rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-600/30"
                  >
                    Watch Now <ArrowRight className="w-6 h-6" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* --- Results Grid --- */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <h3 className="text-3xl font-black mb-12 dark:text-white flex items-center gap-4">
          Explore Results{" "}
          <div className="h-1 flex-1 bg-indigo-600/10 rounded-full" />
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
          <AnimatePresence>
            {movies.map((movie, index) => (
              <MovieCard key={movie.imdbID} movie={movie} index={index} />
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

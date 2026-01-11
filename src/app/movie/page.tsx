"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import Image from "next/image";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Search,
  Film,
  Loader2,
  Star,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

/* --- Configuration --- */
const INITIAL_SEARCH_TERM = "action";
const RESULTS_PER_PAGE = 10;
const DEBOUNCE_DELAY = 500;
const FALLBACK_IMAGE_PATH =
  "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=1000&auto=format&fit=crop";

/* --- Animation Variants --- */
const gridVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
};

/* --- Sub-Component: Movie Card --- */
const MovieCard = React.memo(({ movie }: { movie: any }) => {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      layout
      variants={cardVariants}
      whileHover={{ y: -10, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative flex flex-col bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-xl border border-transparent dark:border-gray-800 hover:border-indigo-500/50 transition-colors duration-300"
    >
      <div
        className="relative aspect-[2/3] overflow-hidden cursor-pointer"
        onClick={() => router.push(`/movie/${movie.imdbID}`)}
      >
        <Image
          src={
            !imgError && movie.Poster !== "N/A"
              ? movie.Poster
              : FALLBACK_IMAGE_PATH
          }
          alt={movie.Title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          onError={() => setImgError(true)}
          sizes="(max-width: 768px) 50vw, 20vw"
        />

        {/* Overlay Info */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-5 flex flex-col justify-end">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded">
              IMDb
            </span>
            <span className="text-white text-xs font-bold">Details</span>
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">
          {movie.Type} • {movie.Year}
        </span>
        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 text-base group-hover:text-indigo-500 transition-colors">
          {movie.Title}
        </h3>
      </div>
    </motion.div>
  );
});

export default function MovieSearchPage() {
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(INITIAL_SEARCH_TERM);
  const [currentSearch, setCurrentSearch] = useState(INITIAL_SEARCH_TERM);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMovies = useCallback(async (query: string, page: number) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get("/api/authApi/movies", {
        params: { s: query.trim(), page },
      });
      if (data.Response === "True") {
        setSearchResults(data.Search);
        setTotalResults(parseInt(data.totalResults));
        setCurrentSearch(query);
        setCurrentPage(page);
      } else {
        setError(data.Error);
        setSearchResults([]);
      }
    } catch (err) {
      setError("Failed to fetch movies.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies(INITIAL_SEARCH_TERM, 1);
  }, [fetchMovies]);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(
      () => fetchMovies(val, 1),
      DEBOUNCE_DELAY
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100 transition-colors duration-500 pb-24">
      <Toaster richColors position="bottom-center" />

      {/* Hero Section */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative pt-20 pb-16 px-6 overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold uppercase tracking-widest border border-indigo-500/20"
          >
            <Sparkles size={14} /> AI Powered Search
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-500 dark:from-white dark:to-gray-500">
            Find your next <br /> favorite story.
          </h1>

          <div className="relative max-w-2xl mx-auto group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search movies, series, or actors..."
              className="w-full pl-16 pr-6 py-6 bg-white dark:bg-gray-900/50 backdrop-blur-xl rounded-full shadow-2xl border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-lg"
            />
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute right-6 top-1/2 -translate-y-1/2"
                >
                  <Loader2 className="animate-spin text-indigo-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <TrendingUp size={18} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Results for "{currentSearch}"
            </h2>
          </div>
          <div className="hidden sm:block h-px flex-grow mx-8 bg-gray-200 dark:bg-gray-800" />
          <p className="text-sm font-medium text-gray-500 whitespace-nowrap">
            {totalResults.toLocaleString()} items
          </p>
        </div>

        <LayoutGroup>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8"
              >
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-800 rounded-3xl animate-pulse" />
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  </div>
                ))}
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-24 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl"
              >
                <Film className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-400">{error}</h3>
                <button
                  onClick={() => fetchMovies(INITIAL_SEARCH_TERM, 1)}
                  className="mt-6 px-6 py-2 bg-indigo-500 text-white rounded-full font-bold"
                >
                  Try Action Movies
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                variants={gridVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8"
              >
                {searchResults?.map((movie) => (
                  <MovieCard key={movie.imdbID} movie={movie} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </LayoutGroup>

        {/* Pagination UI */}
        {!loading && totalResults > RESULTS_PER_PAGE && (
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-20 flex justify-center items-center gap-6"
          >
            <button
              disabled={currentPage === 1}
              onClick={() => {
                fetchMovies(currentSearch, currentPage - 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="group p-4 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl hover:border-indigo-500 transition-all disabled:opacity-20"
            >
              <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="px-3 py-1 bg-indigo-500 text-white rounded-md">
                {currentPage}
              </span>
              <span className="text-gray-500">/</span>
              <span>{Math.ceil(totalResults / RESULTS_PER_PAGE)}</span>
            </div>
            <button
              disabled={
                currentPage >= Math.ceil(totalResults / RESULTS_PER_PAGE)
              }
              onClick={() => {
                fetchMovies(currentSearch, currentPage + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="group p-4 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl hover:border-indigo-500 transition-all disabled:opacity-20"
            >
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.nav>
        )}
      </main>
    </div>
  );
}

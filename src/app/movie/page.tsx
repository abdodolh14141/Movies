"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { Toaster, toast } from "sonner";
import Image from "next/image";
import {
  Search,
  Film,
  Loader2,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

/* ------------------------------------------------------------------ */
/* Constants & API URL                                                */
/* ------------------------------------------------------------------ */

const PAGE_TITLE = "OMDb Movie Search";
const FALLBACK_IMAGE_PATH = "/placeholder-movie.png";
const INITIAL_SEARCH_TERM = "action";
const RESULTS_PER_PAGE = 10;
const DEBOUNCE_DELAY = 500; // ms for debouncing search
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

/* ------------------------------------------------------------------ */
/* Types & Interfaces                                                 */
/* ------------------------------------------------------------------ */

interface SearchResult {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

interface SearchResponse {
  Search: SearchResult[];
  totalResults: string;
  Response: "True" | "False";
  Error?: string;
}

interface CacheItem {
  data: SearchResult[];
  totalResults: number;
  timestamp: number;
}

interface SearchCache {
  [key: string]: CacheItem;
}

/* ------------------------------------------------------------------ */
/* Sub-Component: Movie Card (Improved)                               */
/* ------------------------------------------------------------------ */

interface MovieCardProps {
  movie: SearchResult;
}

const MovieCard = React.memo<MovieCardProps>(({ movie }) => {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);

  const posterSrc =
    !imgError && movie.Poster && movie.Poster !== "N/A"
      ? movie.Poster
      : FALLBACK_IMAGE_PATH;

  const handleCardClick = () => {
    router.push(`/movie/${movie.imdbID}`);
  };

  return (
    <div
      className="group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 dark:bg-gray-700 bg-white cursor-pointer h-full"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
      aria-label={`View details for ${movie.Title}`}
    >
      <div className="relative w-full aspect-[2/3]">
        <Image
          src={posterSrc}
          alt={`Poster for ${movie.Title}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover group-hover:opacity-80 transition-opacity duration-300"
          onError={() => setImgError(true)}
          priority={false}
        />
        <span className="absolute top-2 right-2 px-3 py-1 text-xs font-bold text-white bg-indigo-600 rounded-full shadow-md capitalize">
          {movie.Type}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 min-h-[3.5rem]">
          {movie.Title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
          Released: {movie.Year}
        </p>
        <button
          onClick={handleCardClick}
          className="mt-auto py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          aria-label={`Open IMDb page for ${movie.Title}`}
        >
          <Star size={16} aria-hidden="true" /> View on IMDb
        </button>
      </div>
    </div>
  );
});

MovieCard.displayName = "MovieCard";

/* ------------------------------------------------------------------ */
/* Sub-Component: Pagination (Improved)                               */
/* ------------------------------------------------------------------ */

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = React.memo(
  ({ totalPages, currentPage, onPageChange }) => {
    if (totalPages <= 1) return null;

    const MAX_VISIBLE_PAGES = 5;
    const startPage = Math.max(
      1,
      currentPage - Math.floor(MAX_VISIBLE_PAGES / 2)
    );
    const endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1);

    const pageNumbers = Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );

    const handlePrevious = () =>
      currentPage > 1 && onPageChange(currentPage - 1);
    const handleNext = () =>
      currentPage < totalPages && onPageChange(currentPage + 1);

    return (
      <nav aria-label="Pagination" className="mt-8">
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Previous Page"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>

          {startPage > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Go to page 1"
              >
                1
              </button>
              {startPage > 2 && (
                <span className="text-gray-500 dark:text-gray-400 px-2">
                  ...
                </span>
              )}
            </>
          )}

          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                page === currentPage
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              }`}
              aria-label={`Go to page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="text-gray-500 dark:text-gray-400 px-2">
                  ...
                </span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label={`Go to last page (${totalPages})`}
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Next Page"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </div>
      </nav>
    );
  }
);

Pagination.displayName = "Pagination";

/* ------------------------------------------------------------------ */
/* Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function MovieSearchPage() {
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(INITIAL_SEARCH_TERM);
  const [currentSearch, setCurrentSearch] = useState(INITIAL_SEARCH_TERM);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const searchCache = useRef<SearchCache>({});
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  /* ------------- Search Utilities ------------------- */

  const getCacheKey = (query: string, page: number): string =>
    `${query.toLowerCase()}-${page}`;

  const isCacheValid = (cacheKey: string): boolean => {
    const cached = searchCache.current[cacheKey];
    if (!cached) return false;
    return Date.now() - cached.timestamp < CACHE_DURATION;
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults(null);
    setTotalResults(0);
    setCurrentPage(1);
    setError(null);
  };

  /* ------------- Data Fetching ------------------- */

  const fetchMovies = useCallback(
    async (query: string, page: number, isInitial = false) => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        if (!isInitial) {
          setError("Please enter a search term.");
          setSearchResults(null);
        }
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) abortControllerRef.current.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const cacheKey = getCacheKey(trimmedQuery, page);
      if (isCacheValid(cacheKey)) {
        const cached = searchCache.current[cacheKey];
        setSearchResults(cached.data);
        setTotalResults(cached.totalResults);
        setCurrentSearch(trimmedQuery);
        setCurrentPage(page);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      setCurrentSearch(trimmedQuery);
      setCurrentPage(page);

      try {
        // 1. Determine if it's an ID search (starts with 'tt') or a Title search
        const isIdSearch = /^tt\d+$/.test(trimmedQuery);

        const { data } = await axios.get("/api/authApi/movies", {
          params: isIdSearch
            ? { i: trimmedQuery } // Use 'i' for ID
            : { s: trimmedQuery, page: page }, // Use 's' for Search
        });

        if (data.Response === "False") {
          throw new Error(data.Error || "No results found.");
        }

        // 2. Standardize the data
        // If it's an ID search, OMDb returns a single object.
        // We wrap it in an array to keep the UI consistent.
        const normalizedResults = isIdSearch ? [data] : data.Search;
        const totalCount = isIdSearch ? 1 : parseInt(data.totalResults, 10);

        // Cache the results
        searchCache.current[cacheKey] = {
          data: normalizedResults,
          totalResults: totalCount,
          timestamp: Date.now(),
        };

        setSearchResults(normalizedResults);
        console.log(data);
        setTotalResults(totalCount);
      } catch (err: any) {
        if (axios.isCancel(err)) return;

        const msg = err.message || "An error occurred";
        setError(msg);
        toast.error(msg);
        setSearchResults(null);
        setTotalResults(0);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
        abortControllerRef.current = null;
      }
    },
    []
  );

  /* ------------- Event Handlers ------------------- */

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    fetchMovies(searchTerm.trim(), 1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);

    // Debounce the search
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (value.trim()) {
        fetchMovies(value.trim(), 1);
      }
    }, DEBOUNCE_DELAY);
  };

  const handlePageChange = (page: number) => {
    fetchMovies(currentSearch, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetry = () => {
    fetchMovies(currentSearch, currentPage);
  };

  /* ------------- Effects ------------------- */

  useEffect(() => {
    fetchMovies(INITIAL_SEARCH_TERM, 1, true);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchMovies]);

  /* ------------- Calculated Values ------------------- */

  const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);

  /* ------------- Sub-Components ------------------- */

  const LoadingSpinner = () => (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
      <div className="relative">
        <Loader2 className="animate-spin h-12 w-12 text-indigo-600" />
        <div className="absolute inset-0 animate-ping opacity-20">
          <Loader2 className="h-12 w-12 text-indigo-600" />
        </div>
      </div>
      <p className="mt-6 text-gray-600 dark:text-gray-300 text-lg font-medium">
        Searching for{" "}
        <span className="text-indigo-600 dark:text-indigo-400">
          "{currentSearch}"
        </span>
        ...
      </p>
      <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
        Page {currentPage} of {totalPages || "..."}
      </p>
    </div>
  );

  const EmptyDisplay = () => (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-6 text-6xl animate-bounce">{error ? "🚨" : "🔍"}</div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        {error ? "Search Error" : "No Movies Found"}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
        {error ||
          `No results matched "${currentSearch}". Try a different term.`}
      </p>
      <div className="flex gap-3">
        <button
          onClick={handleRetry}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {error ? "Retry Search" : "Search Again"}
        </button>
        <button
          onClick={clearSearch}
          className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Clear Search
        </button>
      </div>
    </div>
  );

  const MovieGrid = () => (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {currentSearch}
        </h2>
        <div className="text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {totalResults.toLocaleString()}
          </span>{" "}
          results • Page <span className="font-semibold">{currentPage}</span> of{" "}
          <span className="font-semibold">{totalPages}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {searchResults?.map((movie) => (
          <MovieCard key={movie.imdbID} movie={movie} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );

  /* ------------- Main Render ------------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-8">
      <Toaster richColors position="top-right" closeButton duration={4000} />

      <main className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <header className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Film className="h-9 w-9 text-indigo-600" />
                {PAGE_TITLE}
              </h1>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                API Status: Online
              </div>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search movies by title, year, or genre..."
                  className="w-full pl-12 pr-12 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-3 focus:ring-indigo-500/50 dark:bg-gray-700 dark:text-white transition-all text-lg"
                  disabled={loading}
                  aria-label="Search movies"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-16 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label="Clear search"
                  >
                    <X size={20} />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading || !searchTerm.trim()}
                  className="absolute right-3 px-5 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  aria-label="Search"
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                  Search
                </button>
              </div>

              {totalResults > 0 && !loading && (
                <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">
                  Tip: Use the arrow keys to navigate through movies
                </p>
              )}
            </form>
          </header>

          {/* Content Area */}
          <div className="transition-opacity duration-300">
            {loading && <LoadingSpinner />}
            {error && !loading && <EmptyDisplay />}
            {searchResults && searchResults.length > 0 && !loading && (
              <MovieGrid />
            )}
            {!searchResults && !loading && !error && <EmptyDisplay />}
          </div>
        </div>

        {/* Footer Info */}
        <footer className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>
            Data provided by{" "}
            <a
              href="https://www.omdbapi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              OMDb API
            </a>
            . Results are cached for 5 minutes.
          </p>
        </footer>
      </main>
    </div>
  );
}

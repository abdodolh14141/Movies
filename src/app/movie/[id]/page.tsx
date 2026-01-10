"use client";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import Image from "next/image";
import {
  Play,
  Star,
  Loader2,
  Award,
  BookOpen,
  ExternalLink,
  ChevronLeft,
  TrendingUp,
  Ticket,
  X,
  Heart,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

// Sub-component: YouTube Modal
const TrailerModal = ({
  videoId,
  onClose,
}: {
  videoId: string;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md transition-all animate-in fade-in duration-300">
    <button
      onClick={onClose}
      className="absolute top-6 right-6 text-white hover:text-red-500 transition-transform hover:scale-110 z-[110]"
    >
      <X size={40} />
    </button>
    <div className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
        className="w-full h-full"
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
    </div>
  </div>
);

export default function MovieDetailsPage() {
  const router = useRouter();
  const { id } = useParams();

  const [movieData, setMovieData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerId, setTrailerId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Load Movie Data
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        // Using your fixed API route from the previous step
        const { data } = await axios.get(`/api/authApi/idMovie?id=${id}`);

        if (data.Response !== "False") {
          setMovieData(data);
          fetchTrailer(data.Title, data.Year);
        } else {
          toast.error(data.Error || "Movie not found");
          router.push("/");
        }
      } catch (err) {
        toast.error("Failed to fetch movie details.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, router]);

  const fetchTrailer = async (title: string, year: string) => {
    try {
      // PRO TIP: Move this to a backend route to hide the API Key
      const res = await axios.get(
        `https://www.googleapis.com/youtube/v3/search`,
        {
          params: {
            part: "snippet",
            q: `${title} ${year} official trailer`,
            key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
            maxResults: 1,
            type: "video",
          },
        }
      );
      setTrailerId(res.data.items[0]?.id.videoId || null);
    } catch (e) {
      console.error("Trailer fetch failed");
    }
  };

  if (loading)
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
        <p className="text-slate-400 font-medium animate-pulse tracking-widest uppercase text-xs">
          Assembling the scenes...
        </p>
      </div>
    );

  if (!movieData) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Toaster richColors position="top-center" />

      {showTrailer && trailerId && (
        <TrailerModal
          videoId={trailerId}
          onClose={() => setShowTrailer(false)}
        />
      )}

      {/* Hero Section */}
      <div className="relative h-[65vh] md:h-[75vh] w-full overflow-hidden">
        <Image
          src={
            movieData.Poster !== "N/A" ? movieData.Poster : "/placeholder.png"
          }
          alt="backdrop"
          fill
          priority
          className="object-cover blur-3xl scale-110 opacity-40 select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-transparent to-transparent" />

        {/* Navigation */}
        <nav className="absolute p-5 flex justify-between items-center max-w-8xl mx-auto">
          <button onClick={() => router.back()} className="nav-btn group">
            <ChevronLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />{" "}
            Back
          </button>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-12">
          <div className="flex flex-col m-5 md:flex-row gap-10 items-center md:items-end">
            <div className="movie-poster group relative w-64 aspect-[2/3] shrink-0">
              <Image
                src={
                  movieData.Poster !== "N/A"
                    ? movieData.Poster
                    : "/placeholder.png"
                }
                alt={movieData.Title}
                fill
                className="rounded-2xl object-cover shadow-2xl border-4 border-white/10"
              />
              {trailerId && (
                <div
                  onClick={() => setShowTrailer(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all cursor-pointer rounded-2xl"
                >
                  <Play
                    size={48}
                    fill="white"
                    className="text-white animate-pulse"
                  />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                <span className="badge-indigo">{movieData.Rated}</span>
                {movieData.Genre.split(",").map((g: string) => (
                  <span key={g} className="badge-glass">
                    {g.trim()}
                  </span>
                ))}
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
                {movieData.Title}
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
                {movieData.Year} • {movieData.Runtime} •{" "}
                {movieData.Language.split(",")[0]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats & Main Content */}
      <main className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 pb-20">
        <div className="stats-grid grid grid-cols-2 lg:grid-cols-4 gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
          <StatBox
            label="IMDb"
            value={movieData.imdbRating}
            icon={<Star className="text-yellow-500" />}
            sub={movieData.imdbVotes}
          />
          <StatBox
            label="Metascore"
            value={movieData.Metascore}
            icon={<TrendingUp className="text-green-500" />}
            sub="Critics"
          />
          <StatBox
            label="Box Office"
            value={movieData.BoxOffice}
            icon={<Ticket className="text-indigo-500" />}
            sub="Total"
          />
          <StatBox
            label="Awards"
            value={movieData.Awards?.split(" ")[0]}
            icon={<Award className="text-orange-500" />}
            sub="Wins"
          />
        </div>

        {/* Main Story Line */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mt-16">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="section-title">
                <BookOpen className="text-indigo-500" /> Storyline
              </h2>
              <p className="text-xl leading-relaxed text-slate-600 dark:text-slate-300">
                {movieData.Plot !== "N/A"
                  ? movieData.Plot
                  : "Plot summary not available."}
              </p>
            </section>

            <section className="info-card">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
                    Team
                  </h4>
                  <CreditItem label="Director" value={movieData.Director} />
                  <CreditItem label="Writers" value={movieData.Writer} />
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
                    Details
                  </h4>
                  <CreditItem label="Studio" value={movieData.Production} />
                  <CreditItem label="Country" value={movieData.Country} />
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Users size={20} className="text-indigo-500" /> Top Cast
              </h3>
              <div className="space-y-4">
                {movieData.Actors.split(",").map((actor: string) => (
                  <div
                    key={actor}
                    className="flex items-center gap-4 hover:translate-x-1 transition-transform cursor-default"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-sm">
                      {actor.trim().charAt(0)}
                    </div>
                    <span className="font-semibold">{actor.trim()}</span>
                  </div>
                ))}
              </div>
            </div>

            <a
              href={`https://www.imdb.com/title/${id}`}
              target="_blank"
              className="imdb-btn"
            >
              <ExternalLink size={20} /> VIEW ON IMDB
            </a>
          </aside>
        </div>
      </main>

      <style jsx>{`
        .nav-btn {
          @apply flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-white/20 transition-all text-sm font-medium;
        }
        .badge-indigo {
          @apply px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase rounded tracking-tighter;
        }
        .badge-glass {
          @apply px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 text-xs rounded-full font-medium;
        }
        .section-title {
          @apply text-2xl font-bold mb-6 flex items-center gap-3;
        }
        .info-card {
          @apply bg-slate-50 dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800;
        }
        .imdb-btn {
          @apply w-full flex items-center justify-center gap-3 py-5 bg-[#f5c518] text-black font-black rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-yellow-500/20 active:scale-95 text-sm tracking-widest;
        }
      `}</style>
    </div>
  );
}

const StatBox = ({ label, value, icon, sub }: any) => (
  <div className="flex items-start gap-4 p-2">
    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
      {icon}
    </div>
    <div>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        {label}
      </p>
      <p className="text-xl font-black">{value === "N/A" ? "—" : value}</p>
      <p className="text-[10px] text-slate-500 font-medium truncate max-w-[80px]">
        {sub}
      </p>
    </div>
  </div>
);

const CreditItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
      {label}
    </p>
    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
      {value === "N/A" ? "N/A" : value}
    </p>
  </div>
);

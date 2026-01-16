"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
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
  Users,
  Calendar,
  Clock,
  Globe,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

/* --- TypeScript Interfaces --- */
interface MovieData {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  BoxOffice: string;
  Production: string;
  Response: string;
  Error?: string;
}

interface StatBoxProps {
  label: string;
  value: string | number;
  icon: React.ReactElement;
  sub: string;
}

/* --- Animation Variants --- */
const fadeInUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  animate: { transition: { staggerChildren: 0.1 } },
};

/* --- Sub-component: YouTube Modal --- */
const TrailerModal = ({
  videoId,
  onClose,
}: {
  videoId: string;
  onClose: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl"
  >
    <motion.button
      whileHover={{ scale: 1.1, rotate: 90 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClose}
      className="absolute top-6 right-6 text-white hover:text-red-500 z-[110]"
    >
      <X size={40} />
    </motion.button>
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.3)] border border-white/10 bg-black"
    >
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
        className="w-full h-full"
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
    </motion.div>
  </motion.div>
);

export default function MovieDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [movieData, setMovieData] = useState<MovieData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerId, setTrailerId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get<MovieData>(
          `/api/authApi/idMovie?id=${id}`
        );

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
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 className="text-indigo-500" size={48} />
        </motion.div>
        <p className="mt-4 text-slate-400 font-bold tracking-widest uppercase text-xs animate-pulse">
          Developing Film...
        </p>
      </div>
    );

  if (!movieData) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Toaster richColors position="top-center" />

      <AnimatePresence>
        {showTrailer && trailerId && (
          <TrailerModal
            videoId={trailerId}
            onClose={() => setShowTrailer(false)}
          />
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden">
        <motion.div
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <Image
            src={
              movieData.Poster !== "N/A" ? movieData.Poster : "/placeholder.png"
            }
            alt="backdrop"
            fill
            priority
            className="object-cover blur-2xl"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />

        <nav className="absolute top-0 left-0 p-8 z-50">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 px-5 py-2.5 bg-black/20 backdrop-blur-xl rounded-full text-white border border-white/10 hover:bg-white/10 transition-all text-sm font-bold"
          >
            <ChevronLeft size={18} /> Back
          </motion.button>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-16">
          <div className="flex flex-col md:flex-row gap-12 items-center md:items-end">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="group relative w-72 aspect-[2/3] shrink-0 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <Image
                src={
                  movieData.Poster !== "N/A"
                    ? movieData.Poster
                    : "/placeholder.png"
                }
                alt={movieData.Title}
                fill
                className="rounded-3xl object-cover border border-white/10"
              />
              {trailerId && (
                <motion.div
                  whileHover={{ opacity: 1 }}
                  onClick={() => setShowTrailer(true)}
                  className="absolute inset-0 flex items-center justify-center bg-indigo-600/20 backdrop-blur-sm opacity-0 transition-all cursor-pointer rounded-3xl group-hover:opacity-100"
                >
                  <div className="p-5 bg-white rounded-full shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                    <Play size={32} fill="black" className="text-black ml-1" />
                  </div>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="flex-1 text-center md:text-left"
            >
              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap justify-center md:justify-start gap-3 mb-6"
              >
                <span className="px-3 py-1 bg-indigo-600 text-white text-[11px] font-black uppercase rounded-md tracking-widest">
                  {movieData.Rated}
                </span>
                {movieData.Genre.split(",").map((g) => (
                  <span
                    key={g}
                    className="px-4 py-1 bg-white/5 backdrop-blur-md border border-white/10 text-xs rounded-full font-bold"
                  >
                    {g.trim()}
                  </span>
                ))}
              </motion.div>
              <motion.h1
                variants={fadeInUp}
                className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400"
              >
                {movieData.Title}
              </motion.h1>
              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap justify-center md:justify-start gap-6 text-slate-400 font-bold uppercase text-[11px] tracking-[0.2em]"
              >
                <span className="flex items-center gap-2">
                  <Calendar size={14} className="text-indigo-500" />{" "}
                  {movieData.Year}
                </span>
                <span className="flex items-center gap-2">
                  <Clock size={14} className="text-indigo-500" />{" "}
                  {movieData.Runtime}
                </span>
                <span className="flex items-center gap-2">
                  <Globe size={14} className="text-indigo-500" />{" "}
                  {movieData.Language.split(",")[0]}
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 pb-32">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-white dark:bg-slate-900/80 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5"
        >
          <StatBox
            label="IMDb"
            value={movieData.imdbRating}
            icon={<Star className="text-yellow-400 fill-yellow-400" />}
            sub={`${movieData.imdbVotes} Votes`}
          />
          <StatBox
            label="Metascore"
            value={movieData.Metascore}
            icon={<TrendingUp className="text-emerald-500" />}
            sub="Critic Review"
          />
          <StatBox
            label="Box Office"
            value={movieData.BoxOffice}
            icon={<Ticket className="text-indigo-500" />}
            sub="Gross Revenue"
          />
          <StatBox
            label="Awards"
            value={movieData.Awards?.split(" ")[0] || "0"}
            icon={<Award className="text-orange-500" />}
            sub="Total Wins"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20 mt-20">
          <div className="lg:col-span-2 space-y-20">
            <motion.section
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-black mb-8 flex items-center gap-4">
                <BookOpen className="text-indigo-500" size={32} /> The Synopsis
              </h2>
              <p className="text-2xl leading-[1.6] text-slate-600 dark:text-slate-300 font-medium">
                {movieData.Plot !== "N/A"
                  ? movieData.Plot
                  : "No plot available for this title."}
              </p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-10 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5"
            >
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-indigo-500 uppercase tracking-widest">
                    Production Team
                  </h4>
                  <CreditItem label="Director" value={movieData.Director} />
                  <CreditItem label="Writers" value={movieData.Writer} />
                </div>
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-indigo-500 uppercase tracking-widest">
                    Filming Details
                  </h4>
                  <CreditItem label="Studio" value={movieData.Production} />
                  <CreditItem label="Country" value={movieData.Country} />
                </div>
              </div>
            </motion.section>
          </div>

          <aside className="space-y-10">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-slate-50 dark:bg-white/5 p-10 rounded-[2.5rem] border border-slate-100 dark:border-white/5"
            >
              <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                <Users size={24} className="text-indigo-500" /> Featured Cast
              </h3>
              <div className="space-y-6">
                {movieData.Actors.split(",").map((actor, i) => (
                  <motion.div
                    key={actor}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-5 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black text-sm group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      {actor.trim().charAt(0)}
                    </div>
                    <span className="font-bold text-lg group-hover:text-indigo-500 transition-colors">
                      {actor.trim()}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.a
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              href={`https://www.imdb.com/title/${id}`}
              target="_blank"
              className="w-full flex items-center justify-center gap-3 py-6 bg-[#f5c518] text-black font-black rounded-[2rem] shadow-2xl shadow-yellow-500/20 text-xs tracking-[0.2em]"
            >
              <ExternalLink size={20} /> VIEW ON IMDB
            </motion.a>
          </aside>
        </div>
      </main>
    </div>
  );
}

const StatBox = ({ label, value, icon, sub }: StatBoxProps) => (
  <div className="flex items-center gap-5">
    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-inner">
      {React.cloneElement(icon, { size: 24 } as any)}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-2xl font-black tracking-tight">
        {value === "N/A" ? "—" : value}
      </p>
      <p className="text-[10px] text-slate-500 font-bold uppercase truncate">
        {sub}
      </p>
    </div>
  </div>
);

const CreditItem = ({ label, value }: { label: string; value: string }) => (
  <div className="group">
    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-2 group-hover:text-indigo-500 transition-colors">
      {label}
    </p>
    <p className="text-base font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
      {value === "N/A" ? "N/A" : value}
    </p>
  </div>
);

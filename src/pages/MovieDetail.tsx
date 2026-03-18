import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Clock, Calendar, ChevronLeft, Building2, Ticket } from "lucide-react";
import { movieService } from "../services/movie.service";
import { ShowtimeService } from "../services/showtime.service";
import type { Showtime } from "../services/showtime.service";
import { Button } from "@/components/ui/button";

interface MovieDetail {
  id: string;
  title: string;
  backdrop: string;
  poster: string;
  description: string;
  rating: number;
  duration: string;
  releaseDate: string;
  director: string;
  cast: string[];
  genres: string[];
}

export function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchMovie(id);
      fetchShowtimes(id);
    }
  }, [id]);

  const fetchShowtimes = async (movieId: string) => {
    try {
      const response = await ShowtimeService.getByMovie(movieId);
      setShowtimes(response.data || []);
    } catch (error) {
      console.error("Error fetching showtimes", error);
    }
  };

  const normalizeMovie = (data: any): MovieDetail => ({
    id: data.id,
    title: data.title,
    backdrop: data.backdropUrl || data.posterUrl || "",
    poster: data.posterUrl || "",
    description: data.description || "",
    rating: data.rating ?? 0,
    duration: data.duration ?? "",
    releaseDate: data.releaseDate ?? "",
    director: data.director ?? "",
    cast:
      typeof data.cast === "string"
        ? data.cast.split(",").map((c: string) => c.trim())
        : Array.isArray(data.cast)
          ? data.cast
          : [],
    genres:
      typeof data.genre === "string"
        ? data.genre.split(",").map((g: string) => g.trim())
        : Array.isArray(data.genre)
          ? data.genre
          : [],
  });

  const fetchMovie = async (movieId: string) => {
    try {
      const data = await movieService.getMovieById(movieId);
      setMovie(normalizeMovie(data));
    } catch (error) {
      console.error("Error fetching movie detail", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-20 text-center text-xl">Loading...</div>;
  }

  if (!movie) {
    return <div className="p-20 text-center text-xl">Movie not found</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Backdrop Header */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${movie.backdrop})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <div className="container relative h-full flex flex-col justify-end pb-10">
          <Link
            to="/"
            className="absolute top-8 left-4 md:left-8 text-white/80 hover:text-white flex items-center gap-2 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" /> Back to Home
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-end">
            <img
              src={movie.poster}
              alt={movie.title}
              className="hidden md:block w-48 rounded-lg shadow-2xl shadow-black/50 border border-white/10"
            />
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-yellow-500">
                <Star className="h-5 w-5 fill-current" />
                <span className="text-xl font-bold">{movie.rating}</span>
                <span className="text-muted-foreground ml-2 text-sm">
                  (2.5k reviews)
                </span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {movie.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> {movie.releaseDate}
                </span>
                <span>{movie.genres.join(", ")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-12 grid gap-12 lg:grid-cols-[1fr_350px]">
        {/* Main Content */}
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold mb-4">Synopsis</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {movie.description}
            </p>
          </section>

          {/* Showtimes Section - Now MORE prominent */}
          <section id="showtimes" className="scroll-mt-24">
            <h2 className="flex items-center gap-2 text-2xl font-bold mb-6">
              <Calendar className="h-6 w-6 text-primary" />
              Lịch Chiếu
            </h2>

            {showtimes.length > 0 ? (
              <div className="grid gap-6">
                {/* Grouping by Cinema - Simplified display for now */}
                {Array.from(new Set(showtimes.map(s => s.cinemaName))).map(cinema => (
                  <div key={cinema} className="space-y-4">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-foreground/90">
                      <Building2 className="h-5 w-5 text-primary/70" />
                      {cinema}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {showtimes.filter(s => s.cinemaName === cinema).map((st: Showtime) => (
                        <Link
                          key={st.id}
                          to={`/booking/${st.id}`}
                          className="flex flex-col p-4 rounded-xl bg-secondary/20 border border-border/50 hover:border-primary/50 hover:bg-secondary/40 transition-all group"
                        >
                          <div className="flex justify-between items-start mb-2">
                             <span className="font-bold text-lg">{new Date(st.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                             <span className="text-primary font-bold">${st.standardPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-end text-xs text-muted-foreground">
                            <span>{st.auditoriumName}</span>
                            <span className="flex items-center gap-1 group-hover:text-primary transition-colors">
                              Book <Ticket className="h-3 w-3" />
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-secondary/10 rounded-2xl border border-dashed border-border/50 flex flex-col items-center gap-4">
                <Calendar className="h-12 w-12 opacity-20" />
                <div className="space-y-1">
                  <p className="font-medium">No showtimes available</p>
                  <p className="text-sm text-muted-foreground">Check back later for updated schedules.</p>
                </div>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Cast & Crew</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-card border border-border/50">
                <p className="text-xs text-muted-foreground">Director</p>
                <p className="font-medium">{movie.director}</p>
              </div>

              {movie.cast.map((actor: string) => (
                <div
                  key={actor}
                  className="p-4 rounded-lg bg-card border border-border/50"
                >
                  <p className="text-xs text-muted-foreground">Actor</p>
                  <p className="font-medium">{actor}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar - Now for info & booking summary/cta */}
        <div className="space-y-6">
           <div className="rounded-xl border border-border/50 bg-card p-6 shadow-lg sticky top-24">
              <h3 className="text-xl font-bold mb-4">Quick Booking</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Select a showtime from the list to start choosing your seats.
              </p>
              <Button 
                className="w-full gap-2 py-6 text-lg" 
                onClick={() => document.getElementById('showtimes')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Showtimes
              </Button>
              
              <div className="mt-8 space-y-4 pt-8 border-t border-border/50 text-sm">
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <span className="font-medium text-yellow-500 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" /> {movie.rating}
                    </span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{movie.duration}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Language</span>
                    <span className="font-medium">English (SUB)</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
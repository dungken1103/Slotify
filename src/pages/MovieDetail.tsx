import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Clock, Calendar, ChevronLeft, Building2 } from "lucide-react";
import { movieService } from "../services/movieService";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchMovie(id);
  }, [id]);

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
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Synopsis</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {movie.description}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Cast & Crew</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-card border border-border/50">
                <p className="text-xs text-muted-foreground">Director</p>
                <p className="font-medium">{movie.director}</p>
              </div>

              {movie.cast.map((actor) => (
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

        {/* Sidebar giữ nguyên vì chưa có API showtime */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border/50 bg-card p-6 shadow-lg">
            <h3 className="flex items-center gap-2 text-xl font-bold mb-6">
              <Building2 className="h-5 w-5 text-primary" />
              Select Showtime
            </h3>

            <div className="text-center text-muted-foreground text-sm">
              Showtime API not connected yet
            </div>

            <div className="mt-6 pt-6 border-t border-border/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                Price starts from
              </p>
              <p className="text-2xl font-bold text-primary">$12.50</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
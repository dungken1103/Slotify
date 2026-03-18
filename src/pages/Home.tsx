import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { MovieCard, type Movie } from "../components/ui/MovieCard";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import { movieService } from "../services/movie.service";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

export function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  // ✅ Chuẩn hóa dữ liệu từ backend
  const normalizeMovie = (movie: any): Movie => ({
    id: movie.id,
    title: movie.title,
    poster: movie.posterUrl || "",
    rating: movie.rating ?? 0,
    genre:
      typeof movie.genre === "string"
        ? movie.genre.split(",").map((g: string) => g.trim())
        : Array.isArray(movie.genre)
          ? movie.genre
          : [],
    duration: movie.duration ?? "",
    releaseDate: movie.releaseDate,
  });

  const fetchMovies = async () => {
    try {
      const data = await movieService.getAllMovies(true);

      const normalizedMovies = (data || []).map(normalizeMovie);

      setMovies(normalizedMovies);

      if (normalizedMovies.length > 0) {
        setFeaturedMovie(normalizedMovies[0]);
      }
    } catch (error) {
      console.error("Error fetching movies", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (!featuredMovie) {
    return <div className="p-20 text-center text-xl">No movies found</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${featuredMovie.poster})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
        </div>

        <div className="container relative flex h-full items-end pb-20">
          <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary border border-primary/20">
                Now Showing
              </span>
              <span className="text-secondary-foreground/80 text-sm font-medium">
                {featuredMovie.genre.join(" • ")}
              </span>
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              {featuredMovie.title}
            </h1>

            <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl line-clamp-3">
              {featuredMovie.releaseDate}
            </p>

            <div className="flex items-center gap-4 pt-4">
              <Link to={`/movie/${featuredMovie.id}`}>
                <Button size="lg" className="rounded-full px-8 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40">
                  Book Tickets
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full gap-2 px-6 backdrop-blur-sm bg-black/10 border-white/10 hover:bg-white/10"
              >
                <Play className="h-4 w-4 fill-current" /> Watch Trailer
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Movies Grid */}
      <section className="container py-16 space-y-10">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Now Showing</h2>
          <Button variant="link" className="text-primary">
            View all
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
    </div>
  );
}
import { useEffect, useState } from "react";
import { SEO } from "../components/SEO";
import { Button } from "../components/ui/button";
import { MovieCard, type Movie } from "../components/ui/MovieCard";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import { movieService } from "../services/movie.service";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { getYouTubeEmbedUrl } from "../lib/utils";

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
    genre:
      typeof movie.genre === "string"
        ? movie.genre.split(",").map((g: string) => g.trim())
        : Array.isArray(movie.genre)
          ? movie.genre
          : [],
    duration: movie.durationMinutes ? `${movie.durationMinutes} phút` : "",
    releaseDate: movie.releaseDate,
    trailerUrl: movie.trailerUrl || "",
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
    return <div className="p-20 text-center text-xl">Không tìm thấy phim nào</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SEO title="Trang Chủ" />
      {/* Hero Section */}
      <section className="relative h-[80vh] w-full overflow-hidden bg-background">
        {featuredMovie.trailerUrl && getYouTubeEmbedUrl(featuredMovie.trailerUrl) ? (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <iframe
              src={getYouTubeEmbedUrl(featuredMovie.trailerUrl)!}
              className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[80vh] min-w-[142.22vh] -translate-x-1/2 -translate-y-1/2 opacity-100"
              allow="autoplay; encrypted-media"
            />
          </div>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center blur-xl opacity-40 scale-105"
            style={{ backgroundImage: `url(${featuredMovie.poster})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent opacity-80 hidden md:block" />

        <div className="container relative flex h-full items-center md:items-end justify-between pb-10 md:pb-20 pt-20 gap-8">
          <div className="max-w-2xl space-y-6 z-10 flex-1">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary border border-primary/20 backdrop-blur-md">
                Đang chiếu
              </span>
              <span className="text-secondary-foreground/90 text-sm font-medium">
                {featuredMovie.genre.join(" • ")}
              </span>
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl drop-shadow-lg">
              {featuredMovie.title}
            </h1>

            <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl line-clamp-3">
              {featuredMovie.releaseDate}
            </p>

            <div className="flex items-center gap-4 pt-4">
              <Link to={`/movie/${featuredMovie.id}`}>
                <Button size="lg" className="rounded-full px-8 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40">
                  Đặt vé
                </Button>
              </Link>
              {featuredMovie.trailerUrl ? (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full gap-2 px-6 backdrop-blur-sm bg-black/10 border-white/10 hover:bg-white/10"
                >
                  <a
                    href={featuredMovie.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Play className="h-4 w-4 fill-current" /> Xem Trailer
                  </a>
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full gap-2 px-6 backdrop-blur-sm bg-black/10 border-white/10"
                  disabled
                >
                  <Play className="h-4 w-4 fill-current" /> Xem Trailer
                </Button>
              )}
            </div>
          </div>
          
          <div className="hidden md:block w-1/3 max-w-[320px] shrink-0 z-10 self-end">
            <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
              <img
                src={featuredMovie.poster}
                alt={featuredMovie.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Movies Grid */}
      <section className="container py-16 space-y-10">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Đang chiếu</h2>
          <Button variant="link" className="text-primary">
            Xem tất cả
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
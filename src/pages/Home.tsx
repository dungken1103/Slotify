import { useEffect, useState } from "react";
import { SEO as Seo } from "../components/SEO";
import { Button } from "../components/ui/button";
import { MovieCard, type Movie } from "../components/ui/MovieCard";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import { movieService } from "../services/movie.service";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { formatDateVi, getYouTubeEmbedUrl, isUpcomingRelease, splitCommaList } from "../lib/utils";
import { movieRankingService } from "../services/movieRanking.service";

export function HomePage() {
  const [nowShowing, setNowShowing] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  // ✅ Chuẩn hóa dữ liệu từ backend (null-safe)
  const normalizeMovie = (raw: any): Movie => ({
    id: String(raw?.id ?? ""),
    title: String(raw?.title ?? "").trim() || "Chưa có tiêu đề",
    poster: String(raw?.posterUrl ?? "").trim(),
    genre: splitCommaList(raw?.genre),
    duration: raw?.durationMinutes ? `${raw.durationMinutes} phút` : "",
    releaseDate: formatDateVi(raw?.releaseDate),
    trailerUrl: String(raw?.trailerUrl ?? "").trim(),
    releaseDateISO: raw?.releaseDate ? String(raw.releaseDate) : undefined,
    isActive: typeof raw?.isActive === "boolean" ? raw.isActive : undefined,
  });

  const fetchMovies = async () => {
    try {
      // Lấy cả phim đang chiếu & sắp chiếu
      const data = await movieService.getAllMovies(false);

      const normalizedMovies = (data || []).map(normalizeMovie);

      const upcomingMovies = normalizedMovies
        .filter((m) => isUpcomingRelease(m.releaseDateISO))
        .sort((a, b) => {
          const da = new Date(a.releaseDateISO || 0).getTime();
          const db = new Date(b.releaseDateISO || 0).getTime();
          return da - db; // sắp tới gần nhất trước
        });

      const nowShowingMovies = normalizedMovies
        .filter((m) => !isUpcomingRelease(m.releaseDateISO) && (m.isActive ?? true))
        .sort((a, b) => {
          const da = new Date(a.releaseDateISO || 0).getTime();
          const db = new Date(b.releaseDateISO || 0).getTime();
          return db - da; // mới nhất trước
        });

      setUpcoming(upcomingMovies);
      setNowShowing(nowShowingMovies);

      const topBookedIds = await movieRankingService.getTopBookedMovieIds(10);
      const rank = new Map(topBookedIds.map((id, idx) => [id, idx]));

      const featuredByBooking = nowShowingMovies
        .filter((m) => rank.has(m.id))
        .sort((a, b) => (rank.get(a.id) ?? 9999) - (rank.get(b.id) ?? 9999));

      const featuredList = featuredByBooking.length > 0
        ? featuredByBooking
        : [...nowShowingMovies, ...upcomingMovies].slice(0, 10);
      setFeaturedMovie(featuredList[0] ?? null);
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
      <Seo title="Trang Chủ" />
      {/* Hero Section */}
      <section className="relative h-[80vh] w-full overflow-hidden bg-background">
        {featuredMovie.trailerUrl && getYouTubeEmbedUrl(featuredMovie.trailerUrl) ? (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <iframe
              src={getYouTubeEmbedUrl(featuredMovie.trailerUrl)!}
              title={`Trailer ${featuredMovie.title}`}
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
                Nổi bật
              </span>
              <span className="text-secondary-foreground/90 text-sm font-medium">
                {(featuredMovie.genre?.length ? featuredMovie.genre : ["Chưa rõ thể loại"]).join(" • ")}
              </span>
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl drop-shadow-lg">
              {featuredMovie.title}
            </h1>



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
          <Button asChild variant="link" className="text-primary">
            <Link to="/movies?filter=now">Xem tất cả</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
          {nowShowing.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Upcoming Movies Grid */}
      <section className="container pb-20 space-y-10">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Sắp chiếu</h2>
          <Button asChild variant="link" className="text-primary">
            <Link to="/movies?filter=upcoming">Xem tất cả</Link>
          </Button>
        </div>

        {upcoming.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
            {upcoming.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground rounded-2xl border border-dashed border-white/10 bg-card/20">
            Chưa có phim sắp chiếu.
          </div>
        )}
      </section>
    </div>
  );
}
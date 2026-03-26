import { useEffect, useState } from "react";
import { movieService } from "../services/movie.service";
import { MovieCard, type Movie } from "../components/ui/MovieCard";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Input } from "../components/ui/input";
import { Search, Film } from "lucide-react";
import { Button } from "../components/ui/button";
import { formatDateVi, isUpcomingRelease, splitCommaList } from "../lib/utils";
import { useLocation } from "react-router-dom";
import { movieRankingService } from "../services/movieRanking.service";

export function MoviesPage() {
  const location = useLocation();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "now" | "upcoming" | "featured">("all");
  const [topBookedMovieIds, setTopBookedMovieIds] = useState<string[]>([]);

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const filter = sp.get("filter");
    if (filter === "now" || filter === "upcoming" || filter === "featured" || filter === "all") {
      setActiveFilter(filter);
    }
  }, [location.search]);

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();

    const fallbackFeaturedIds = new Set(
      [...movies]
        .filter((m) => !isUpcomingRelease(m.releaseDateISO) && (m.isActive ?? true))
        .sort((a, b) => (new Date(b.releaseDateISO || 0).getTime() - new Date(a.releaseDateISO || 0).getTime()))
        .slice(0, 10)
        .map((m) => m.id)
    );
    const featuredIds = new Set(topBookedMovieIds.length > 0 ? topBookedMovieIds : Array.from(fallbackFeaturedIds));
    const rankByFeaturedId = new Map(
      (topBookedMovieIds.length > 0 ? topBookedMovieIds : Array.from(fallbackFeaturedIds)).map((id, idx) => [id, idx])
    );

    const filtered = movies.filter((movie) => {
      const matchesQuery =
        !q ||
        (movie.title || "").toLowerCase().includes(q) ||
        (movie.genre || []).some((g) => (g || "").toLowerCase().includes(q));

      if (!matchesQuery) return false;

      if (activeFilter === "now") return !isUpcomingRelease(movie.releaseDateISO) && (movie.isActive ?? true);
      if (activeFilter === "upcoming") return isUpcomingRelease(movie.releaseDateISO);
      if (activeFilter === "featured") {
        // Featured = phim đang chiếu, được sắp theo độ "hot" từ booking.
        return !isUpcomingRelease(movie.releaseDateISO) && (movie.isActive ?? true) && featuredIds.has(movie.id);
      }
      return true;
    });

    if (activeFilter === "featured" && rankByFeaturedId.size > 0) {
      // topBookedMovieIds đã được trả về theo thứ tự giảm dần score (booking/hot) nên index nhỏ hơn => đứng trước.
      setFilteredMovies(
        [...filtered].sort((a, b) => (rankByFeaturedId.get(a.id) ?? 9999) - (rankByFeaturedId.get(b.id) ?? 9999))
      );
      return;
    }

    setFilteredMovies(filtered);
  }, [searchQuery, movies, activeFilter, topBookedMovieIds]);

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
      setLoading(true);
      const [data, topBookedIds] = await Promise.all([
        movieService.getAllMovies(false),
        movieRankingService.getTopBookedMovieIds(10),
      ]);
      const normalizedMovies = (data || []).map(normalizeMovie);
      setMovies(normalizedMovies);
      setFilteredMovies(normalizedMovies);
      setTopBookedMovieIds(topBookedIds);
    } catch (error) {
      console.error("Error fetching movies", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  return (
    <div className="container py-12 space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-medium tracking-wider uppercase text-xs">
                <Film className="h-4 w-4" />
                <span>Khám phá</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                Tất Cả Phim
            </h1>
            <p className="text-muted-foreground text-lg max-w-[600px]">
                Duyệt qua danh sách các bộ phim đang chiếu và sắp chiếu tại các rạp Slotify trên toàn quốc.
            </p>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Tìm kiếm phim, thể loại..."
            className="pl-10 h-11 bg-card/50 border-white/10 hover:border-primary/50 focus:border-primary transition-all rounded-full shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setActiveFilter("all")}
          >
            Tất cả
          </Button>
          <Button
            variant={activeFilter === "featured" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setActiveFilter("featured")}
          >
            Nổi bật
          </Button>
          <Button
            variant={activeFilter === "now" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setActiveFilter("now")}
          >
            Đang chiếu
          </Button>
          <Button
            variant={activeFilter === "upcoming" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setActiveFilter("upcoming")}
          >
            Sắp chiếu
          </Button>
        </div>

        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 rounded-3xl border border-dashed border-white/10 bg-card/20 backdrop-blur-sm">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                 <Search className="h-8 w-8 text-muted-foreground opacity-20" />
            </div>
            <div>
                <p className="text-xl font-semibold">Không tìm thấy phim nào</p>
                <p className="text-muted-foreground">Thử tìm kiếm với từ khóa khác nhé!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

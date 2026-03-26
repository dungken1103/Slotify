import { useEffect, useState } from "react";
import { movieService } from "../services/movie.service";
import { MovieCard, type Movie } from "../components/ui/MovieCard";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Input } from "../components/ui/input";
import { Search, Film } from "lucide-react";

export function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    const filtered = movies.filter(movie => 
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredMovies(filtered);
  }, [searchQuery, movies]);

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
      setLoading(true);
      const data = await movieService.getAllMovies(true);
      const normalizedMovies = (data || []).map(normalizeMovie);
      setMovies(normalizedMovies);
      setFilteredMovies(normalizedMovies);
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

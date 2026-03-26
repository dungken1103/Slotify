import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CinemaService, type Cinema } from "../services/cinema.service";
import { movieService } from "../services/movie.service";
import { ShowtimeService, type Showtime } from "../services/showtime.service";
import { MovieCard, type Movie } from "../components/ui/MovieCard";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { MapPin, ArrowLeft, Film } from "lucide-react";
import { Button } from "../components/ui/button";

export function CinemaDetailPage() {
  const { cinemaId } = useParams<{ cinemaId: string }>();
  const [cinema, setCinema] = useState<Cinema | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cinemaId) {
      fetchCinemaData(cinemaId);
    }
  }, [cinemaId]);

  const normalizeMovie = (movie: any): Movie => ({
    id: movie.id,
    title: movie.title,
    poster: movie.posterUrl || movie.poster || "",
    genre:
      typeof movie.genre === "string"
        ? movie.genre.split(",").map((g: string) => g.trim())
        : Array.isArray(movie.genre)
          ? movie.genre
          : [],
    duration: movie.durationMinutes ? `${movie.durationMinutes} phút` : movie.duration || "",
    releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('en-GB') : "",
    trailerUrl: movie.trailerUrl || "",
  });

  const fetchCinemaData = async (id: string) => {
    try {
      setLoading(true);
      const [cinemaRes, showtimesRes, moviesRes] = await Promise.all([
        CinemaService.getById(id),
        ShowtimeService.getByCinema(id),
        movieService.getAllMovies(true)
      ]);

      if (cinemaRes.succeeded && cinemaRes.data) {
        setCinema(cinemaRes.data);
      }

      const showtimes = showtimesRes.data || [];
      const allMovies = moviesRes || [];
      
      // Get unique movie IDs from showtimes
      const movieIds = new Set(showtimes.map((st: Showtime) => st.movieId));
      
      // Filter allMovies to only include those in showtimes
      const cinemaMovies = allMovies
        .filter((m: any) => movieIds.has(m.id))
        .map(normalizeMovie);
      
      setMovies(cinemaMovies);
    } catch (error) {
      console.error("Error fetching cinema data", error);
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

  if (!cinema) {
    return (
      <div className="container py-24 text-center">
        <p className="text-xl font-semibold">Không tìm thấy thông tin rạp chiếu.</p>
        <Link to="/theaters" className="mt-4 inline-block">
          <Button>Quay lại danh sách rạp</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-12 space-y-12 animate-in fade-in duration-700">
      <Link to="/theaters" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors gap-2">
        <ArrowLeft className="h-4 w-4" />
        Tiếp tục xem rạp khác
      </Link>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary font-medium tracking-wider uppercase text-xs">
          <MapPin className="h-4 w-4" />
          <span>{cinema.city}</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          {cinema.name}
        </h1>
        <p className="text-muted-foreground text-lg max-w-[800px]">
          {cinema.address}
        </p>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Film className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Phim đang chiếu</h2>
        </div>

        {movies.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl border border-dashed border-white/10 bg-card/20 backdrop-blur-sm">
            <p className="text-muted-foreground">Hiện chưa có lịch chiếu phim nào tại rạp này.</p>
          </div>
        )}
      </div>
    </div>
  );
}

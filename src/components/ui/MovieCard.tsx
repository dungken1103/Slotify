import { Clock } from "lucide-react";
import { Button } from "./button";
import { Link } from "react-router-dom";

export interface Movie {
  id: string;
  title: string;
  poster: string;
  genre: string[];
  duration: string;
  releaseDate: string;
  trailerUrl?: string;
  releaseDateISO?: string;
  isActive?: boolean;
}

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: Readonly<MovieCardProps>) {
  const hasPoster = Boolean(movie.poster);
  return (
    <div className="group relative overflow-hidden rounded-xl bg-card border border-border/50 shadow-md transition-all hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
      <div className="aspect-[2/3] w-full overflow-hidden">
        {hasPoster ? (
          <img
            src={movie.poster}
            alt={movie.title || "Poster"}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="h-full w-full bg-secondary/30 flex items-center justify-center">
            <span className="text-xs text-muted-foreground px-3 text-center line-clamp-2">
              {movie.title || "Chưa có poster"}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
          <Link to={`/movie/${movie.id}`} className="w-full">
            <Button className="w-full bg-primary hover:bg-primary/90">
              Đặt vé
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-semibold leading-tight text-foreground line-clamp-1"
            title={movie.title}
          >
            {movie.title || "Chưa có tiêu đề"}
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 shrink-0">
            <Clock className="h-3 w-3" /> {movie.duration || "Chưa rõ"}
          </span>
          <div className="flex gap-1 flex-wrap overflow-hidden h-[20px] justify-end flex-1">
            {Array.isArray(movie.genre) && movie.genre.slice(0, 2).map((g, i) => (
               <span key={`${movie.id}-${g}-${i}`} className="px-1.5 py-0.5 rounded-full bg-secondary/50 text-secondary-foreground border border-white/10 text-[10px] whitespace-nowrap">{g.trim()}</span>
            ))}
            {Array.isArray(movie.genre) && movie.genre.length > 2 && <span className="px-1.5 py-0.5 rounded-full bg-secondary/50 text-secondary-foreground border border-white/10 text-[10px]">+{movie.genre.length - 2}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
import { Star, Clock } from "lucide-react";
import { Button } from "./button";
import { Link } from "react-router-dom";

export interface Movie {
  id: string;
  title: string;
  poster: string;
  rating: number;
  genre: string[];
  duration: string;
  releaseDate: string;
}

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-card border border-border/50 shadow-md transition-all hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
      <div className="aspect-[2/3] w-full overflow-hidden">
        <img
          src={movie.poster}
          alt={movie.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
          <Link to={`/movie/${movie.id}`} className="w-full">
            <Button className="w-full bg-primary hover:bg-primary/90">
              Book Ticket
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
            {movie.title}
          </h3>
          <div className="flex items-center gap-1 text-yellow-500 shrink-0">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="text-sm font-medium">{movie.rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {movie.duration}
          </span>
          <span>•</span>
          <span className="line-clamp-1">
            {Array.isArray(movie.genre) ? movie.genre.join(", ") : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
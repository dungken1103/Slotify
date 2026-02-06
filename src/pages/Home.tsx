import { Button } from "../components/ui/button";
import { MovieCard, type Movie } from "../components/ui/MovieCard";
import { Play } from "lucide-react";

// Mock Data
const FEATURED_MOVIE = {
  id: "1",
  title: "Dune: Part Two",
  backdrop: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=2070&auto=format&fit=crop", // Placeholder
  description: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
  genre: ["Sci-Fi", "Adventure"],
};

const NOW_SHOWING: Movie[] = [
  {
    id: "1",
    title: "Dune: Part Two",
    poster: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop", // Abstract SciFi
    rating: 8.9,
    genre: ["Sci-Fi", "Adventure"],
    duration: "2h 46m",
    releaseDate: "2024-03-01",
  },
  {
    id: "2",
    title: "Kung Fu Panda 4",
    poster: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop", // Placeholder
    rating: 7.6,
    genre: ["Animation", "Action"],
    duration: "1h 34m",
    releaseDate: "2024-03-08",
  },
  {
    id: "3",
    title: "Godzilla x Kong",
    poster: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop", // Placeholder
    rating: 7.2,
    genre: ["Action", "Sci-Fi"],
    duration: "1h 55m",
    releaseDate: "2024-03-29",
  },
  {
    id: "4",
    title: "Civil War",
    poster: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop", // Placeholder
    rating: 7.8,
    genre: ["Action", "Thriller"],
    duration: "1h 49m",
    releaseDate: "2024-04-12",
  },
];

export function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${FEATURED_MOVIE.backdrop})` }}
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
                {FEATURED_MOVIE.genre.join(" • ")}
              </span>
            </div>
            
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              {FEATURED_MOVIE.title}
            </h1>
            
            <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl line-clamp-3">
              {FEATURED_MOVIE.description}
            </p>
            
            <div className="flex items-center gap-4 pt-4">
              <Button size="lg" className="rounded-full px-8 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40">
                Book Tickets
              </Button>
              <Button size="lg" variant="outline" className="rounded-full gap-2 px-6 backdrop-blur-sm bg-black/10 border-white/10 hover:bg-white/10">
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
          <Button variant="link" className="text-primary">View all</Button>
        </div>
        
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
          {NOW_SHOWING.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
      
      {/* Coming Soon Section */}
      <section className="container py-16 pt-0 space-y-10">
         <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Coming Soon</h2>
          <Button variant="link" className="text-muted-foreground hover:text-primary">View all</Button>
        </div>
         <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
           {/* Reusing existing movies for demo */}
          {NOW_SHOWING.slice(0, 3).map((movie) => (
            <MovieCard key={`coming-${movie.id}`} movie={movie} />
          ))}
        </div>
      </section>
    </div>
  );
}

import { Link } from "react-router-dom";
import { Star, Clock, Calendar, ChevronLeft, Building2 } from "lucide-react";

// Mock Data (In a real app, fetch based on ID)
const MOVIE_DETAILS = {
  id: "1",
  title: "Dune: Part Two",
  backdrop: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=2070&auto=format&fit=crop",
  poster: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop",
  description: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.",
  rating: 8.9,
  duration: "2h 46m",
  releaseDate: "2024-03-01",
  director: "Denis Villeneuve",
  cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Javier Bardem"],
  genres: ["Sci-Fi", "Adventure", "Action"],
};

const SHOWTIMES = [
  { id: "101", time: "10:30 AM", type: "2D", theater: "Hall 1" },
  { id: "102", time: "01:15 PM", type: "IMAX", theater: "IMAX Hall" },
  { id: "103", time: "04:45 PM", type: "2D", theater: "Hall 3" },
  { id: "104", time: "08:30 PM", type: "IMAX", theater: "IMAX Hall" },
];

export function MovieDetailPage() {

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Backdrop Header */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${MOVIE_DETAILS.backdrop})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
        
        <div className="container relative h-full flex flex-col justify-end pb-10">
          <Link to="/" className="absolute top-8 left-4 md:left-8 text-white/80 hover:text-white flex items-center gap-2 transition-colors">
            <ChevronLeft className="h-6 w-6" /> Back to Home
          </Link>
          
          <div className="flex flex-col md:flex-row gap-8 items-end">
            <img 
               src={MOVIE_DETAILS.poster} 
               alt={MOVIE_DETAILS.title}
               className="hidden md:block w-48 rounded-lg shadow-2xl shadow-black/50 border border-white/10"
            />
            <div className="space-y-4">
               <div className="flex items-center gap-2 text-yellow-500">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="text-xl font-bold">{MOVIE_DETAILS.rating}</span>
                  <span className="text-muted-foreground ml-2 text-sm">(2.5k reviews)</span>
               </div>
               <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">{MOVIE_DETAILS.title}</h1>
               <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {MOVIE_DETAILS.duration}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {MOVIE_DETAILS.releaseDate}</span>
                  <span>{MOVIE_DETAILS.genres.join(", ")}</span>
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
               <p className="text-muted-foreground leading-relaxed text-lg">{MOVIE_DETAILS.description}</p>
            </section>
            
            <section>
               <h2 className="text-2xl font-bold mb-4">Cast & Crew</h2>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-card border border-border/50">
                     <p className="text-xs text-muted-foreground">Director</p>
                     <p className="font-medium">{MOVIE_DETAILS.director}</p>
                  </div>
                  {MOVIE_DETAILS.cast.map(actor => (
                     <div key={actor} className="p-4 rounded-lg bg-card border border-border/50">
                        <p className="text-xs text-muted-foreground">Actor</p>
                        <p className="font-medium">{actor}</p>
                     </div>
                  ))}
               </div>
            </section>
         </div>

         {/* Sidebar / Booking Panel */}
         <div className="space-y-6">
            <div className="rounded-xl border border-border/50 bg-card p-6 shadow-lg">
               <h3 className="flex items-center gap-2 text-xl font-bold mb-6">
                  <Building2 className="h-5 w-5 text-primary" />
                  Select Showtime
               </h3>
               
               <div className="space-y-3">
                  {SHOWTIMES.map((time) => (
                     <Link to={`/booking/${time.id}`} key={time.id} className="block group">
                        <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                           <div>
                              <p className="font-bold text-lg group-hover:text-primary transition-colors">{time.time}</p>
                              <p className="text-xs text-muted-foreground">{time.theater}</p>
                           </div>
                           <div className="text-right">
                              <span className="inline-block px-2 py-1 text-xs font-bold rounded bg-secondary text-secondary-foreground">{time.type}</span>
                           </div>
                        </div>
                     </Link>
                  ))}
               </div>
               
               <div className="mt-6 pt-6 border-t border-border/50 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Price starts from</p>
                  <p className="text-2xl font-bold text-primary">$12.50</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

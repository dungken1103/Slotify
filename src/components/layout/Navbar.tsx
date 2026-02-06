import { Film } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

export function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 transition-opacity hover:opacity-90">
          <Film className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            Slotify
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link to="/" className="text-foreground/80 hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/movies" className="text-foreground/80 hover:text-primary transition-colors">
            Movies
          </Link>
          <Link to="/theaters" className="text-foreground/80 hover:text-primary transition-colors">
            Theaters
          </Link>
          <Link to="/news" className="text-foreground/80 hover:text-primary transition-colors">
            News
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            {/* Search Input Placeholder */}
          </div>
          <Link to="/login">
             <Button variant="ghost" size="sm" className="hidden md:flex text-foreground hover:text-primary hover:bg-white/5">
                Sign In
             </Button>
          </Link>
          <Link to="/register">
             <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                Join Now
             </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

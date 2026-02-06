import { Film, Facebook, Twitter, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-black py-12 text-muted-foreground">
      <div className="container grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Film className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Slotify</span>
          </div>
          <p className="text-sm leading-relaxed">
            Experience movies like never before. Book your tickets seamlessly and enjoy the show.
          </p>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground tracking-wider uppercase">Movies</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-primary transition-colors">Now Showing</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Coming Soon</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Top Rated</a></li>
          </ul>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground tracking-wider uppercase">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
          </ul>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground tracking-wider uppercase">Follow Us</h4>
          <div className="flex space-x-4">
             <a href="#" className="hover:text-primary transition-colors"><Facebook className="h-5 w-5" /></a>
             <a href="#" className="hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a>
             <a href="#" className="hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></a>
          </div>
        </div>
        
      </div>
      <div className="container mt-12 border-t border-white/5 pt-8 text-center text-xs">
        <p>&copy; 2024 Slotify Inc. All rights reserved.</p>
      </div>
    </footer>
  );
}

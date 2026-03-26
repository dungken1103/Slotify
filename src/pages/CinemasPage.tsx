import { useEffect, useState } from "react";
import { CinemaService, type Cinema } from "../services/cinema.service";
import { CinemaCard } from "../components/ui/CinemaCard";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Input } from "../components/ui/input";
import { Search, MapPin } from "lucide-react";

export function CinemasPage() {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [filteredCinemas, setFilteredCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCinemas();
  }, []);

  useEffect(() => {
    const filtered = cinemas.filter(cinema => 
      cinema.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cinema.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cinema.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCinemas(filtered);
  }, [searchQuery, cinemas]);

  const fetchCinemas = async () => {
    try {
      setLoading(true);
      const data = await CinemaService.getAll(false);
      if (data.succeeded) {
        setCinemas(data.data || []);
        setFilteredCinemas(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching cinemas", error);
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
                <MapPin className="h-4 w-4" />
                <span>Hệ thống rạp</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                Tất Cả Rạp Chiếu
            </h1>
            <p className="text-muted-foreground text-lg max-w-[600px]">
                Tìm kiếm rạp Slotify gần bạn nhất để tận hưởng những bộ phim đỉnh cao với dịch vụ tốt nhất.
            </p>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Tìm theo tên rạp, thành phố..."
            className="pl-10 h-11 bg-card/50 border-white/10 hover:border-primary/50 focus:border-primary transition-all rounded-full shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-8">
        {filteredCinemas.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCinemas.map((cinema) => (
              <CinemaCard key={cinema.id} cinema={cinema} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 rounded-3xl border border-dashed border-white/10 bg-card/20 backdrop-blur-sm">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                 <Search className="h-8 w-8 text-muted-foreground opacity-20" />
            </div>
            <div>
                <p className="text-xl font-semibold">Không tìm thấy rạp nào</p>
                <p className="text-muted-foreground">Thử tìm kiếm với tên rạp hoặc thành phố khác nhé!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

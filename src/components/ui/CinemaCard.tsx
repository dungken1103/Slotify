import { MapPin, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

export interface Cinema {
  id: string;
  name: string;
  address: string;
  city: string;
  isActive: boolean;
  numberOfAuditoriums: number;
}

interface CinemaCardProps {
  cinema: Cinema;
}

export function CinemaCard({ cinema }: CinemaCardProps) {
  return (
    <Card className={cn("group transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden", !cinema.isActive && "opacity-60 grayscale-[50%]")}>
      <CardHeader className="relative pb-0 overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
            <div className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", cinema.isActive ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-destructive/10 text-destructive border border-destructive/20")}>
                {cinema.isActive ? "Đang hoạt động" : "Tạm ngưng"}
            </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
            <Building2 className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight line-clamp-1 group-hover:text-primary transition-colors duration-300">
            {cinema.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="space-y-2.5">
            <div className="flex items-start gap-2.5 text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
                <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span className="line-clamp-2 leading-relaxed">
                    {cinema.address}, {cinema.city}
                </span>
            </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
            <div className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-full border border-white/5">
                <span className="text-primary font-bold">{cinema.numberOfAuditoriums}</span> phòng chiếu
            </div>
            
            <Link to={`/theaters/${cinema.id}`}>
               <Button variant="ghost" size="sm" className="text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-all gap-1.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                   Chi tiết
               </Button>
            </Link>
        </div>
      </CardContent>
    </Card>
  );
}

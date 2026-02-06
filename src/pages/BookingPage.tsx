import { useState } from "react";
import { Button } from "../components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Seat Status
type SeatStatus = "available" | "occupied" | "selected";

interface Seat {
  id: string;
  row: string;
  number: number;
  status: SeatStatus;
  price: number;
}

// Generate Mock Seats
const ROWS = 8;
const COLS_PER_ROW = 10;
const INITIAL_SEATS: Seat[] = Array.from({ length: ROWS * COLS_PER_ROW }).map((_, i) => {
  const row = String.fromCharCode(65 + Math.floor(i / COLS_PER_ROW));
  const number = (i % COLS_PER_ROW) + 1;
  // Randomly occupy some seats
  const status: SeatStatus = Math.random() > 0.8 ? "occupied" : "available";
  const type = row > 'F' ? 'VIP' : 'Standard';
  const price = type === 'VIP' ? 18 : 12;
  
  return {
    id: `${row}${number}`,
    row,
    number,
    status,
    price
  };
});

export function BookingPage() {
  const navigate = useNavigate();
  const [seats] = useState<Seat[]>(INITIAL_SEATS);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const handleSeatClick = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.status === "occupied") return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => prev.filter(id => id !== seatId));
      // Revert status visually
      // In a real app we might just track selection separately from status
    } else {
      setSelectedSeats(prev => [...prev, seatId]);
    }
  };

  const totalPrice = selectedSeats.reduce((sum, id) => {
    const seat = seats.find(s => s.id === id);
    return sum + (seat?.price || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left: Seat Map */}
      <div className="flex-1 p-6 lg:p-10 flex flex-col relative">
        <Button variant="ghost" className="self-start mb-6 gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="flex-1 flex flex-col items-center justify-center min-h-[500px]">
          {/* Screen Visual */}
          <div className="w-2/3 h-2 bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-12 relative">
             <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground uppercase tracking-[0.2em]">Screen</div>
             <div className="absolute inset-0 bg-primary/20 blur-xl"></div>
          </div>
        
          <div className="grid grid-cols-10 gap-2 md:gap-4 mb-10">
            {seats.map((seat) => {
               const isSelected = selectedSeats.includes(seat.id);
               return (
                <button
                  key={seat.id}
                  disabled={seat.status === "occupied"}
                  onClick={() => handleSeatClick(seat.id)}
                  className={`
                    w-8 h-8 md:w-10 md:h-10 rounded-t-lg transition-all relative flex items-center justify-center text-[10px]
                    ${seat.status === "occupied" ? "bg-white/10 cursor-not-allowed text-transparent" : 
                      isSelected ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(220,38,38,0.5)] transform scale-110" : 
                      "bg-secondary hover:bg-primary/50 hover:text-white"
                    }
                  `}
                  title={`${seat.row}${seat.number} - $${seat.price}`}
                >
                  {isSelected && <Check className="h-4 w-4" />}
                  <span className={`absolute -bottom-1 left-0 right-0 h-1 bg-black/20 rounded-b-sm`}></span>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-6 text-sm text-muted-foreground">
             <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-secondary"></div> Available
             </div>
             <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-primary"></div> Selected
             </div>
             <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-white/10"></div> Occupied
             </div>
          </div>
        </div>
      </div>

      {/* Right: Booking Summary */}
      <div className="w-full lg:w-96 border-l border-border/50 bg-card p-8 flex flex-col shadow-2xl">
         <h2 className="text-2xl font-bold mb-6">Booking Summary</h2>
         
         <div className="space-y-6 flex-1">
            <div>
               <p className="text-sm text-muted-foreground mb-1">Movie</p>
               <h3 className="text-lg font-bold">Dune: Part Two</h3>
               <p className="text-sm text-muted-foreground">Today, 04:45 PM • Hall 3</p>
            </div>
            
            <div className="border-t border-border/50 pt-4">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Tickets ({selectedSeats.length})</span>
                  <span className="font-medium">${totalPrice}</span>
               </div>
               <div className="flex flex-wrap gap-2">
                  {selectedSeats.map(id => (
                     <span key={id} className="text-xs font-bold bg-primary/20 text-primary px-2 py-1 rounded">
                        {id}
                     </span>
                  ))}
               </div>
            </div>

            <div className="border-t border-border/50 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Convenience Fee</span>
                  <span className="font-medium">$2.00</span>
               </div>
            </div>
            
             <div className="border-t border-white/10 pt-4 mt-auto">
               <div className="flex justify-between items-center mb-6 text-xl font-bold">
                  <span>Total</span>
                  <span>${selectedSeats.length > 0 ? totalPrice + 2 : 0}</span>
               </div>
               
               <Button className="w-full py-6 text-lg shadow-lg shadow-primary/25" disabled={selectedSeats.length === 0}>
                  Proceed to Payment
               </Button>
            </div>
         </div>
      </div>
    </div>
  );
}

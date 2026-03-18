import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { bookingService } from "../services/bookingService";
import { ShowtimeService } from "../services/showtime.service";
import type { SeatAvailabilityResponse } from "../types/booking";
import type { Showtime } from "../services/showtime.service";

export function BookingPage() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [seats, setSeats] = useState<SeatAvailabilityResponse[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (showtimeId) {
      fetchData(showtimeId);
    }
  }, [showtimeId]);

  const fetchData = async (id: string) => {
    setLoading(true);
    try {
      const [stResponse, seatsData] = await Promise.all([
        ShowtimeService.getById(id),
        bookingService.getAvailableSeats(id)
      ]);
      if (stResponse.data) setShowtime(stResponse.data);
      if (seatsData) setSeats(seatsData);
    } catch (error) {
      console.error("Error fetching booking data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seatId: string) => {
    const seat = seats.find(s => s.seatId === seatId);
    if (!seat || !seat.isAvailable) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => prev.filter(id => id !== seatId));
    } else {
      setSelectedSeats(prev => [...prev, seatId]);
    }
  };

  const handleBooking = async () => {
    if (!showtimeId || selectedSeats.length === 0) return;
    
    setBookingLoading(true);
    try {
      const result = await bookingService.createBooking({
        showtimeId,
        seatIds: selectedSeats,
        paymentMethod: "SePay"
      });
      
      if (result.succeeded) {
        alert("Booking successful! Redirecting to my bookings...");
        navigate("/my-bookings");
      } else {
        alert(result.message || "Booking failed");
      }
    } catch (error: any) {
      console.error("Booking error", error);
      alert(error.response?.data?.message || "An error occurred during booking");
    } finally {
      setBookingLoading(false);
    }
  };

  const totalPrice = selectedSeats.reduce((sum, id) => {
    const seat = seats.find(s => s.seatId === id);
    return sum + (seat?.price || 0);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-xl font-medium">Loading seat map...</p>
        </div>
      </div>
    );
  }

  if (!showtime) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-xl">Showtime not found</div>;
  }

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
               const isSelected = selectedSeats.includes(seat.seatId);
               return (
                <button
                  key={seat.seatId}
                  disabled={!seat.isAvailable}
                  onClick={() => handleSeatClick(seat.seatId)}
                  className={`
                    h-8 md:h-10 rounded-t-lg transition-all relative flex items-center justify-center text-[10px] group
                    ${seat.type === 'Couple' ? 'col-span-2 w-full' : 'w-8 md:w-10'}
                    ${!seat.isAvailable ? "bg-white/10 cursor-not-allowed text-transparent" : 
                      isSelected ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(220,38,38,0.5)] transform scale-105" : 
                      seat.type === 'VIP' ? "bg-amber-500/20 text-amber-500 border border-amber-500/50 hover:bg-amber-500/40" :
                      seat.type === 'Couple' ? "bg-pink-500/20 text-pink-500 border border-pink-500/50 hover:bg-pink-500/40" :
                      "bg-secondary hover:bg-primary/50 hover:text-white"
                    }
                  `}
                  title={`${seat.row}${seat.number} - ${seat.type} - $${seat.price}`}
                >
                  {isSelected ? <Check className="h-4 w-4" /> : 
                    <span className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                      {seat.type === 'Couple' && <span className="text-[8px]">👫</span>}
                      {seat.row}{seat.number}
                    </span>
                  }
                  <span className={`absolute -bottom-1 left-0 right-0 h-1 bg-black/20 rounded-b-sm`}></span>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
             <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-secondary border border-border"></div> Standard
             </div>
             <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/50"></div> VIP
             </div>
             <div className="flex items-center gap-2">
                <div className="w-8 h-4 rounded bg-pink-500/20 border border-pink-500/50"></div> Couple
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
               <h3 className="text-lg font-bold">{showtime.movieTitle}</h3>
               <p className="text-sm text-muted-foreground">
                {new Date(showtime.startTime).toLocaleDateString()} • {new Date(showtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </p>
               <p className="text-sm text-muted-foreground mt-1">
                {showtime.cinemaName} • {showtime.auditoriumName}
               </p>
            </div>
            
            <div className="border-t border-border/50 pt-4">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Tickets ({selectedSeats.length})</span>
                  <span className="font-medium">${totalPrice.toFixed(2)}</span>
               </div>
               <div className="flex flex-wrap gap-2">
                  {selectedSeats.map(id => {
                    const seat = seats.find(s => s.seatId === id);
                    return (
                      <span key={id} className="text-xs font-bold bg-primary/20 text-primary px-2 py-1 rounded">
                         {seat?.row}{seat?.number}
                      </span>
                    );
                  })}
               </div>
            </div>

            <div className="border-t border-border/50 pt-4">
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="text-muted-foreground">Tax (Included)</span>
                  <span className="font-medium">$0.00</span>
               </div>
            </div>
            
             <div className="border-t border-white/10 pt-4 mt-auto">
               <div className="flex justify-between items-center mb-6 text-xl font-bold">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
               </div>
               
               <Button 
                className="w-full py-6 text-lg shadow-lg shadow-primary/25" 
                disabled={selectedSeats.length === 0 || bookingLoading}
                onClick={handleBooking}
               >
                  {bookingLoading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                  ) : (
                    "Proceed to Payment"
                  )}
               </Button>
            </div>
         </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { bookingService } from "../services/bookingService";
import type { BookingResponse } from "../types/booking";
import { Calendar, Clock, MapPin, Ticket, Loader2, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getMyBookings();
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

      {bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-card rounded-xl border border-border/50 overflow-hidden hover:border-primary/30 transition-colors shadow-sm">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        booking.status === 'Confirmed' ? 'bg-green-500/10 text-green-500' : 
                        booking.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {booking.status}
                      </span>
                      <span className="text-xs text-muted-foreground">ID: {booking.id.split('-')[0]}</span>
                    </div>
                    <h2 className="text-xl font-bold">{booking.movieTitle}</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-primary">${booking.totalAmount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-y border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary/50">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Date</p>
                      <p className="text-sm font-medium">{new Date(booking.startTime).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary/50">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Time</p>
                      <p className="text-sm font-medium">{new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary/50">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Location</p>
                      <p className="text-sm font-medium">{booking.cinemaName} • {booking.auditoriumName}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                   {booking.tickets.map(ticket => (
                      <div key={ticket.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/30 border border-border/50">
                        <Ticket className="h-3 w-3 text-primary" />
                        <span className="text-xs font-bold">{ticket.seatRow}{ticket.seatNumber}</span>
                        <span className="text-[10px] text-muted-foreground">({ticket.seatType})</span>
                      </div>
                   ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border flex flex-col items-center">
          <Ticket className="h-16 w-16 mb-4 opacity-10" />
          <h3 className="text-xl font-bold mb-2">No bookings yet</h3>
          <p className="text-muted-foreground mb-8">You haven't made any movie bookings yet.</p>
          <Link to="/" className="text-primary hover:underline flex items-center gap-1 font-medium">
            Explore movies <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { bookingService } from "../services/bookingService";
import { Button } from "../components/ui/button";
import { CheckCircle2, Home, Ticket, Loader2 } from "lucide-react";
import type { BookingResponse } from "../types/booking";
import { formatCurrency } from "@/lib/utils";

export function BookingSuccessPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails(bookingId);
    }
  }, [bookingId]);

  const fetchBookingDetails = async (id: string) => {
    try {
      const data = await bookingService.getBookingDetails(id);
      if (data) setBooking(data);
    } catch (error) {
      console.error("Error fetching booking details", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy thông tin đơn hàng</h1>
        <Button onClick={() => navigate("/")}>Quay lại trang chủ</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-card rounded-3xl shadow-2xl border border-border/50 p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="bg-green-500/20 p-4 rounded-full">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">Đặt vé thành công!</h1>
        <p className="text-muted-foreground mb-8">Cảm ơn bạn đã lựa chọn Slotify. Chúc bạn có những phút giây xem phim tuyệt vời.</p>

        <div className="bg-secondary/50 rounded-2xl p-6 mb-8 text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Phim:</span>
            <span className="font-bold">{booking.movieTitle}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Suất chiếu:</span>
            <span>{new Date(booking.startTime).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ghế:</span>
            <span className="font-bold">
              {booking.tickets.map(t => `${t.seatRow}${t.seatNumber}`).join(", ")}
            </span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-border/50">
            <span className="text-muted-foreground">Tổng tiền:</span>
            <span className="font-bold text-primary">{formatCurrency(booking.totalAmount)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="gap-2" onClick={() => navigate("/")}>
            <Home className="h-4 w-4" /> Trang chủ
          </Button>
          <Button className="gap-2" onClick={() => navigate("/my-bookings")}>
            <Ticket className="h-4 w-4" /> Vé của tôi
          </Button>
        </div>
      </div>
    </div>
  );
}

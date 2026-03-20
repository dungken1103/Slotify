import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { bookingService } from "../services/bookingService";
import { Button } from "../components/ui/button";
import { ArrowLeft, Clock, Loader2, QrCode } from "lucide-react";
import type { BookingResponse } from "../types/booking";
import { formatCurrency } from "@/lib/utils";

// Bank configuration - Placeholders for SePay/VietQR
// User can update these in a config file or .env later
const BANK_CONFIG = {
  BANK_ID: import.meta.env.VITE_SEPAY_BANK_ID || "TPB",
  ACCOUNT_NO: import.meta.env.VITE_SEPAY_ACCOUNT_NO || "43311032004",
  ACCOUNT_NAME: import.meta.env.VITE_SEPAY_ACCOUNT_NAME || "VO MINH LINH",
  TEMPLATE: "compact" // compact, qr_only, etc.
};

export function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails(bookingId);
      
      // Start polling for payment status
      const interval = setInterval(async () => {
        try {
          const data = await bookingService.getBookingDetails(bookingId);
          if (data && data.status === "Paid") {
            clearInterval(interval);
            navigate(`/booking-success/${bookingId}`);
          }
        } catch (error) {
          console.error("Polling error", error);
        }
      }, 3000); // Poll every 3 seconds

      return () => clearInterval(interval);
    }
  }, [bookingId, navigate]);

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

  const transactionContent = `slotify-ok-${booking.id}`;
  const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.BANK_ID}-${BANK_CONFIG.ACCOUNT_NO}-${BANK_CONFIG.TEMPLATE}.png?amount=${booking.totalAmount}&addInfo=${transactionContent}&accountName=${BANK_CONFIG.ACCOUNT_NAME}`;

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 flex flex-col items-center">
      <div className="max-w-4xl w-full">
        <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Invoice Details */}
          <div className="bg-card rounded-2xl p-8 shadow-xl border border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <QrCode className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Thanh toán đơn hàng</h1>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Mã đơn hàng:</span>
                <span className="font-mono font-medium">{booking.id}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Phim:</span>
                <span className="font-bold text-right">{booking.movieTitle}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Rạp:</span>
                <span>{booking.cinemaName} - {booking.auditoriumName}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Ghế:</span>
                <span className="font-bold">
                  {booking.tickets.map(t => `${t.seatRow}${t.seatNumber}`).join(", ")}
                </span>
              </div>
              <div className="flex justify-between pt-4">
                <span className="text-xl font-bold">Tổng tiền:</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(booking.totalAmount)}</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/20 flex gap-4">
              <Clock className="h-6 w-6 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">Đang chờ thanh toán</p>
                <p className="text-xs text-muted-foreground">Vui lòng quét mã QR bên cạnh để hoàn tất thanh toán. Hệ thống sẽ tự động xác nhận sau khi nhận được tiền.</p>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="bg-white rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center text-black">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-1">
                <QrCode className="h-5 w-5 text-primary" />
                <span className="font-bold text-lg uppercase tracking-wider">VietQR</span>
              </div>
              <p className="text-sm text-gray-500 italic">Quét mã bằng ứng dụng Ngân hàng hoặc Ví điện tử</p>
            </div>

            <div className="relative p-4 bg-gray-50 rounded-2xl border-4 border-primary/10 mb-6 group">
               <img 
                src={qrUrl} 
                alt="VietQR Payment" 
                className="w-64 h-64 object-contain"
               />
               <div className="absolute inset-0 border-2 border-primary/5 rounded-xl pointer-events-none"></div>
            </div>

            <div className="flex items-center justify-center gap-2 text-amber-600 animate-pulse mb-6">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Đang chờ hệ thống xác nhận...</span>
            </div>

            <div className="w-full space-y-3">
              <div className="bg-gray-100 p-3 rounded-lg flex justify-between items-center">
                <span className="text-xs text-gray-500">Nội dung chuyển khoản:</span>
                <span className="font-bold text-sm text-primary">{transactionContent}</span>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg text-center">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.1em] mb-1">Ngân hàng thụ hưởng</p>
                <p className="font-bold text-sm">{BANK_CONFIG.BANK_ID} - {BANK_CONFIG.ACCOUNT_NO}</p>
                <p className="text-xs text-gray-500">{BANK_CONFIG.ACCOUNT_NAME}</p>
              </div>
            </div>
            
            
          </div>
        </div>
      </div>
    </div>
  );
}

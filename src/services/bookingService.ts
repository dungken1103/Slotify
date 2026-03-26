import { api } from "../middlewares/interceptors";
import type { ApiResponse } from "../types/api";
import type { BookingRequest, BookingResponse, SeatAvailabilityResponse } from "../types/booking";

export const bookingService = {
  async getAvailableSeats(showtimeId: string) {
    const res = await api.get<ApiResponse<SeatAvailabilityResponse[]>>(`/Booking/available-seats/${showtimeId}`);
    return res.data.data;
  },

  async createBooking(request: BookingRequest) {
    const res = await api.post<ApiResponse<BookingResponse>>('/Booking/create', request);
    return res.data;
  },

  async getBookingDetails(id: string) {
    const res = await api.get<ApiResponse<BookingResponse>>(`/Booking/${id}`);
    return res.data.data;
  },

  async getMyBookings() {
    const res = await api.get<ApiResponse<BookingResponse[]>>('/Booking/my-bookings');
    return res.data.data;
  },

  async sendMyConfirmationEmail(id: string) {
    const res = await api.post<ApiResponse<object>>(`/Booking/${id}/send-my-confirmation-email`);
    return res.data;
  }
};

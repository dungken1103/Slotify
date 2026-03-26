import type { BookingResponse } from "./booking";

export interface AdminDashboardResponse {
  ticketsSoldToday: number;
  paidBookingsTodayCount: number;
  revenueToday: number;
  recentPaidBookings: BookingResponse[];
}


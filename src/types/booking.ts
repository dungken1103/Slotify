
export interface TicketResponse {
  id: string;
  seatRow: string;
  seatNumber: number;
  seatType: string;
  price: number;
}

export interface BookingResponse {
  id: string;
  bookingDate: string;
  totalAmount: number;
  status: string;
  movieTitle: string;
  cinemaName: string;
  auditoriumName: string;
  startTime: string;
  tickets: TicketResponse[];
}

export interface SeatAvailabilityResponse {
  seatId: string;
  row: string;
  number: number;
  type: string;
  isAvailable: boolean;
  price: number;
}

export interface BookingRequest {
  showtimeId: string;
  seatIds: string[];
  paymentMethod: string;
}

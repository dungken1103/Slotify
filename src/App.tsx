import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import { MainLayout } from "./layouts/MainLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { HomePage } from "./pages/Home";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { MovieDetailPage } from "./pages/MovieDetail";
import { BookingPage } from "./pages/BookingPage";
import { PaymentPage } from "./pages/PaymentPage";
import { BookingSuccessPage } from "./pages/BookingSuccessPage";
import { MyBookingsPage } from "./pages/MyBookings";

import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { ProfilePage } from "./pages/ProfilePage";

import { AdminRoute } from "./components/guards/AdminRoute";
import { AdminLayout } from "./layouts/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminMoviesPage } from "./pages/admin/AdminMoviesPage";
import { AdminCinemasPage } from "./pages/admin/AdminCinemasPage";
import { AdminAuditoriumsPage } from "./pages/admin/AdminAuditoriumsPage";
import { AdminSeatsPage } from "./pages/admin/AdminSeatsPage";
import { AdminShowtimesPage } from "./pages/admin/AdminShowtimesPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/movies" element={<HomePage />} />
            <Route path="/movie/:id" element={<MovieDetailPage />} />
            {/* Add other main routes here */}

            {/* Protected Profile Route Note: Should ideally add a guard component but this works for routing */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
          </Route>

          <Route path="/booking/:showtimeId" element={<BookingPage />} />
          <Route path="/payment/:bookingId" element={<PaymentPage />} />
          <Route path="/booking-success/:bookingId" element={<BookingSuccessPage />} />

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/movies" element={<AdminMoviesPage />} />
              <Route path="/admin/cinemas" element={<AdminCinemasPage />} />
              <Route path="/admin/cinemas/:cinemaId/auditoriums" element={<AdminAuditoriumsPage />} />
              <Route path="/admin/cinemas/:cinemaId/auditoriums/:auditoriumId/seats" element={<AdminSeatsPage />} />
              <Route path="/admin/showtimes" element={<AdminShowtimesPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              {/* Placeholders for other admin routes */}
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

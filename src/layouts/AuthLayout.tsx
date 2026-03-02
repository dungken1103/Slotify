import { Outlet } from "react-router-dom";
import { Film } from "lucide-react";
import { Link } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="container relative flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 min-h-screen">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        {/* Beautiful Cinematic Hero Image */}
        <div
          className="absolute inset-0 bg-zinc-900 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop')" }}
        >
          {/* Dark Overlay for readability */}
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <Link to="/" className="relative z-20 flex items-center text-lg font-medium hover:opacity-90 transition-opacity">
          <Film className="mr-2 h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight text-white">
            Slotify
          </span>
        </Link>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Trải nghiệm điện ảnh đỉnh cao bắt đầu từ đây. Đặt vé nhanh chóng, chớp ngay ghế đẹp và tận hưởng những bộ phim bom tấn cùng Slotify.&rdquo;
            </p>
            <footer className="text-sm text-gray-300">Đội ngũ Slotify</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8 flex items-center h-full">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

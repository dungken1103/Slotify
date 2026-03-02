import { Film, UserCircle, LogOut, Settings, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuthStore } from "../../store/useAuthStore";
import { AuthService } from "../../services/auth.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function Navbar() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">

        {/* Left Section (Logo) - takes up 1 part of space */}
        <div className="flex flex-1 items-center justify-start">
          <Link to="/" className="flex items-center space-x-2 transition-opacity hover:opacity-90">
            <Film className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground">
              Slotify
            </span>
          </Link>
        </div>

        {/* Middle Section (Nav Links) - naturally rests perfectly in the center */}
        <nav className="hidden md:flex items-center justify-center space-x-8 text-sm font-medium">
          <Link to="/" className="text-foreground/80 hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <Link to="/movies" className="text-foreground/80 hover:text-primary transition-colors">
            Phim
          </Link>
          <Link to="/theaters" className="text-foreground/80 hover:text-primary transition-colors">
            Rạp chiếu
          </Link>
          <Link to="/news" className="text-foreground/80 hover:text-primary transition-colors">
            Tin tức
          </Link>
        </nav>

        {/* Right Section (Auth / Profile) - takes up 1 part of space */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="hidden md:block">
            {/* Search Input Placeholder */}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="hidden md:flex text-foreground hover:text-primary hover:bg-white/5">
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                    Đăng ký
                  </Button>
                </Link>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative flex items-center gap-2 rounded-full outline outline-1 outline-white/10 px-2 py-1.5 h-auto hover:bg-white/5 transition-colors">
                    <div className="h-8 w-8 rounded-full shadow-sm overflow-hidden bg-secondary flex items-center justify-center">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full object-cover" />
                      ) : (
                        <UserCircle className="h-6 w-6 text-foreground/80" />
                      )}
                    </div>
                    <span className="hidden md:block text-sm font-medium max-w-[120px] truncate text-foreground pr-2">
                      {user?.fullName || user?.username || "Tài khoản"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/profile">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Tài khoản</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground hover:bg-white/5 rounded-full">
                  <Menu className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex flex-col space-y-1 p-1">
                  <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors px-2 py-2 rounded-md hover:bg-white/5">
                    Trang chủ
                  </Link>
                  <Link to="/movies" className="text-sm font-medium text-foreground hover:text-primary transition-colors px-2 py-2 rounded-md hover:bg-white/5">
                    Phim
                  </Link>
                  <Link to="/theaters" className="text-sm font-medium text-foreground hover:text-primary transition-colors px-2 py-2 rounded-md hover:bg-white/5">
                    Rạp chiếu
                  </Link>
                  <Link to="/news" className="text-sm font-medium text-foreground hover:text-primary transition-colors px-2 py-2 rounded-md hover:bg-white/5">
                    Tin tức
                  </Link>
                </div>

                <DropdownMenuSeparator />

                {!isAuthenticated ? (
                  <div className="flex flex-col space-y-2 p-2">
                    <Link to="/login" className="w-full">
                      <Button variant="ghost" className="w-full justify-start text-foreground">
                        Đăng nhập
                      </Button>
                    </Link>
                    <Link to="/register" className="w-full">
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        Đăng ký
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full shadow-sm overflow-hidden bg-secondary flex items-center justify-center shrink-0">
                          {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full object-cover" />
                          ) : (
                            <UserCircle className="h-5 w-5 text-foreground/80" />
                          )}
                        </div>
                        <div className="flex flex-col space-y-1 truncate">
                          <p className="text-sm font-medium leading-none truncate">{user?.fullName}</p>
                          <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/profile">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Tài khoản</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500 p-2">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Đăng xuất</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

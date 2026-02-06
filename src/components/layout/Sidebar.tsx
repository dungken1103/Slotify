import { Home, Compass, Heart, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const pathname = location.pathname;

  const items = [
    { href: "/", title: "Home", icon: Home },
    { href: "/browse", title: "Browse", icon: Compass },
    { href: "/favorites", title: "Favorites", icon: Heart },
    { href: "/settings", title: "Settings", icon: Settings },
  ];

  return (
    <div className={cn("pb-12 w-64 border-r hidden md:block min-h-screen", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Discover
          </h2>
          <div className="space-y-1">
            {items.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

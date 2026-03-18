import { Film, Facebook, Twitter, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-black py-12 text-muted-foreground">
      <div className="container grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Film className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Slotify</span>
          </div>
          <p className="text-sm leading-relaxed">
            Trải nghiệm điện ảnh theo cách hoàn toàn mới. Đặt vé mượt mà và thưởng thức bộ phim.
          </p>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground tracking-wider uppercase">Phim</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-primary transition-colors">Đang chiếu</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Sắp chiếu</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Đánh giá cao</a></li>
          </ul>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground tracking-wider uppercase">Hỗ trợ</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-primary transition-colors">Câu hỏi thường gặp</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Liên hệ</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Điều khoản dịch vụ</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Chính sách bảo mật</a></li>
          </ul>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground tracking-wider uppercase">Theo dõi chúng tôi</h4>
          <div className="flex space-x-4">
             <a href="#" className="hover:text-primary transition-colors"><Facebook className="h-5 w-5" /></a>
             <a href="#" className="hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a>
             <a href="#" className="hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></a>
          </div>
        </div>
        
      </div>
      <div className="container mt-12 border-t border-white/5 pt-8 text-center text-xs">
        <p>&copy; 2024 Slotify Inc. Bản quyền đã được bảo lưu.</p>
      </div>
    </footer>
  );
}

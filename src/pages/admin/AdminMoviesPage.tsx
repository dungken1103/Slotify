export function AdminMoviesPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Quản Lý Phim</h2>
                    <p className="text-muted-foreground mt-1">Quản lý toàn bộ danh mục phim đang và sắp chiếu của hệ thống.</p>
                </div>
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-all shadow-md hover:shadow-lg font-medium">
                    + Thêm Phim Mới
                </button>
            </div>

            <div className="border border-border/50 rounded-xl p-12 flex flex-col items-center justify-center text-muted-foreground bg-card/50 shadow-sm gap-3 backdrop-blur-sm border-dashed">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 3v18" /><path d="M3 7.5h4" /><path d="M3 12h18" /><path d="M3 16.5h4" /><path d="M17 3v18" /><path d="M17 7.5h4" /><path d="M17 16.5h4" /></svg>
                </div>
                <p className="text-lg font-semibold text-foreground">Bảng dữ liệu đang được phát triển</p>
                <p className="text-sm text-center max-w-md">Tính năng quản lý danh sách phim (Bảng, Phân trang, Tìm kiếm, Lọc) sẽ xuất hiện tại đây trong phiên bản tiếp theo.</p>
            </div>
        </div>
    );
}

import { useEffect, useState } from "react";
import { ShowtimeService } from "../../services/showtime.service";
import type { Showtime, ShowtimeRequest } from "../../services/showtime.service";
import { movieService } from "../../services/movie.service";
import type { MovieResponse as Movie } from "../../types/movie";
import { CinemaService } from "../../services/cinema.service";
import type { Cinema } from "../../services/cinema.service";
import { AuditoriumService } from "../../services/auditorium.service";
import type { Auditorium } from "../../services/auditorium.service";

import { Button } from "../../components/ui/button";
import { Plus, Edit, Trash2, Calendar, Clock, Loader2, MapPin, Film } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";

export function AdminShowtimesPage() {
    const [showtimes, setShowtimes] = useState<Showtime[]>([]);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [auditoriums, setAuditoriums] = useState<Auditorium[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingShowtime, setEditingShowtime] = useState<Showtime | null>(null);

    const [selectedCinemaId, setSelectedCinemaId] = useState<string>("");

    const [formData, setFormData] = useState<ShowtimeRequest>({
        startTime: "",
        endTime: "",
        standardPrice: 0,
        vipPrice: 0,
        couplePrice: 0,
        movieId: "",
        auditoriumId: ""
    });

    const fetchInitialData = async () => {
        try {
            setIsLoading(true);
            const [showtimesRes, moviesRes, cinemasRes] = await Promise.all([
                ShowtimeService.getAll(),
                movieService.getAllMovies(true),
                CinemaService.getAll(false) // Only active cinemas
            ]);

            if (showtimesRes.succeeded) setShowtimes(showtimesRes.data ?? []);
            if (moviesRes) setMovies(moviesRes as unknown as Movie[]);
            if (cinemasRes.succeeded) setCinemas(cinemasRes.data ?? []);

        } catch (err) {
            setError("Đã xảy ra lỗi khi tải dữ liệu");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    // Fetch auditoriums when cinema changes
    useEffect(() => {
        const fetchAuditoriums = async () => {
            if (!selectedCinemaId) {
                setAuditoriums([]);
                return;
            }
            try {
                const res = await AuditoriumService.getByCinema(selectedCinemaId, false);
                if (res.succeeded) {
                    setAuditoriums(res.data ?? []);
                }
            } catch (err) {
                console.error("Lỗi khi tải phòng chiếu", err);
            }
        };
        fetchAuditoriums();
    }, [selectedCinemaId]);

    const handleOpenDialog = (showtime?: Showtime) => {
        if (showtime) {
            setEditingShowtime(showtime);
            setSelectedCinemaId(showtime.cinemaId);

            // Format datetime for input type="datetime-local" (YYYY-MM-DDThh:mm)
            const formatForInput = (dateStr: string) => {
                const d = new Date(dateStr);
                // Adjust for local timezone offset
                d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                return d.toISOString().slice(0, 16);
            };

            setFormData({
                startTime: formatForInput(showtime.startTime),
                endTime: formatForInput(showtime.endTime),
                standardPrice: showtime.standardPrice,
                vipPrice: showtime.vipPrice,
                couplePrice: showtime.couplePrice,
                movieId: showtime.movieId,
                auditoriumId: showtime.auditoriumId
            });
        } else {
            setEditingShowtime(null);
            setSelectedCinemaId("");
            setFormData({
                startTime: "",
                endTime: "",
                standardPrice: 50000,
                vipPrice: 70000,
                couplePrice: 120000,
                movieId: "",
                auditoriumId: ""
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Convert local datetime to UTC for backend if needed, or send as IsoString
        try {
            setIsSubmitting(true);
            const payload: ShowtimeRequest = {
                ...formData,
                startTime: new Date(formData.startTime).toISOString(),
                endTime: new Date(formData.endTime).toISOString(),
            };

            if (editingShowtime) {
                await ShowtimeService.update(editingShowtime.id, payload);
            } else {
                await ShowtimeService.create(payload);
            }
            setIsDialogOpen(false);

            // Refetch showtimes
            const res = await ShowtimeService.getAll();
            if (res.succeeded) setShowtimes(res.data ?? []);

        } catch (err: any) {
            console.error("Lỗi khi lưu lịch chiếu", err);
            // In a real app, read the API error message
            alert(err?.response?.data?.message || "Đã xảy ra lỗi khi lưu thông tin. Có thể do trùng lịch chiếu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa lịch chiếu này không? Hành động này không thể hoàn tác.")) {
            try {
                await ShowtimeService.delete(id);
                // Refetch
                const res = await ShowtimeService.getAll();
                if (res.succeeded) setShowtimes(res.data ?? []);
            } catch (err) {
                console.error("Lỗi khi xóa lịch chiếu", err);
                alert("Không thể xóa lịch chiếu này.");
            }
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Quản Lý Lịch Chiếu</h2>
                    <p className="text-muted-foreground mt-1">Sắp xếp lịch chiếu phim cho các rạp và phòng chiếu.</p>
                </div>
                <Button
                    className="gap-2 shadow-md hover:shadow-lg transition-all"
                    onClick={() => handleOpenDialog()}
                >
                    <Plus className="h-4 w-4" /> Thêm Lịch Chiếu
                </Button>
            </div>

            {error && (
                <div className="bg-destructive/15 text-destructive p-4 rounded-md border border-destructive/20">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse shadow-sm">
                            <CardHeader className="h-24 bg-muted/50 rounded-t-lg" />
                            <CardContent className="h-32 bg-card rounded-b-lg" />
                        </Card>
                    ))}
                </div>
            ) : showtimes.length === 0 ? (
                <div className="border border-border/50 rounded-xl p-12 flex flex-col items-center justify-center text-muted-foreground bg-card/50 shadow-sm gap-3 backdrop-blur-sm border-dashed">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">Chưa có lịch chiếu nào</p>
                    <p className="text-sm text-center max-w-md">Hãy bắt đầu lên lịch chiếu cho các bộ phim tại khu vực rạp.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {showtimes.map((showtime) => (
                        <Card key={showtime.id} className="transition-all duration-200 hover:shadow-md">
                            <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2 line-clamp-1">
                                        <Film className="h-4 w-4 text-primary" /> {showtime.movieTitle}
                                    </CardTitle>
                                    <div className="flex items-center text-sm text-muted-foreground gap-1">
                                        <MapPin className="h-3 w-3" />
                                        <span className="line-clamp-1">{showtime.cinemaName} - {showtime.auditoriumName}</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="bg-muted/30 rounded-md p-3 space-y-2 border border-border/50">
                                        <div className="flex items-center text-sm font-medium gap-2">
                                            <Clock className="h-4 w-4 text-primary" />
                                            Bắt đầu: {formatDateTime(showtime.startTime)}
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground gap-2 pl-6">
                                            Kết thúc: {formatDateTime(showtime.endTime)}
                                        </div>
                                    </div>

                                    <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
                                        <div className="flex justify-between">
                                            <span>Giá Standard:</span>
                                            <span className="font-semibold text-foreground">{formatCurrency(showtime.standardPrice)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Giá VIP:</span>
                                            <span className="font-semibold text-foreground">{formatCurrency(showtime.vipPrice)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Giá Couple:</span>
                                            <span className="font-semibold text-foreground">{formatCurrency(showtime.couplePrice)}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 border-t border-border pt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 gap-1 text-muted-foreground hover:text-primary transition-colors"
                                            onClick={() => handleOpenDialog(showtime)}
                                        >
                                            <Edit className="h-3.5 w-3.5" /> Sửa
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 gap-1 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                                            onClick={() => handleDelete(showtime.id)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" /> Xóa
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingShowtime ? "Cập Nhật Lịch Chiếu" : "Thêm Lịch Chiếu Mới"}</DialogTitle>
                        <DialogDescription>
                            {editingShowtime ? "Thay đổi thời gian hoặc giá vé cho lịch chiếu này." : "Chọn phim, rạp phòng và thiết lập thời gian chiếu."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[70vh] p-1">
                        <div className="grid gap-4 py-4">

                            {/* Phim */}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="movieId" className="text-right whitespace-nowrap">Phim chiếu <span className="text-destructive">*</span></Label>
                                <select
                                    id="movieId"
                                    className="col-span-3 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.movieId}
                                    onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>--- Chọn phim ---</option>
                                    {movies.map(m => (
                                        <option key={m.id} value={m.id}>{m.title}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Cụm Rạp */}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="cinemaId" className="text-right whitespace-nowrap">Cụm rạp <span className="text-destructive">*</span></Label>
                                <select
                                    id="cinemaId"
                                    className="col-span-3 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={selectedCinemaId}
                                    onChange={(e) => {
                                        setSelectedCinemaId(e.target.value);
                                        setFormData({ ...formData, auditoriumId: "" }); // Reset auditorium selection
                                    }}
                                    required
                                >
                                    <option value="" disabled>--- Chọn cụm rạp ---</option>
                                    {cinemas.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Phòng chiếu */}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="auditoriumId" className="text-right whitespace-nowrap">Phòng chiếu <span className="text-destructive">*</span></Label>
                                <select
                                    id="auditoriumId"
                                    className="col-span-3 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.auditoriumId}
                                    onChange={(e) => setFormData({ ...formData, auditoriumId: e.target.value })}
                                    disabled={!selectedCinemaId || auditoriums.length === 0}
                                    required
                                >
                                    <option value="" disabled>
                                        {!selectedCinemaId
                                            ? "Vui lòng chọn rạp trước"
                                            : auditoriums.length === 0
                                                ? "Rạp này chưa có phòng chiếu"
                                                : "--- Chọn phòng chiếu ---"}
                                    </option>
                                    {auditoriums.map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Thời gian */}
                            <div className="grid grid-cols-4 items-center gap-4 mt-2">
                                <Label htmlFor="startTime" className="text-right whitespace-nowrap">Bắt đầu <span className="text-destructive">*</span></Label>
                                <Input
                                    id="startTime"
                                    type="datetime-local"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="endTime" className="text-right whitespace-nowrap">Kết thúc <span className="text-destructive">*</span></Label>
                                <Input
                                    id="endTime"
                                    type="datetime-local"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    className="col-span-3"
                                    required
                                />
                            </div>

                            {/* Giá vé */}
                            <div className="grid grid-cols-4 items-center gap-4 mt-2">
                                <Label htmlFor="standardPrice" className="text-right whitespace-nowrap">Giá Standard (VNĐ)</Label>
                                <Input
                                    id="standardPrice"
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={formData.standardPrice}
                                    onChange={(e) => setFormData({ ...formData, standardPrice: Number(e.target.value) })}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="vipPrice" className="text-right whitespace-nowrap">Giá VIP (VNĐ)</Label>
                                <Input
                                    id="vipPrice"
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={formData.vipPrice}
                                    onChange={(e) => setFormData({ ...formData, vipPrice: Number(e.target.value) })}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="couplePrice" className="text-right whitespace-nowrap">Giá Couple (VNĐ)</Label>
                                <Input
                                    id="couplePrice"
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={formData.couplePrice}
                                    onChange={(e) => setFormData({ ...formData, couplePrice: Number(e.target.value) })}
                                    className="col-span-3"
                                    required
                                />
                            </div>

                        </div>
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Hủy bỏ
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingShowtime ? "Lưu thay đổi" : "Tạo mới"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

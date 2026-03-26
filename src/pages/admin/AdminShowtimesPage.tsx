import { useEffect, useMemo, useState, useCallback } from "react";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import { ShowtimeService } from "../../services/showtime.service";
import type { Showtime, ShowtimeRequest } from "../../services/showtime.service";
import { movieService } from "../../services/movie.service";
import type { MovieResponse as Movie } from "../../types/movie";
import { CinemaService } from "../../services/cinema.service";
import type { Cinema } from "../../services/cinema.service";
import { AuditoriumService } from "../../services/auditorium.service";
import type { Auditorium } from "../../services/auditorium.service";

import { Button } from "../../components/ui/button";
import { Plus, Edit, Trash2, Calendar, Clock, Loader2, MapPin, Film, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
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
import { ConfirmDialog } from "../../components/ui/confirm-dialog";

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
    const [isDeleting, setIsDeleting] = useState(false);
    const [editingShowtime, setEditingShowtime] = useState<Showtime | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const [selectedCinemaId, setSelectedCinemaId] = useState<string>("");

    // Filter state
    const [filterMovieId, setFilterMovieId] = useState<string>("");
    const [filterCinemaId, setFilterCinemaId] = useState<string>("");
    const [filterDate, setFilterDate] = useState<Date | null>(null);

    // Generate dates from today → max startTime in loaded showtimes
    const availableDates = useMemo(() => {
        const today = startOfDay(new Date());
        if (showtimes.length === 0) return [today];
        const maxDate = startOfDay(
            new Date(Math.max(...showtimes.map(s => new Date(s.startTime).getTime())))
        );
        const days: Date[] = [];
        let cursor = today;
        while (cursor <= maxDate) {
            days.push(cursor);
            cursor = addDays(cursor, 1);
        }
        return days;
    }, [showtimes]);

    const [formData, setFormData] = useState<ShowtimeRequest>({
        startTime: "",
        standardPrice: 0,
        vipPrice: 0,
        couplePrice: 0,
        movieId: "",
        auditoriumId: ""
    });
    const [pickerDate, setPickerDate] = useState("");
    const [pickerTime, setPickerTime] = useState("");

    // Responsive date paging
    const getVisibleCount = useCallback(() => {
        const w = window.innerWidth;
        if (w < 640) return 3;
        if (w < 768) return 4;
        if (w < 1024) return 5;
        if (w < 1280) return 7;
        return 9;
    }, []);

    const [visibleCount, setVisibleCount] = useState(getVisibleCount);
    const [dateStartIndex, setDateStartIndex] = useState(0);

    useEffect(() => {
        const onResize = () => setVisibleCount(getVisibleCount());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [getVisibleCount]);

    const visibleDates = useMemo(
        () => availableDates.slice(dateStartIndex, dateStartIndex + visibleCount),
        [availableDates, dateStartIndex, visibleCount]
    );

    const canPagePrev = dateStartIndex > 0;
    const canPageNext = dateStartIndex + visibleCount < availableDates.length;

    const pageLeft = () => setDateStartIndex(i => Math.max(0, i - visibleCount));
    const pageRight = () => setDateStartIndex(i => Math.min(availableDates.length - visibleCount, i + visibleCount));

    const fetchInitialData = async () => {
        try {
            setIsLoading(true);
            const [showtimesRes, moviesRes, cinemasRes] = await Promise.all([
                ShowtimeService.getAll(),
                movieService.getAllMovies(true),
                CinemaService.getAll(false)
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

    // Fetch auditoriums when cinema changes (for dialog form)
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

    // Client-side filtered showtimes
    const filteredShowtimes = useMemo(() => {
        return showtimes.filter(s => {
            if (filterMovieId && s.movieId !== filterMovieId) return false;
            if (filterCinemaId && s.cinemaId !== filterCinemaId) return false;
            if (filterDate) {
                const showTime = startOfDay(new Date(s.startTime));
                if (!isSameDay(showTime, filterDate)) return false;
            }
            return true;
        });
    }, [showtimes, filterMovieId, filterCinemaId, filterDate]);

    const hasActiveFilters = filterMovieId || filterCinemaId || filterDate;

    const clearFilters = () => {
        setFilterMovieId("");
        setFilterCinemaId("");
        setFilterDate(null);
    };

    const toLocalDateInput = (d: Date) => {
        const offset = d.getTimezoneOffset();
        const localDate = new Date(d.getTime() - offset * 60 * 1000);
        return localDate.toISOString().slice(0, 10);
    };

    const toLocalTimeInput = (d: Date) => {
        const offset = d.getTimezoneOffset();
        const localDate = new Date(d.getTime() - offset * 60 * 1000);
        return localDate.toISOString().slice(11, 16);
    };

    const buildLocalDateTime = (date: string, time: string) => {
        if (!date || !time) return "";
        return `${date}T${time}`;
    };
    
    const setStartTimeFromPicker = (date: string, time: string) => {
        setPickerDate(date);
        setPickerTime(time);
        const dt = buildLocalDateTime(date, time);
        setFormData(prev => ({ ...prev, startTime: dt }));
    };

    const selectedMovie = useMemo(
        () => movies.find((m) => m.id === formData.movieId) ?? null,
        [movies, formData.movieId]
    );

    const estimatedEndTime = useMemo(() => {
        if (!formData.startTime || !selectedMovie?.durationMinutes) return null;
        const start = new Date(formData.startTime);
        if (Number.isNaN(start.getTime())) return null;
        return new Date(start.getTime() + selectedMovie.durationMinutes * 60 * 1000);
    }, [formData.startTime, selectedMovie?.durationMinutes]);

    const validateShowtimeConflict = (startAt: string) => {
        if (!startAt || !formData.auditoriumId || !selectedMovie?.durationMinutes) return null;
        const start = new Date(startAt);
        if (Number.isNaN(start.getTime())) return "Thời gian bắt đầu không hợp lệ.";
        const end = new Date(start.getTime() + selectedMovie.durationMinutes * 60 * 1000);

        const conflict = showtimes.find((s) => {
            if (editingShowtime && s.id === editingShowtime.id) return false;
            if (s.auditoriumId !== formData.auditoriumId) return false;

            const otherStart = new Date(s.startTime);
            const otherEnd = new Date(s.endTime);
            if (Number.isNaN(otherStart.getTime()) || Number.isNaN(otherEnd.getTime())) return false;

            // overlap when [start, end) intersects [otherStart, otherEnd)
            return start < otherEnd && end > otherStart;
        });

        if (!conflict) return null;
        return `Conflict lịch chiếu tại "${conflict.cinemaName} - ${conflict.auditoriumName}" (${formatTime(conflict.startTime)} - ${formatTime(conflict.endTime)}).`;
    };

    const handleOpenDialog = (showtime?: Showtime) => {
        if (showtime) {
            setEditingShowtime(showtime);
            setSelectedCinemaId(showtime.cinemaId);

            const formatForInput = (dateStr: string) => {
                const d = new Date(dateStr);
                d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                return d.toISOString().slice(0, 16);
            };

            const startLocal = formatForInput(showtime.startTime);
            setFormData({
                startTime: formatForInput(showtime.startTime),
                standardPrice: showtime.standardPrice,
                vipPrice: showtime.vipPrice,
                couplePrice: showtime.couplePrice,
                movieId: showtime.movieId,
                auditoriumId: showtime.auditoriumId
            });
            const [datePart, timePart] = startLocal.split("T");
            setPickerDate(datePart ?? "");
            setPickerTime((timePart ?? "").slice(0, 5));
        } else {
            setEditingShowtime(null);
            setSelectedCinemaId("");
            const nextHalfHour = new Date();
            nextHalfHour.setMinutes(nextHalfHour.getMinutes() < 30 ? 30 : 60, 0, 0);
            const defaultDate = toLocalDateInput(nextHalfHour);
            const defaultTime = toLocalTimeInput(nextHalfHour);
            setFormData({
                startTime: `${defaultDate}T${defaultTime}`,
                standardPrice: 50000,
                vipPrice: 70000,
                couplePrice: 120000,
                movieId: "",
                auditoriumId: ""
            });
            setPickerDate(defaultDate);
            setPickerTime(defaultTime);
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            const localDateTime = formData.startTime || buildLocalDateTime(pickerDate, pickerTime);
            if (!localDateTime) {
                setError("Vui lòng chọn đầy đủ ngày và giờ chiếu.");
                return;
            }
            if (Number.isNaN(new Date(localDateTime).getTime())) {
                setError("Thời gian bắt đầu không hợp lệ.");
                return;
            }
            const conflictMessage = validateShowtimeConflict(localDateTime);
            if (conflictMessage) {
                setError(conflictMessage);
                return;
            }
            const payload: ShowtimeRequest = {
                ...formData,
                // Keep local datetime value to avoid UTC shift (e.g. 09:00 -> 02:00)
                startTime: localDateTime,
            };

            if (editingShowtime) {
                await ShowtimeService.update(editingShowtime.id, payload);
            } else {
                await ShowtimeService.create(payload);
            }
            setIsDialogOpen(false);

            const res = await ShowtimeService.getAll();
            if (res.succeeded) setShowtimes(res.data ?? []);

        } catch (err: any) {
            console.error("Lỗi khi lưu lịch chiếu", err);
            alert(err?.response?.data?.message || "Đã xảy ra lỗi khi lưu thông tin. Có thể do trùng lịch chiếu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirmDeleteId) return;
        try {
            setIsDeleting(true);
            await ShowtimeService.delete(confirmDeleteId);
            const res = await ShowtimeService.getAll();
            if (res.succeeded) setShowtimes(res.data ?? []);
        } catch (err: any) {
            console.error("Lỗi khi xóa lịch chiếu", err);
            alert(err?.response?.data?.message || "Không thể xóa lịch chiếu này.");
        } finally {
            setIsDeleting(false);
            setConfirmDeleteId(null);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Get unique cinema names from showtimes for the filter (distinct values that actually exist)
    const selectClass = "flex h-9 w-full items-center rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring";

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

            {/* Filter Bar */}
            <Card className="shadow-sm overflow-hidden">
                <CardContent className="pt-5 pb-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Bộ lọc</span>
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive gap-1" onClick={clearFilters}>
                                <X className="h-3 w-3" /> Xóa bộ lọc
                            </Button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Filter by Movie */}
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Phim</Label>
                            <select
                                className={selectClass}
                                value={filterMovieId}
                                onChange={(e) => setFilterMovieId(e.target.value)}
                            >
                                <option value="">Tất cả phim</option>
                                {movies.map(m => (
                                    <option key={m.id} value={m.id}>{m.title}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filter by Cinema */}
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Cụm rạp</Label>
                            <select
                                className={selectClass}
                                value={filterCinemaId}
                                onChange={(e) => setFilterCinemaId(e.target.value)}
                            >
                                <option value="">Tất cả cụm rạp</option>
                                {cinemas.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Horizontal Date Picker */}
                    <div className="mt-4 space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                            Ngày chiếu
                            {(canPagePrev || canPageNext) && (
                                <span className="ml-2 text-muted-foreground/60">
                                    ({dateStartIndex + 1}–{Math.min(dateStartIndex + visibleCount, availableDates.length)} / {availableDates.length})
                                </span>
                            )}
                        </Label>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-8 shrink-0 rounded-md"
                                onClick={pageLeft}
                                disabled={!canPagePrev}
                                type="button"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <div className="flex flex-1 gap-1.5">
                                <Button
                                    variant={filterDate === null ? "default" : "outline"}
                                    size="sm"
                                    className={`h-14 flex-1 flex-col gap-0.5 rounded-lg ${
                                        filterDate === null ? 'ring-2 ring-primary ring-offset-2' : ''
                                    }`}
                                    onClick={() => setFilterDate(null)}
                                    type="button"
                                >
                                    <span className="text-[10px] uppercase font-bold opacity-80">Tất cả</span>
                                    <span className="text-base font-bold leading-none">ALL</span>
                                </Button>
                                {visibleDates.map((date) => {
                                    const isSelected = filterDate && isSameDay(date, filterDate);
                                    return (
                                        <Button
                                            key={date.toISOString()}
                                            variant={isSelected ? "default" : "outline"}
                                            size="sm"
                                            className={`h-14 flex-1 flex-col gap-0.5 rounded-lg transition-all ${
                                                isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
                                            }`}
                                            onClick={() => setFilterDate(date)}
                                            type="button"
                                        >
                                            <span className="text-[10px] uppercase font-bold opacity-80">
                                                {format(date, 'eee', { locale: vi })}
                                            </span>
                                            <span className="text-base font-bold leading-none">
                                                {format(date, 'dd')}
                                            </span>
                                            <span className="text-[10px] opacity-70">
                                                {format(date, 'MM/yyyy')}
                                            </span>
                                        </Button>
                                    );
                                })}
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-8 shrink-0 rounded-md"
                                onClick={pageRight}
                                disabled={!canPageNext}
                                type="button"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {error && (
                <div className="bg-destructive/15 text-destructive p-4 rounded-md border border-destructive/20">
                    {error}
                </div>
            )}

            {/* Results count */}
            {!isLoading && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Hiển thị <span className="font-semibold text-foreground">{filteredShowtimes.length}</span>
                        {hasActiveFilters && <> / {showtimes.length}</>} lịch chiếu
                    </p>
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
            ) : filteredShowtimes.length === 0 ? (
                <div className="border border-border/50 rounded-xl p-12 flex flex-col items-center justify-center text-muted-foreground bg-card/50 shadow-sm gap-3 backdrop-blur-sm border-dashed">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                        {hasActiveFilters ? "Không tìm thấy lịch chiếu" : "Chưa có lịch chiếu nào"}
                    </p>
                    <p className="text-sm text-center max-w-md">
                        {hasActiveFilters
                            ? "Không có lịch chiếu nào phù hợp với bộ lọc hiện tại. Hãy thử thay đổi tiêu chí lọc."
                            : "Hãy bắt đầu lên lịch chiếu cho các bộ phim tại khu vực rạp."}
                    </p>
                    {hasActiveFilters && (
                        <Button variant="outline" size="sm" className="mt-2 gap-1" onClick={clearFilters}>
                            <X className="h-3.5 w-3.5" /> Xóa bộ lọc
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredShowtimes.map((showtime) => (
                        <Card key={showtime.id} className="transition-all duration-200 hover:shadow-md">
                            <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2 line-clamp-1">
                                        <Film className="h-4 w-4 text-primary shrink-0" /> {showtime.movieTitle}
                                    </CardTitle>
                                    <div className="flex items-center text-sm text-muted-foreground gap-1">
                                        <MapPin className="h-3 w-3 shrink-0" />
                                        <span className="line-clamp-1">{showtime.cinemaName} — {showtime.auditoriumName}</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="bg-muted/30 rounded-md p-3 space-y-2 border border-border/50">
                                        <div className="flex items-center text-sm font-medium gap-2">
                                            <Clock className="h-4 w-4 text-primary" />
                                            <span>{formatTime(showtime.startTime)} — {formatTime(showtime.endTime)}</span>
                                        </div>
                                        <div className="flex items-center text-xs text-muted-foreground gap-2 pl-6">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(showtime.startTime).toLocaleDateString('en-GB')}
                                        </div>
                                    </div>

                                    <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
                                        <div className="flex justify-between">
                                            <span>Standard:</span>
                                            <span className="font-semibold text-foreground">{formatCurrency(showtime.standardPrice)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>VIP:</span>
                                            <span className="font-semibold text-foreground">{formatCurrency(showtime.vipPrice)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Couple:</span>
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
                                            onClick={() => setConfirmDeleteId(showtime.id)}
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
                                        setFormData({ ...formData, auditoriumId: "" });
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
                                <Label className="text-right whitespace-nowrap">Bắt đầu <span className="text-destructive">*</span></Label>
                                <div className="col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={pickerDate}
                                        onChange={(e) => {
                                            const date = e.target.value;
                                            setStartTimeFromPicker(date, pickerTime);
                                        }}
                                        required
                                    />
                                    <Input
                                        id="startTime"
                                        type="time"
                                        step="300"
                                        value={pickerTime}
                                        onChange={(e) => {
                                            const time = e.target.value;
                                            setStartTimeFromPicker(pickerDate, time);
                                        }}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4 -mt-1">
                                <span />
                                <p className="col-span-3 text-xs text-muted-foreground">
                                    {estimatedEndTime
                                        ? `Dự kiến kết thúc: ${new Date(estimatedEndTime).toLocaleDateString("vi-VN")} ${formatTime(estimatedEndTime.toISOString())}`
                                        : "Chọn phim + thời gian để tính giờ kết thúc."}
                                </p>
                            </div>

                            {/* Giá vé */}
                            <div className="grid grid-cols-4 items-center gap-4 mt-2">
                                <Label htmlFor="standardPrice" className="text-right whitespace-nowrap">Giá Standard </Label>
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
                                <Label htmlFor="vipPrice" className="text-right whitespace-nowrap">Giá VIP </Label>
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
                                <Label htmlFor="couplePrice" className="text-right whitespace-nowrap">Giá Couple </Label>
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
            <ConfirmDialog
                open={Boolean(confirmDeleteId)}
                title="Xóa lịch chiếu"
                description="Bạn có chắc chắn muốn xóa lịch chiếu này không? Hành động này không thể hoàn tác."
                confirmText="Xóa lịch chiếu"
                variant="destructive"
                loading={isDeleting}
                onOpenChange={(open) => {
                    if (!open) setConfirmDeleteId(null);
                }}
                onConfirm={handleDelete}
            />
        </div>
    );
}

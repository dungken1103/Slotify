import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Clock, Calendar, ChevronLeft, Building2, Ticket, Play } from "lucide-react";
import { movieService } from "../services/movie.service";
import { ShowtimeService } from "../services/showtime.service";
import type { Showtime } from "../services/showtime.service";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatCurrency, getYouTubeEmbedUrl, splitCommaList, formatDateVi } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { vi } from "date-fns/locale";

interface MovieDetail {
  id: string;
  title: string;
  backdrop: string;
  poster: string;
  description: string;
  duration: string;
  releaseDate: string;
  director: string;
  cast: string[];
  genres: string[];
  trailerUrl: string;
}

export function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCinema, setFilterCinema] = useState<string>("");
  const [filterDate, setFilterDate] = useState<Date | null>(null);

  const cinemaOptions = useMemo(() => {
    const set = new Set<string>();
    for (const st of showtimes) set.add(st.cinemaName || "Chưa rõ rạp");
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [showtimes]);

  const filteredShowtimes = useMemo(() => {
    return showtimes.filter((s) => {
      const cinemaName = s.cinemaName || "Chưa rõ rạp";
      if (filterCinema && cinemaName !== filterCinema) return false;
      if (filterDate) {
        const d = startOfDay(new Date(s.startTime));
        if (!isSameDay(d, filterDate)) return false;
      }
      return true;
    });
  }, [showtimes, filterCinema, filterDate]);

  // Date paging like admin page
  const availableDates = useMemo(() => {
    const today = startOfDay(new Date());
    if (showtimes.length === 0) return [today];
    const maxDate = startOfDay(new Date(Math.max(...showtimes.map((s) => new Date(s.startTime).getTime()))));
    const days: Date[] = [];
    let cursor = today;
    while (cursor <= maxDate) {
      days.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return days;
  }, [showtimes]);

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
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [getVisibleCount]);

  useEffect(() => {
    // keep paging sane when showtimes change
    setDateStartIndex(0);
    setFilterDate(null);
    setFilterCinema("");
  }, [id]);

  const visibleDates = useMemo(
    () => availableDates.slice(dateStartIndex, dateStartIndex + visibleCount),
    [availableDates, dateStartIndex, visibleCount]
  );

  const canPagePrev = dateStartIndex > 0;
  const canPageNext = dateStartIndex + visibleCount < availableDates.length;
  const pageLeft = () => setDateStartIndex((i) => Math.max(0, i - visibleCount));
  const pageRight = () => setDateStartIndex((i) => Math.min(Math.max(0, availableDates.length - visibleCount), i + visibleCount));

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchMovie(id);
      fetchShowtimes(id);
    }
  }, [id]);

  const fetchShowtimes = async (movieId: string) => {
    try {
      const response = await ShowtimeService.getByMovie(movieId);
      setShowtimes(response.data || []);
    } catch (error) {
      console.error("Error fetching showtimes", error);
    }
  };

  const normalizeMovie = (data: any): MovieDetail => ({
    id: String(data?.id ?? ""),
    title: String(data?.title ?? "").trim() || "Chưa có tiêu đề",
    backdrop: String(data?.backdropUrl ?? data?.posterUrl ?? "").trim(),
    poster: String(data?.posterUrl ?? "").trim(),
    trailerUrl: String(data?.trailerUrl ?? "").trim(),
    description: String(data?.description ?? "").trim(),
    duration: data?.durationMinutes ? `${data.durationMinutes} phút` : "",
    releaseDate: formatDateVi(data?.releaseDate),
    director: String(data?.director ?? "").trim(),
    cast: splitCommaList(data?.cast),
    genres: splitCommaList(data?.genre),
  });

  const fetchMovie = async (movieId: string) => {
    try {
      const data = await movieService.getMovieById(movieId);
      setMovie(normalizeMovie(data));
    } catch (error) {
      console.error("Error fetching movie detail", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (!movie) {
    return <div className="p-20 text-center text-xl">Movie not found</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Backdrop Header */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        {movie.trailerUrl && getYouTubeEmbedUrl(movie.trailerUrl) ? (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <iframe
              src={getYouTubeEmbedUrl(movie.trailerUrl)!}
              title={`Trailer ${movie.title}`}
              className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[60vh] min-w-[106.66vh] -translate-x-1/2 -translate-y-1/2 opacity-100"
              allow="autoplay; encrypted-media"
            />
          </div>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${movie.backdrop})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-90" />

        <div className="container relative h-full flex flex-col justify-end pb-10">
          <Link
            to="/"
            className="absolute top-8 left-4 md:left-8 text-white/80 hover:text-white flex items-center gap-2 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" /> Về trang chủ
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-end">
            {movie.poster ? (
              <img
                src={movie.poster}
                alt={movie.title || "Poster"}
                className="hidden md:block w-52 rounded-2xl shadow-2xl shadow-black/50 border border-white/10"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : null}
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {movie.duration || "Chưa rõ"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> {movie.releaseDate || "Chưa rõ"}
                </span>
                <div className="flex flex-wrap gap-2">
                  {(movie.genres?.length ? Array.from(new Set(movie.genres)) : ["Chưa rõ thể loại"]).map((g) => (
                     <span key={g} className="px-2 py-0.5 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-medium">
                       {g}
                     </span>
                  ))}
                </div>
              </div>

              {movie.trailerUrl ? (
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-full gap-2 border-white/20 bg-black/20 text-white backdrop-blur-sm hover:bg-white/10"
                  >
                    <a
                      href={movie.trailerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Play className="h-4 w-4 fill-current" /> Xem trailer
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-full gap-2"
                    onClick={() => document.getElementById("showtimes")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    <Ticket className="h-4 w-4" /> Chọn suất chiếu
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-12 grid gap-12 lg:grid-cols-[1fr_350px]">
        {/* Main Content */}
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold mb-4">Nội dung phim</h2>
            {movie.description ? (
              <div 
                className="text-muted-foreground leading-relaxed text-lg [&>p]:mb-4 [&>ul]:list-disc [&>ul]:ml-6 [&>ol]:list-decimal [&>ol]:ml-6 [&_a]:text-primary hover:[&_a]:underline [&>h1]:text-2xl [&>h1]:font-bold [&>h2]:text-xl [&>h2]:font-bold [&>h3]:text-lg [&>h3]:font-bold"
                dangerouslySetInnerHTML={{ __html: movie.description }}
              />
            ) : (
              <p className="text-muted-foreground">Chưa có mô tả cho phim này.</p>
            )}
          </section>

          {/* Showtimes Section - booking-like UI */}
          <section id="showtimes" className="scroll-mt-24">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="flex items-center gap-2 text-2xl font-bold">
                <Calendar className="h-6 w-6 text-primary" />
                Chọn suất chiếu
              </h2>
              <p className="text-sm text-muted-foreground hidden md:block">
                {filteredShowtimes.length > 0 ? `Có ${filteredShowtimes.length} suất chiếu` : "Chưa có suất chiếu phù hợp"}
              </p>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Bộ lọc</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Cụm rạp</p>
                    <select
                      aria-label="Chọn cụm rạp"
                      className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                      value={filterCinema}
                      onChange={(e) => setFilterCinema(e.target.value)}
                    >
                      <option value="">Tất cả cụm rạp</option>
                      {cinemaOptions.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Nhắc nhanh</p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="rounded-full" onClick={() => { setFilterCinema(""); setFilterDate(null); }}>
                        Xóa lọc
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => setFilterDate(startOfDay(new Date()))}
                      >
                        Hôm nay
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">
                    Ngày chiếu
                    {(canPagePrev || canPageNext) && (
                      <span className="ml-2 text-muted-foreground/60">
                        ({dateStartIndex + 1}–{Math.min(dateStartIndex + visibleCount, availableDates.length)} / {availableDates.length})
                      </span>
                    )}
                  </p>
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
                        className={`h-14 flex-1 flex-col gap-0.5 rounded-lg ${filterDate === null ? "ring-2 ring-primary ring-offset-2" : ""}`}
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
                            className={`h-14 flex-1 flex-col gap-0.5 rounded-lg transition-all ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""}`}
                            onClick={() => setFilterDate(date)}
                            type="button"
                          >
                            <span className="text-[10px] uppercase font-bold opacity-80">
                              {format(date, "eee", { locale: vi })}
                            </span>
                            <span className="text-base font-bold leading-none">{format(date, "dd")}</span>
                            <span className="text-[10px] opacity-70">{format(date, "MM/yyyy")}</span>
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
                      <ChevronLeft className="h-4 w-4 rotate-180" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6">
              {showtimes.length === 0 ? (
                <div className="text-center py-12 bg-secondary/10 rounded-2xl border border-dashed border-border/50 flex flex-col items-center gap-4">
                  <Calendar className="h-12 w-12 opacity-20" />
                  <div className="space-y-1">
                    <p className="font-medium">Chưa có lịch chiếu</p>
                    <p className="text-sm text-muted-foreground">Vui lòng quay lại sau để xem cập nhật lịch chiếu.</p>
                  </div>
                </div>
              ) : filteredShowtimes.length === 0 ? (
                <div className="border border-border/50 rounded-xl p-10 flex flex-col items-center justify-center text-muted-foreground bg-card/50 shadow-sm gap-3 backdrop-blur-sm border-dashed">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-lg font-semibold text-foreground">Không có suất chiếu phù hợp</p>
                  <p className="text-sm text-center max-w-md">
                    Hãy thử đổi cụm rạp hoặc ngày chiếu để xem thêm suất chiếu.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => { setFilterCinema(""); setFilterDate(null); }}>
                    Xóa bộ lọc
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {Array.from(new Set(filteredShowtimes.map((s) => s.cinemaName || "Chưa rõ rạp"))).map((cinema) => {
                    const cinemaShowtimes = filteredShowtimes
                      .filter((s) => (s.cinemaName || "Chưa rõ rạp") === cinema)
                      .slice()
                      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

                    return (
                      <Card key={cinema} className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-primary/80" />
                            {cinema}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {cinemaShowtimes.map((st) => {
                              const timeLabel = st.startTime
                                ? new Date(st.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                : "--:--";
                              const price = formatCurrency(st.standardPrice ?? 0);
                              const sub = st.auditoriumName || "Chưa rõ phòng";
                              return (
                                <Link key={st.id} to={`/booking/${st.id}`} className="group">
                                  <Button
                                    variant="outline"
                                    className="h-auto rounded-xl px-4 py-2 flex flex-col items-start gap-1 border-white/10 hover:border-primary/50 hover:bg-primary/5"
                                  >
                                    <span className="text-base font-bold text-foreground">{timeLabel}</span>
                                    <span className="text-[11px] text-muted-foreground">
                                      {sub} • <span className="text-primary font-semibold">{price}</span>
                                    </span>
                                  </Button>
                                </Link>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Diễn viên & Đoàn làm phim</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-card border border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Đạo diễn</p>
                <div className="flex flex-wrap gap-1">
                  {splitCommaList(movie.director).length ? Array.from(new Set(splitCommaList(movie.director))).map((d) => (
                    <span key={d} className="px-2 py-1 bg-violet-500/10 text-violet-500 border border-violet-500/20 rounded-md text-xs font-medium whitespace-nowrap">
                      {d.trim()}
                    </span>
                  )) : (
                    <span className="text-sm text-muted-foreground">Chưa rõ</span>
                  )}
                </div>
              </div>

              {(movie.cast?.length ? movie.cast : ["Chưa rõ"]).map((actor: string, idx: number) => (
                <div
                  key={`${actor}-${idx}`}
                  className="p-4 rounded-lg bg-card border border-border/50"
                >
                  <p className="text-xs text-muted-foreground mb-2">Diễn viên</p>
                  <span className="px-2 py-1 bg-secondary/50 text-secondary-foreground border border-white/5 rounded-md text-xs whitespace-nowrap block w-fit">
                    {actor.trim()}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar - Now for info & booking summary/cta */}
        <div className="space-y-6">
           <div className="rounded-xl border border-border/50 bg-card p-6 shadow-lg sticky top-24">
              <h3 className="text-xl font-bold mb-2">Đặt vé</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Chọn cụm rạp và ngày chiếu, sau đó bấm giờ chiếu để đặt vé.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cụm rạp</span>
                  <span className="font-medium text-right line-clamp-1">{filterCinema || "Tất cả"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Ngày</span>
                  <span className="font-medium">
                    {filterDate ? format(filterDate, "dd/MM/yyyy") : "Tất cả"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Suất chiếu</span>
                  <span className="font-medium">{filteredShowtimes.length}</span>
                </div>
              </div>

              <Button
                className="w-full gap-2 py-6 text-lg mt-6"
                onClick={() => document.getElementById("showtimes")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Ticket className="h-5 w-5" /> Chọn suất chiếu
              </Button>
              
              <div className="mt-8 space-y-4 pt-8 border-t border-border/50 text-sm">
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Thời lượng</span>
                    <span className="font-medium">{movie.duration}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Ngôn ngữ</span>
                    <span className="font-medium">Tiếng Anh (Phụ đề)</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
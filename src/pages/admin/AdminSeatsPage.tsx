import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SeatService } from "../../services/seat.service";
import type { Seat } from "../../services/seat.service";
import { AuditoriumService } from "../../services/auditorium.service";
import type { Auditorium } from "../../services/auditorium.service";
import { Button } from "../../components/ui/button";
import { ArrowLeft, GripHorizontal, Loader2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export function AdminSeatsPage() {
    const { cinemaId, auditoriumId } = useParams<{ cinemaId: string, auditoriumId: string }>();
    const navigate = useNavigate();

    const [auditorium, setAuditorium] = useState<Auditorium | null>(null);
    const [seats, setSeats] = useState<Seat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial config states for generating a map
    const [rows, setRows] = useState(10);
    const [seatsPerRow, setSeatsPerRow] = useState(12);

    const fetchData = async () => {
        if (!auditoriumId) return;

        try {
            setIsLoading(true);
            const [auditoriumRes, seatsRes] = await Promise.all([
                AuditoriumService.getById(auditoriumId),
                SeatService.getByAuditorium(auditoriumId, true)
            ]);

            if (auditoriumRes.succeeded) {
                setAuditorium(auditoriumRes.data);
            }

            if (seatsRes.succeeded) {
                setSeats(seatsRes.data);
            } else {
                setError(seatsRes.message || "Không thể tải sơ đồ ghế.");
            }
        } catch (err) {
            setError("Đã xảy ra lỗi kết nối khi tải sơ đồ.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [auditoriumId]);

    const handleGenerateMap = () => {
        if (!window.confirm(`Bạn có chắc muốn tạo sơ đồ mới với ${rows} hàng và ${seatsPerRow} ghế mỗi hàng? Sơ đồ hiện tại (nếu chưa lưu) sẽ bị ghi đè trên màn hình này.`)) {
            return;
        }

        const newSeats: Seat[] = [];
        const generateLetter = (index: number) => String.fromCharCode(65 + index); // 0 -> A, 1 -> B...

        for (let r = 0; r < rows; r++) {
            const rowLabel = generateLetter(r);
            for (let c = 1; c <= seatsPerRow; c++) {
                newSeats.push({
                    id: Math.random().toString(36).substring(7), // Temp ID for rendering
                    row: rowLabel,
                    number: c,
                    type: "Standard",
                    auditoriumId: auditoriumId!,
                    isActive: true,
                    seatName: `${rowLabel}${c}`
                });
            }
        }
        setSeats(newSeats);
    };

    const handleSaveBulk = async () => {
        if (!auditoriumId) return;

        try {
            setIsSaving(true);

            // Format requests for the backend
            const requests = seats.map(s => ({
                row: s.row,
                number: s.number,
                type: s.type === "VIP" ? 1 : (s.type === "Couple" ? 2 : 0),
                auditoriumId: auditoriumId,
                isActive: s.isActive
            }));

            // Since it's a massive overwrite, typically you'd clear existing then add all, 
            // or the backend bulk endpoint handles that logic. For safety, this assumes
            // AddSeatsBulk will process these as entirely new rows/seats for the room.
            const res = await SeatService.createBulk(requests);

            if (res.succeeded) {
                alert("Đã lưu sơ đồ ghế thành công!");
                fetchData();
            } else {
                setError(res.message || "Lưu thất bại.");
            }
        } catch (err) {
            console.error(err);
            setError("Xảy ra lỗi khi gọi server lưu dữ liệu.");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleSeatType = (seatId: string) => {
        setSeats(prev => prev.map(s => {
            if (s.id === seatId) {
                let nextType = "Standard";
                if (s.type === "Standard") nextType = "VIP";
                else if (s.type === "VIP") nextType = "Couple";
                else if (s.type === "Couple") nextType = "Standard";

                return { ...s, type: nextType };
            }
            return s;
        }));
    };

    const toggleSeatActive = (seatId: string) => {
        setSeats(prev => prev.map(s => {
            if (s.id === seatId) {
                return { ...s, isActive: !s.isActive };
            }
            return s;
        }));
    };

    // Group seats by row for rendering
    const rowsMap = seats.reduce((acc, seat) => {
        if (!acc[seat.row]) acc[seat.row] = [];
        acc[seat.row].push(seat);
        return acc;
    }, {} as Record<string, Seat[]>);

    const sortedRowLabels = Object.keys(rowsMap).sort();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate(`/admin/cinemas/${cinemaId}/auditoriums`)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Sơ Đồ Ghế - {auditorium?.name || "Đang tải..."}
                        </h2>
                        <p className="text-muted-foreground mt-1">
                            Click vào ghế để đổi loại (Standard ➔ VIP ➔ Couple). Nhấp đúp (Double-click) để Tắt/Mở ghế.
                        </p>
                    </div>
                </div>

                {seats.length > 0 && (
                    <Button
                        onClick={handleSaveBulk}
                        disabled={isSaving}
                        className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Lưu Sơ Đồ Lên Máy Chủ
                    </Button>
                )}
            </div>

            {error && (
                <div className="bg-destructive/15 text-destructive p-4 rounded-md border border-destructive/20">
                    {error}
                </div>
            )}

            <div className="grid md:grid-cols-4 gap-6">
                <Card className="md:col-span-1 shadow-sm h-fit">
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-base">Tiện ích tạo nhanh</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Số lượng hàng (Rows)</Label>
                            <Input
                                type="number"
                                min={1} max={26}
                                value={rows}
                                onChange={e => setRows(Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Số ghế một hàng (Columns)</Label>
                            <Input
                                type="number"
                                min={1} max={50}
                                value={seatsPerRow}
                                onChange={e => setSeatsPerRow(Number(e.target.value))}
                            />
                        </div>
                        <Button
                            className="w-full gap-2"
                            variant="secondary"
                            onClick={handleGenerateMap}
                        >
                            <GripHorizontal className="h-4 w-4" /> Tạo Mới Sơ Đồ Mẫu
                        </Button>

                        <div className="pt-6 border-t mt-6">
                            <h4 className="text-sm font-semibold mb-3">Chú giải (Legend)</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded bg-blue-100 border border-blue-300"></div>
                                    <span>Standard (Tiêu chuẩn)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded bg-amber-100 border border-amber-300"></div>
                                    <span>VIP</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-6 rounded bg-rose-100 border border-rose-300"></div>
                                    <span>Couple (Ghế đôi)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded bg-gray-100 border border-gray-300 opacity-50"></div>
                                    <span>Vô hiệu hóa (Đường đi/Trống)</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3 shadow-sm bg-card/50 overflow-x-auto">
                    <CardContent className="p-8 min-w-max">
                        {isLoading ? (
                            <div className="flex justify-center p-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : seats.length === 0 ? (
                            <div className="text-center py-24 text-muted-foreground border-2 border-dashed rounded-xl bg-card">
                                Chưa có sơ đồ ghế nào cho phòng chiếu này. Hãy sử dụng công cụ tạo nhanh ở cột bên trái.
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                {/* Screen Representation */}
                                <div className="w-[80%] h-8 bg-gradient-to-b from-primary/20 to-transparent rounded-t-full border-t-4 border-primary/50 relative mb-8 flex items-center justify-center">
                                    <span className="text-xs text-primary/70 font-semibold tracking-widest absolute top-1">
                                        MÀN HÌNH
                                    </span>
                                </div>

                                {/* Seats Map */}
                                <div className="flex flex-col gap-2">
                                    {sortedRowLabels.map(rowLabel => (
                                        <div key={rowLabel} className="flex items-center justify-center gap-4">
                                            <div className="w-6 text-center font-bold text-muted-foreground">{rowLabel}</div>
                                            <div className="flex gap-2 justify-center">
                                                {rowsMap[rowLabel].sort((a, b) => a.number - b.number).map(seat => {
                                                    // Styling based on type and status
                                                    let bgColor = "bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-800";
                                                    let width = "w-8";

                                                    if (seat.type === "VIP") {
                                                        bgColor = "bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-800";
                                                    } else if (seat.type === "Couple") {
                                                        bgColor = "bg-rose-100 hover:bg-rose-200 border-rose-300 text-rose-800";
                                                        width = "w-14";
                                                    }

                                                    if (!seat.isActive) {
                                                        bgColor = "bg-gray-100 border-gray-300 text-gray-400 border-dashed opacity-50";
                                                    }

                                                    return (
                                                        <button
                                                            key={seat.id}
                                                            onClick={() => toggleSeatType(seat.id)}
                                                            onDoubleClick={() => toggleSeatActive(seat.id)}
                                                            className={`h-8 ${width} rounded-t-lg rounded-b-sm border text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer select-none ${bgColor}`}
                                                            title={`Ghế ${seat.seatName || (seat.row + seat.number)} - Nhấp đúp để đổi trạng thái`}
                                                        >
                                                            {seat.isActive ? seat.number : "X"}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <div className="w-6 text-center font-bold text-muted-foreground">{rowLabel}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

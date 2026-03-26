import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Pencil, Plus, Power, Save, Trash2 } from "lucide-react";
import { AuditoriumService } from "../../services/auditorium.service";
import type { Auditorium } from "../../services/auditorium.service";
import { SeatService, seatTypeToValue, type Seat, type SeatRequest, type SeatType } from "../../services/seat.service";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { ConfirmDialog } from "../../components/ui/confirm-dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { cn } from "../../lib/utils";
import { adminSelectClassName, fieldErrorClassName, getApiErrorMessage } from "./adminVenueHelpers";

const seatSchema = z.object({
    row: z.string().trim().min(1, "Hàng ghế là bắt buộc.").max(5, "Hàng ghế tối đa 5 ký tự.").regex(/^[a-zA-Z0-9]+$/, "Hàng ghế chỉ được chứa chữ và số."),
    number: z.number().int("Số ghế phải là số nguyên.").min(1, "Số ghế phải từ 1 đến 100.").max(100, "Số ghế phải từ 1 đến 100."),
    type: z.enum(["Standard", "VIP", "Couple"]),
    isActive: z.boolean(),
});

const bulkSchema = z.object({
    rows: z.number().int().min(1, "Số hàng tối thiểu là 1.").max(26, "Tối đa 26 hàng để tạo nhanh."),
    seatsPerRow: z.number().int().min(1, "Số ghế mỗi hàng tối thiểu là 1.").max(30, "Tối đa 30 ghế mỗi hàng."),
    type: z.enum(["Standard", "VIP", "Couple"]),
});

type SeatFormValues = z.infer<typeof seatSchema>;
type BulkFormValues = z.infer<typeof bulkSchema>;

const seatDefaults: SeatFormValues = {
    row: "",
    number: 1,
    type: "Standard",
    isActive: true,
};

const bulkDefaults: BulkFormValues = {
    rows: 5,
    seatsPerRow: 10,
    type: "Standard",
};

const seatTypeClassMap: Record<SeatType, string> = {
    Standard: "border-blue-300 bg-blue-100 text-blue-800",
    VIP: "border-amber-300 bg-amber-100 text-amber-800",
    Couple: "border-rose-300 bg-rose-100 text-rose-800",
};

const seatTypeTextMap: Record<SeatType, string> = {
    Standard: "Standard",
    VIP: "VIP",
    Couple: "Couple",
};

const normalizeRow = (value: string) => value.trim().toUpperCase();

export function AdminSeatsPage() {
    const { cinemaId, auditoriumId } = useParams<{ cinemaId: string; auditoriumId: string }>();
    const navigate = useNavigate();
    const [auditorium, setAuditorium] = useState<Auditorium | null>(null);
    const [seats, setSeats] = useState<Seat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSeat, setEditingSeat] = useState<Seat | null>(null);
    const [confirmDeleteSeat, setConfirmDeleteSeat] = useState<Seat | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const seatForm = useForm<SeatFormValues>({
        resolver: zodResolver(seatSchema),
        defaultValues: seatDefaults,
    });

    const bulkForm = useForm<BulkFormValues>({
        resolver: zodResolver(bulkSchema),
        defaultValues: bulkDefaults,
    });

    const fetchData = async () => {
        if (!auditoriumId) {
            setError("Thiếu mã phòng chiếu.");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const [auditoriumResponse, seatsResponse] = await Promise.all([
                AuditoriumService.getById(auditoriumId),
                SeatService.getByAuditorium(auditoriumId, true),
            ]);

            if (!auditoriumResponse.succeeded) {
                setError(auditoriumResponse.message || "Không thể tải thông tin phòng chiếu.");
                return;
            }

            if (!seatsResponse.succeeded) {
                setError(seatsResponse.message || "Không thể tải danh sách ghế.");
                return;
            }

            setAuditorium(auditoriumResponse.data ?? null);
            setSeats(seatsResponse.data ?? []);
        } catch (err) {
            setError(getApiErrorMessage(err, "Đã xảy ra lỗi khi tải danh sách ghế."));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [auditoriumId]);

    const groupedSeats = useMemo(() => {
        const map = new Map<string, Seat[]>();
        for (const seat of seats) {
            const row = normalizeRow(seat.row);
            const current = map.get(row) ?? [];
            current.push({ ...seat, row });
            map.set(row, current);
        }

        return Array.from(map.entries())
            .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
            .map(([row, rowSeats]) => ({
                row,
                seats: rowSeats.sort((a, b) => a.number - b.number),
            }));
    }, [seats]);

    const handleOpenDialog = (seat?: Seat) => {
        setError(null);
        setEditingSeat(seat ?? null);
        seatForm.reset(
            seat
                ? {
                    row: seat.row,
                    number: seat.number,
                    type: seat.type,
                    isActive: seat.isActive,
                }
                : seatDefaults
        );
        setIsDialogOpen(true);
    };

    const ensureSeatIsUniqueOnClient = (values: SeatFormValues) => {
        const row = normalizeRow(values.row);
        const duplicate = seats.find((seat) =>
            seat.id !== editingSeat?.id &&
            normalizeRow(seat.row) === row &&
            seat.number === values.number
        );

        if (duplicate) {
            seatForm.setError("row", { message: `Ghế ${row}${values.number} đã tồn tại.` });
            seatForm.setError("number", { message: `Ghế ${row}${values.number} đã tồn tại.` });
            return false;
        }

        return true;
    };

    const onSubmitSeat = seatForm.handleSubmit(async (values) => {
        if (!auditoriumId) {
            setError("Thiếu mã phòng chiếu.");
            return;
        }

        if (!ensureSeatIsUniqueOnClient(values)) {
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            const payload: SeatRequest = {
                row: normalizeRow(values.row),
                number: values.number,
                type: seatTypeToValue[values.type],
                auditoriumId,
                isActive: values.isActive,
            };

            const response = editingSeat
                ? await SeatService.update(editingSeat.id, payload)
                : await SeatService.create(payload);

            if (!response.succeeded) {
                setError(response.message || "Không thể lưu thông tin ghế.");
                return;
            }

            setIsDialogOpen(false);
            await fetchData();
        } catch (err) {
            setError(getApiErrorMessage(err, "Đã xảy ra lỗi khi lưu thông tin ghế."));
        } finally {
            setIsSubmitting(false);
        }
    });

    const handleDeleteSeat = async () => {
        if (!confirmDeleteSeat) return;
        try {
            setIsDeleting(true);
            setError(null);
            const response = await SeatService.delete(confirmDeleteSeat.id);
            if (!response.succeeded) {
                setError(response.message || "Không thể xóa ghế.");
                return;
            }

            await fetchData();
        } catch (err) {
            setError(getApiErrorMessage(err, "Không thể xóa ghế."));
        } finally {
            setIsDeleting(false);
            setConfirmDeleteSeat(null);
        }
    };

    const toggleSeatStatus = async (seat: Seat) => {
        try {
            setError(null);
            const response = seat.isActive
                ? await SeatService.deactivate(seat.id)
                : await SeatService.activate(seat.id);

            if (!response.succeeded) {
                setError(response.message || "Không thể cập nhật trạng thái ghế.");
                return;
            }

            await fetchData();
        } catch (err) {
            setError(getApiErrorMessage(err, "Không thể cập nhật trạng thái ghế."));
        }
    };

    const onBulkCreate = bulkForm.handleSubmit(async (values) => {
        if (!auditoriumId) {
            setError("Thiếu mã phòng chiếu.");
            return;
        }

        const generatedSeats: SeatRequest[] = [];
        const duplicateLabels: string[] = [];

        for (let rowIndex = 0; rowIndex < values.rows; rowIndex += 1) {
            const row = String.fromCharCode(65 + rowIndex);
            for (let seatNumber = 1; seatNumber <= values.seatsPerRow; seatNumber += 1) {
                const exists = seats.some((seat) => normalizeRow(seat.row) === row && seat.number === seatNumber);
                if (exists) {
                    duplicateLabels.push(`${row}${seatNumber}`);
                    continue;
                }

                generatedSeats.push({
                    row,
                    number: seatNumber,
                    type: seatTypeToValue[values.type],
                    auditoriumId,
                    isActive: true,
                });
            }
        }

        if (generatedSeats.length === 0) {
            setError(duplicateLabels.length > 0 ? `Không có ghế mới để tạo. Các ghế đã tồn tại: ${duplicateLabels.slice(0, 10).join(", ")}${duplicateLabels.length > 10 ? "..." : ""}.` : "Không có ghế mới để tạo.");
            return;
        }

        try {
            setIsBulkSubmitting(true);
            setError(null);
            const response = await SeatService.createBulk(generatedSeats);
            if (!response.succeeded) {
                setError(response.message || "Không thể tạo loạt ghế.");
                return;
            }

            bulkForm.reset({ ...values });
            await fetchData();
        } catch (err) {
            setError(getApiErrorMessage(err, "Đã xảy ra lỗi khi tạo loạt ghế."));
        } finally {
            setIsBulkSubmitting(false);
        }
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate(`/admin/cinemas/${cinemaId}/auditoriums`)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Quản Lý Ghế {auditorium ? `- ${auditorium.name}` : ""}</h2>
                        <p className="mt-1 text-muted-foreground">CRUD ghế theo từng phòng, kèm tạo nhanh theo hàng/cột.</p>
                    </div>
                </div>
                <Button className="gap-2 shadow-md hover:shadow-lg transition-all" onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4" />
                    Thêm Ghế
                </Button>
            </div>

            {error && <div className="rounded-md border border-destructive/20 bg-destructive/15 p-4 text-destructive">{error}</div>}

            <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
                <Card className="h-fit shadow-sm">
                    <CardHeader className="border-b pb-3">
                        <CardTitle className="text-base">Tạo Nhanh Sơ Đồ Ghế</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <form onSubmit={onBulkCreate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="rows">Số hàng</Label>
                                <Input id="rows" type="number" min={1} max={26} {...bulkForm.register("rows", { valueAsNumber: true })} className={cn(bulkForm.formState.errors.rows && fieldErrorClassName)} />
                                {bulkForm.formState.errors.rows && <p className="text-sm text-destructive">{bulkForm.formState.errors.rows.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="seatsPerRow">Số ghế mỗi hàng</Label>
                                <Input id="seatsPerRow" type="number" min={1} max={30} {...bulkForm.register("seatsPerRow", { valueAsNumber: true })} className={cn(bulkForm.formState.errors.seatsPerRow && fieldErrorClassName)} />
                                {bulkForm.formState.errors.seatsPerRow && <p className="text-sm text-destructive">{bulkForm.formState.errors.seatsPerRow.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bulkType">Loại ghế mặc định</Label>
                                <select id="bulkType" {...bulkForm.register("type")} className={adminSelectClassName}>
                                    <option value="Standard">Standard</option>
                                    <option value="VIP">VIP</option>
                                    <option value="Couple">Couple</option>
                                </select>
                            </div>

                            <Button type="submit" className="w-full gap-2" disabled={isBulkSubmitting}>
                                {isBulkSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Tạo Loạt Ghế
                            </Button>
                        </form>

                        <div className="space-y-2 border-t pt-4 text-sm text-muted-foreground">
                            <p>Tạo nhanh sẽ chỉ thêm ghế mới còn thiếu.</p>
                            <p>Ghế trùng hàng/số với dữ liệu hiện có sẽ bị bỏ qua từ phía client và vẫn được backend kiểm tra lại.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="border-b pb-3">
                        <CardTitle className="text-base">Danh Sách Ghế</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                        {isLoading ? (
                            <div className="flex justify-center p-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : groupedSeats.length === 0 ? (
                            <div className="rounded-xl border-2 border-dashed bg-card p-12 text-center text-muted-foreground">
                                Chưa có ghế nào trong phòng này. Hãy thêm từng ghế hoặc tạo nhanh theo sơ đồ.
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {groupedSeats.map((group) => (
                                        <div key={group.row} className="space-y-2">
                                            <div className="text-sm font-semibold text-muted-foreground">Hàng {group.row}</div>
                                            <div className="flex flex-wrap gap-2">
                                                {group.seats.map((seat) => (
                                                    <div key={seat.id} className={cn("min-w-[88px] rounded-lg border px-3 py-2 text-sm shadow-sm", seatTypeClassMap[seat.type], !seat.isActive && "border-dashed bg-muted text-muted-foreground opacity-70")}>
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div>
                                                                <div className="font-semibold">{seat.row}{seat.number}</div>
                                                                <div className="text-xs">{seatTypeTextMap[seat.type]}</div>
                                                            </div>
                                                            <div className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", seat.isActive ? "bg-white/70 text-foreground" : "bg-muted-foreground/20 text-muted-foreground")}>
                                                                {seat.isActive ? "ON" : "OFF"}
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 flex justify-end gap-1">
                                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenDialog(seat)} title={`Sửa ghế ${seat.row}${seat.number}`}>
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className={cn("h-7 w-7", seat.isActive ? "text-amber-600" : "text-green-600")} onClick={() => toggleSeatStatus(seat)} title={seat.isActive ? "Vô hiệu hóa ghế" : "Kích hoạt ghế"}>
                                                                <Power className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setConfirmDeleteSeat(seat)} title={`Xóa ghế ${seat.row}${seat.number}`}>
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid gap-3 border-t pt-4 text-sm text-muted-foreground md:grid-cols-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 rounded border border-blue-300 bg-blue-100" />
                                        Standard
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 rounded border border-amber-300 bg-amber-100" />
                                        VIP
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 rounded border border-rose-300 bg-rose-100" />
                                        Couple
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingSeat ? "Cập Nhật Ghế" : "Thêm Ghế Mới"}</DialogTitle>
                        <DialogDescription>{editingSeat ? "Chỉnh sửa hàng, số, loại và trạng thái ghế." : "Tạo mới một ghế cho phòng đang chọn."}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={onSubmitSeat} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="row">Hàng ghế</Label>
                                <Input id="row" maxLength={5} {...seatForm.register("row")} className={cn(seatForm.formState.errors.row && fieldErrorClassName)} placeholder="A" />
                                {seatForm.formState.errors.row && <p className="text-sm text-destructive">{seatForm.formState.errors.row.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="number">Số ghế</Label>
                                <Input id="number" type="number" min={1} max={100} {...seatForm.register("number", { valueAsNumber: true })} className={cn(seatForm.formState.errors.number && fieldErrorClassName)} />
                                {seatForm.formState.errors.number && <p className="text-sm text-destructive">{seatForm.formState.errors.number.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Loại ghế</Label>
                            <select id="type" {...seatForm.register("type")} className={adminSelectClassName}>
                                <option value="Standard">Standard</option>
                                <option value="VIP">VIP</option>
                                <option value="Couple">Couple</option>
                            </select>
                        </div>

                        <label className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
                            <input type="checkbox" className="h-4 w-4" {...seatForm.register("isActive")} />
                            <span className="text-sm">Ghế đang hoạt động</span>
                        </label>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingSeat ? "Lưu thay đổi" : "Tạo mới"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <ConfirmDialog
                open={Boolean(confirmDeleteSeat)}
                title="Xóa ghế"
                description={`Xóa ghế ${confirmDeleteSeat?.row ?? ""}${confirmDeleteSeat?.number ?? ""}? Hành động này không thể hoàn tác.`}
                confirmText="Xóa ghế"
                variant="destructive"
                loading={isDeleting}
                onOpenChange={(open) => {
                    if (!open) setConfirmDeleteSeat(null);
                }}
                onConfirm={handleDeleteSeat}
            />
        </div>
    );
}

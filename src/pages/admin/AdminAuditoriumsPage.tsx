import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Edit, Grid3X3, Loader2, Plus, Power, Trash2 } from "lucide-react";
import { AuditoriumService } from "../../services/auditorium.service";
import type { Auditorium, AuditoriumRequest } from "../../services/auditorium.service";
import { CinemaService } from "../../services/cinema.service";
import type { Cinema } from "../../services/cinema.service";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { cn } from "../../lib/utils";
import { fieldErrorClassName, getApiErrorMessage } from "./adminVenueHelpers";

const auditoriumSchema = z.object({
    name: z.string().trim().min(1, "Tên phòng là bắt buộc.").max(50, "Tên phòng tối đa 50 ký tự."),
    isActive: z.boolean(),
});

type AuditoriumFormValues = z.infer<typeof auditoriumSchema>;

const defaultValues: AuditoriumFormValues = {
    name: "",
    isActive: true,
};

export function AdminAuditoriumsPage() {
    const { cinemaId } = useParams<{ cinemaId: string }>();
    const navigate = useNavigate();
    const [cinema, setCinema] = useState<Cinema | null>(null);
    const [auditoriums, setAuditoriums] = useState<Auditorium[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingAuditorium, setEditingAuditorium] = useState<Auditorium | null>(null);

    const form = useForm<AuditoriumFormValues>({
        resolver: zodResolver(auditoriumSchema),
        defaultValues,
    });

    const fetchData = async () => {
        if (!cinemaId) {
            setError("Thiếu mã rạp.");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const [cinemaResponse, auditoriumResponse] = await Promise.all([
                CinemaService.getById(cinemaId),
                AuditoriumService.getByCinema(cinemaId, true),
            ]);

            if (!cinemaResponse.succeeded) {
                setError(cinemaResponse.message || "Không thể tải thông tin rạp.");
                return;
            }

            if (!auditoriumResponse.succeeded) {
                setError(auditoriumResponse.message || "Không thể tải danh sách phòng chiếu.");
                return;
            }

            setCinema(cinemaResponse.data ?? null);
            setAuditoriums(auditoriumResponse.data ?? []);
        } catch (err) {
            setError(getApiErrorMessage(err, "Đã xảy ra lỗi khi tải dữ liệu phòng chiếu."));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [cinemaId]);

    const handleOpenDialog = (auditorium?: Auditorium) => {
        setError(null);
        setEditingAuditorium(auditorium ?? null);
        form.reset(
            auditorium
                ? { name: auditorium.name, isActive: auditorium.isActive }
                : defaultValues
        );
        setIsDialogOpen(true);
    };

    const onSubmit = form.handleSubmit(async (values) => {
        if (!cinemaId) {
            setError("Thiếu mã rạp.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            const payload: AuditoriumRequest = {
                name: values.name.trim(),
                cinemaId,
                isActive: values.isActive,
            };

            const response = editingAuditorium
                ? await AuditoriumService.update(editingAuditorium.id, payload)
                : await AuditoriumService.create(payload);

            if (!response.succeeded) {
                setError(response.message || "Không thể lưu thông tin phòng chiếu.");
                return;
            }

            setIsDialogOpen(false);
            await fetchData();
        } catch (err) {
            setError(getApiErrorMessage(err, "Đã xảy ra lỗi khi lưu thông tin phòng chiếu."));
        } finally {
            setIsSubmitting(false);
        }
    });

    const handleDelete = async (auditorium: Auditorium) => {
        if (!window.confirm(`Xóa phòng "${auditorium.name}"? Hành động này không thể hoàn tác.`)) {
            return;
        }

        try {
            setError(null);
            const response = await AuditoriumService.delete(auditorium.id);
            if (!response.succeeded) {
                setError(response.message || "Không thể xóa phòng chiếu.");
                return;
            }

            await fetchData();
        } catch (err) {
            setError(getApiErrorMessage(err, "Không thể xóa phòng chiếu."));
        }
    };

    const toggleStatus = async (auditorium: Auditorium) => {
        try {
            setError(null);
            const response = auditorium.isActive
                ? await AuditoriumService.deactivate(auditorium.id)
                : await AuditoriumService.activate(auditorium.id);

            if (!response.succeeded) {
                setError(response.message || "Không thể cập nhật trạng thái phòng.");
                return;
            }

            await fetchData();
        } catch (err) {
            setError(getApiErrorMessage(err, "Không thể cập nhật trạng thái phòng."));
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <Button variant="outline" size="icon" onClick={() => navigate("/admin/cinemas")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold tracking-tight">Phòng Chiếu {cinema ? `- ${cinema.name}` : ""}</h2>
                    <p className="mt-1 text-muted-foreground">Quản lý CRUD phòng chiếu cho cụm rạp đang chọn.</p>
                </div>
                <Button className="gap-2 shadow-md hover:shadow-lg transition-all" onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4" />
                    Thêm Phòng Chiếu
                </Button>
            </div>

            {error && <div className="rounded-md border border-destructive/20 bg-destructive/15 p-4 text-destructive">{error}</div>}

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => (
                        <Card key={item} className="h-32 animate-pulse shadow-sm">
                            <CardHeader className="h-full rounded-lg bg-muted/50" />
                        </Card>
                    ))}
                </div>
            ) : auditoriums.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/50 bg-card/50 p-12 text-muted-foreground shadow-sm backdrop-blur-sm">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Grid3X3 className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">Chưa có phòng chiếu nào</p>
                    <p className="max-w-md text-center text-sm">Thêm phòng chiếu trước khi cấu hình sơ đồ ghế.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {auditoriums.map((auditorium) => (
                        <Card key={auditorium.id} className={cn("transition-all duration-200 hover:shadow-md", !auditorium.isActive && "opacity-70 grayscale-[50%]")}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-3">
                                <CardTitle className="text-lg font-bold">{auditorium.name}</CardTitle>
                                <div className={cn("rounded-full px-2 py-0.5 text-xs font-medium", auditorium.isActive ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive")}>
                                    {auditorium.isActive ? "Hoạt động" : "Tạm ngưng"}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Tổng số ghế:</span>
                                    <span className="text-lg font-bold">{auditorium.totalSeats ?? 0}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="secondary" size="sm" className="w-full gap-2" onClick={() => navigate(`/admin/cinemas/${cinemaId}/auditoriums/${auditorium.id}/seats`)}>
                                        <Grid3X3 className="h-3.5 w-3.5" />
                                        Ghế
                                    </Button>
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(auditorium)} title="Sửa phòng">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className={cn("h-8 w-8", auditorium.isActive ? "text-amber-500" : "text-green-500")} onClick={() => toggleStatus(auditorium)} title={auditorium.isActive ? "Tạm ngưng" : "Kích hoạt"}>
                                            <Power className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(auditorium)} title="Xóa phòng">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingAuditorium ? "Cập Nhật Phòng Chiếu" : "Thêm Phòng Chiếu Mới"}</DialogTitle>
                        <DialogDescription>{editingAuditorium ? "Chỉnh sửa thông tin phòng chiếu hiện có." : "Tạo phòng chiếu mới cho rạp này."}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Tên phòng</Label>
                            <Input id="name" {...form.register("name")} className={cn(form.formState.errors.name && fieldErrorClassName)} placeholder="Ví dụ: Phòng 01, IMAX, VIP 02" />
                            {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                        </div>

                        <label className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
                            <input type="checkbox" className="h-4 w-4" {...form.register("isActive")} />
                            <span className="text-sm">Cho phép sử dụng phòng ngay sau khi lưu</span>
                        </label>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingAuditorium ? "Lưu thay đổi" : "Tạo mới"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Edit, Loader2, MapPin, Plus, Power, Trash2 } from "lucide-react";
import { CinemaService } from "../../services/cinema.service";
import type { Cinema, CinemaRequest } from "../../services/cinema.service";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { cn } from "../../lib/utils";
import { fieldErrorClassName, getApiErrorMessage } from "./adminVenueHelpers";

const cinemaSchema = z.object({
    name: z.string().trim().min(1, "Tên rạp là bắt buộc.").max(100, "Tên rạp tối đa 100 ký tự."),
    city: z.string().trim().min(1, "Thành phố là bắt buộc.").max(100, "Thành phố tối đa 100 ký tự."),
    address: z.string().trim().min(1, "Địa chỉ là bắt buộc.").max(200, "Địa chỉ tối đa 200 ký tự."),
    isActive: z.boolean(),
});

type CinemaFormValues = z.infer<typeof cinemaSchema>;

const defaultValues: CinemaFormValues = {
    name: "",
    city: "",
    address: "",
    isActive: true,
};

export function AdminCinemasPage() {
    const navigate = useNavigate();
    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCinema, setEditingCinema] = useState<Cinema | null>(null);

    const form = useForm<CinemaFormValues>({
        resolver: zodResolver(cinemaSchema),
        defaultValues,
    });

    const fetchCinemas = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await CinemaService.getAll(true);
            if (!response.succeeded) {
                setError(response.message || "Không thể tải danh sách rạp.");
                return;
            }

            setCinemas(response.data ?? []);
        } catch (err) {
            setError(getApiErrorMessage(err, "Đã xảy ra lỗi khi tải danh sách rạp."));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCinemas();
    }, []);

    const handleOpenDialog = (cinema?: Cinema) => {
        setError(null);
        setEditingCinema(cinema ?? null);
        form.reset(
            cinema
                ? {
                    name: cinema.name,
                    city: cinema.city,
                    address: cinema.address,
                    isActive: cinema.isActive,
                }
                : defaultValues
        );
        setIsDialogOpen(true);
    };

    const onSubmit = form.handleSubmit(async (values) => {
        try {
            setIsSubmitting(true);
            setError(null);

            const payload: CinemaRequest = {
                name: values.name.trim(),
                city: values.city.trim(),
                address: values.address.trim(),
                isActive: values.isActive,
            };

            const response = editingCinema
                ? await CinemaService.update(editingCinema.id, payload)
                : await CinemaService.create(payload);

            if (!response.succeeded) {
                setError(response.message || "Không thể lưu thông tin rạp.");
                return;
            }

            setIsDialogOpen(false);
            await fetchCinemas();
        } catch (err) {
            setError(getApiErrorMessage(err, "Đã xảy ra lỗi khi lưu thông tin rạp."));
        } finally {
            setIsSubmitting(false);
        }
    });

    const handleDelete = async (cinema: Cinema) => {
        if (!window.confirm(`Xóa rạp "${cinema.name}"? Hành động này không thể hoàn tác.`)) {
            return;
        }

        try {
            setError(null);
            const response = await CinemaService.delete(cinema.id);
            if (!response.succeeded) {
                setError(response.message || "Không thể xóa rạp.");
                return;
            }

            await fetchCinemas();
        } catch (err) {
            setError(getApiErrorMessage(err, "Không thể xóa rạp."));
        }
    };

    const toggleStatus = async (cinema: Cinema) => {
        try {
            setError(null);
            const response = cinema.isActive
                ? await CinemaService.deactivate(cinema.id)
                : await CinemaService.activate(cinema.id);

            if (!response.succeeded) {
                setError(response.message || "Không thể cập nhật trạng thái rạp.");
                return;
            }

            await fetchCinemas();
        } catch (err) {
            setError(getApiErrorMessage(err, "Không thể cập nhật trạng thái rạp."));
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Quản Lý Cụm Rạp</h2>
                    <p className="mt-1 text-muted-foreground">Tạo, cập nhật và quản lý trạng thái rạp cho khu vực admin.</p>
                </div>
                <Button className="gap-2 shadow-md hover:shadow-lg transition-all" onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4" />
                    Thêm Cụm Rạp
                </Button>
            </div>

            {error && <div className="rounded-md border border-destructive/20 bg-destructive/15 p-4 text-destructive">{error}</div>}

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                        <Card key={item} className="animate-pulse shadow-sm">
                            <CardHeader className="h-24 rounded-t-lg bg-muted/50" />
                            <CardContent className="h-32 rounded-b-lg bg-card" />
                        </Card>
                    ))}
                </div>
            ) : cinemas.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/50 bg-card/50 p-12 text-muted-foreground shadow-sm backdrop-blur-sm">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">Chưa có cụm rạp nào</p>
                    <p className="max-w-md text-center text-sm">Tạo cụm rạp đầu tiên để bắt đầu quản lý phòng chiếu và sơ đồ ghế.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {cinemas.map((cinema) => (
                        <Card key={cinema.id} className={cn("transition-all duration-200 hover:shadow-md", !cinema.isActive && "opacity-70 grayscale-[50%]")}>
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                                <div className="space-y-1">
                                    <CardTitle className="line-clamp-1 text-xl font-bold">{cinema.name}</CardTitle>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        <span className="line-clamp-1">{cinema.city}</span>
                                    </div>
                                </div>
                                <div className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", cinema.isActive ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive")}>
                                    {cinema.isActive ? "Hoạt động" : "Tạm ngưng"}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="min-h-[40px] line-clamp-2 text-sm text-muted-foreground">{cinema.address}</p>

                                <div className="flex items-center justify-between border-t border-border pt-4">
                                    <button
                                        type="button"
                                        className="text-left text-sm font-medium transition-colors hover:text-primary"
                                        onClick={() => navigate(`/admin/cinemas/${cinema.id}/auditoriums`)}
                                    >
                                        <span className="font-bold text-primary">{cinema.numberOfAuditoriums}</span> phòng chiếu
                                    </button>

                                    <div className="flex items-center gap-1">
                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/cinemas/${cinema.id}/auditoriums`)} title="Xem phòng chiếu">
                                            <Building2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleOpenDialog(cinema)} title="Sửa thông tin">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" className={cn("h-8 w-8", cinema.isActive ? "text-amber-500 hover:text-amber-600 hover:bg-amber-500/10" : "text-green-500 hover:text-green-600 hover:bg-green-500/10")} onClick={() => toggleStatus(cinema)} title={cinema.isActive ? "Tạm ngưng" : "Kích hoạt"}>
                                            <Power className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(cinema)} title="Xóa rạp">
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
                <DialogContent className="sm:max-w-[460px]">
                    <DialogHeader>
                        <DialogTitle>{editingCinema ? "Cập Nhật Cụm Rạp" : "Thêm Cụm Rạp Mới"}</DialogTitle>
                        <DialogDescription>{editingCinema ? "Chỉnh sửa thông tin rạp và trạng thái vận hành." : "Nhập đầy đủ thông tin để tạo cụm rạp mới."}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Tên rạp</Label>
                            <Input id="name" {...form.register("name")} className={cn(form.formState.errors.name && fieldErrorClassName)} placeholder="Ví dụ: CGV Vincom Đồng Khởi" />
                            {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city">Thành phố</Label>
                            <Input id="city" {...form.register("city")} className={cn(form.formState.errors.city && fieldErrorClassName)} placeholder="Ví dụ: TP. Hồ Chí Minh" />
                            {form.formState.errors.city && <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Địa chỉ</Label>
                            <Input id="address" {...form.register("address")} className={cn(form.formState.errors.address && fieldErrorClassName)} placeholder="Ví dụ: 72 Lê Thánh Tôn, Quận 1" />
                            {form.formState.errors.address && <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>}
                        </div>

                        <label className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
                            <input type="checkbox" className="h-4 w-4" {...form.register("isActive")} />
                            <span className="text-sm">Hoạt động ngay sau khi lưu</span>
                        </label>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingCinema ? "Lưu thay đổi" : "Tạo mới"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

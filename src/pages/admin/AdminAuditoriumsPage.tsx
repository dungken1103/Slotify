import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuditoriumService } from "../../services/auditorium.service";
import type { Auditorium } from "../../services/auditorium.service";
import { CinemaService } from "../../services/cinema.service";
import type { Cinema } from "../../services/cinema.service";
import { Button } from "../../components/ui/button";
import { Plus, Edit, Trash2, Power, ArrowLeft, Grid3X3, Loader2 } from "lucide-react";
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

export function AdminAuditoriumsPage() {
    const { cinemaId } = useParams<{ cinemaId: string }>();
    const navigate = useNavigate();

    const [cinema, setCinema] = useState<Cinema | null>(null);
    const [auditoriums, setAuditoriums] = useState<Auditorium[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingAuditorium, setEditingAuditorium] = useState<Auditorium | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        isActive: true
    });

    const fetchData = async () => {
        if (!cinemaId) return;

        try {
            setIsLoading(true);
            const [cinemaRes, auditoriumRes] = await Promise.all([
                CinemaService.getById(cinemaId),
                AuditoriumService.getByCinema(cinemaId, true)
            ]);

            if (cinemaRes.succeeded) {
                setCinema(cinemaRes.data);
            }

            if (auditoriumRes.succeeded) {
                setAuditoriums(auditoriumRes.data);
            } else {
                setError(auditoriumRes.message || "Không thể tải danh sách phòng chiếu");
            }
        } catch (err) {
            setError("Đã xảy ra lỗi khi kết nối với máy chủ");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [cinemaId]);

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            // Optimistic update
            setAuditoriums(auditoriums.map(a => a.id === id ? { ...a, isActive: !currentStatus } : a));

            if (currentStatus) {
                await AuditoriumService.deactivate(id);
            } else {
                await AuditoriumService.activate(id);
            }
        } catch (err) {
            console.error("Lỗi khi cập nhật trạng thái", err);
            fetchData();
        }
    };

    const handleOpenDialog = (auditorium?: Auditorium) => {
        if (auditorium) {
            setEditingAuditorium(auditorium);
            setFormData({
                name: auditorium.name,
                isActive: auditorium.isActive
            });
        } else {
            setEditingAuditorium(null);
            setFormData({
                name: "",
                isActive: true
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cinemaId) return;

        try {
            setIsSubmitting(true);
            if (editingAuditorium) {
                await AuditoriumService.update(editingAuditorium.id, {
                    name: formData.name,
                    cinemaId: cinemaId,
                    isActive: formData.isActive
                });
            } else {
                await AuditoriumService.create({
                    name: formData.name,
                    cinemaId: cinemaId,
                    isActive: formData.isActive
                });
            }
            setIsDialogOpen(false);
            fetchData();
        } catch (err) {
            console.error("Lỗi khi lưu phòng chiếu", err);
            setError("Đã xảy ra lỗi khi lưu thông tin phòng chiếu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa phòng chiếu này không?")) {
            try {
                await AuditoriumService.delete(id);
                fetchData();
            } catch (err) {
                console.error("Lỗi khi xóa phòng chiếu", err);
                setError("Không thể xóa phòng chiếu này.");
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate("/admin/cinemas")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold tracking-tight">
                        Phòng Chiếu {cinema ? `- ${cinema.name}` : ''}
                    </h2>
                    <p className="text-muted-foreground mt-1">Quản lý sơ đồ và danh sách phòng chiếu thuộc cụm rạp này.</p>
                </div>
                <Button className="gap-2 shadow-md hover:shadow-lg transition-all" onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4" /> Thêm Phòng Chiếu
                </Button>
            </div>

            {error && (
                <div className="bg-destructive/15 text-destructive p-4 rounded-md border border-destructive/20">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => (
                        <Card key={i} className="animate-pulse shadow-sm h-32">
                            <CardHeader className="h-full bg-muted/50 rounded-lg" />
                        </Card>
                    ))}
                </div>
            ) : auditoriums.length === 0 ? (
                <div className="border border-border/50 rounded-xl p-12 flex flex-col items-center justify-center text-muted-foreground bg-card/50 shadow-sm gap-3 backdrop-blur-sm border-dashed">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        <Grid3X3 className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">Chưa có phòng chiếu nào</p>
                    <p className="text-sm text-center max-w-md">Hãy thêm phòng chiếu để bắt đầu thiết lập sơ đồ ghế ngồi.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {auditoriums.map((auditorium) => (
                        <Card
                            key={auditorium.id}
                            className={`transition-all duration-200 hover:shadow-md ${!auditorium.isActive ? 'opacity-70 grayscale-[50%]' : ''}`}
                        >
                            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 border-b">
                                <CardTitle className="text-lg font-bold">{auditorium.name}</CardTitle>
                                <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${auditorium.isActive ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
                                    {auditorium.isActive ? 'Hoạt động' : 'Đóng'}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Tổng số ghế:</span>
                                    <span className="font-bold text-lg">{auditorium.totalSeats || 0}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="w-full gap-2"
                                        onClick={() => navigate(`/admin/cinemas/${cinemaId}/auditoriums/${auditorium.id}/seats`)}
                                    >
                                        <Grid3X3 className="h-3.5 w-3.5" /> Sơ đồ ghế
                                    </Button>
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(auditorium)} title="Sửa">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className={`h-8 w-8 ${auditorium.isActive ? 'text-amber-500' : 'text-green-500'}`} onClick={() => toggleStatus(auditorium.id, auditorium.isActive)} title={auditorium.isActive ? "Tạm ngưng" : "Kích hoạt"}>
                                            <Power className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(auditorium.id)} title="Xóa">
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
                        <DialogDescription>
                            {editingAuditorium ? "Thay đổi tên phòng chiếu." : "Tạo một phòng chiếu mới cho rạp chiếu phim này."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Tên phòng</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="col-span-3"
                                    placeholder="Vd: Rạp 1, VIP 1..."
                                    required
                                />
                            </div>
                            {!editingAuditorium && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="status" className="text-right">Trạng thái</Label>
                                    <div className="col-span-3 flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="status"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <Label htmlFor="status" className="text-sm font-normal cursor-pointer">
                                            Mở cửa sử dụng
                                        </Label>
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy bỏ</Button>
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

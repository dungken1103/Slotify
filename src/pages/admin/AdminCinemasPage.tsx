import { useEffect, useState } from "react";
import { CinemaService } from "../../services/cinema.service";
import type { Cinema } from "../../services/cinema.service";
import { Button } from "../../components/ui/button";
import { Plus, Edit, Trash2, Power, Building2, MapPin, Loader2 } from "lucide-react";
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

export function AdminCinemasPage() {
    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCinema, setEditingCinema] = useState<Cinema | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        city: "",
        isActive: true
    });

    const fetchCinemas = async () => {
        try {
            setIsLoading(true);
            const response = await CinemaService.getAll(true); // Include inactive for admin
            if (response.succeeded) {
                setCinemas(response.data);
            } else {
                setError(response.message || "Không thể tải danh sách rạp");
            }
        } catch (err) {
            setError("Đã xảy ra lỗi khi kết nối với máy chủ");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCinemas();
    }, []);

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            // Optimistic update
            setCinemas(cinemas.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));

            if (currentStatus) {
                await CinemaService.deactivate(id);
            } else {
                await CinemaService.activate(id);
            }
        } catch (err) {
            console.error("Lỗi khi cập nhật trạng thái", err);
            fetchCinemas();
        }
    };

    const handleOpenDialog = (cinema?: Cinema) => {
        if (cinema) {
            setEditingCinema(cinema);
            setFormData({
                name: cinema.name,
                address: cinema.address,
                city: cinema.city,
                isActive: cinema.isActive
            });
        } else {
            setEditingCinema(null);
            setFormData({
                name: "",
                address: "",
                city: "",
                isActive: true
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            if (editingCinema) {
                await CinemaService.update(editingCinema.id, formData);
            } else {
                await CinemaService.create(formData);
            }
            setIsDialogOpen(false);
            fetchCinemas();
        } catch (err) {
            console.error("Lỗi khi lưu cụm rạp", err);
            setError("Đã xảy ra lỗi khi lưu thông tin cụm rạp.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa rạp này không? Hành động này không thể hoàn tác.")) {
            try {
                await CinemaService.delete(id);
                fetchCinemas();
            } catch (err) {
                console.error("Lỗi khi xóa rạp", err);
                setError("Không thể xóa cụm rạp này.");
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Quản Lý Cụm Rạp</h2>
                    <p className="text-muted-foreground mt-1">Quản lý danh sách các cụm rạp và hệ thống phòng chiếu.</p>
                </div>
                <Button
                    className="gap-2 shadow-md hover:shadow-lg transition-all"
                    onClick={() => handleOpenDialog()}
                >
                    <Plus className="h-4 w-4" /> Thêm Cụm Rạp
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
            ) : cinemas.length === 0 ? (
                <div className="border border-border/50 rounded-xl p-12 flex flex-col items-center justify-center text-muted-foreground bg-card/50 shadow-sm gap-3 backdrop-blur-sm border-dashed">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">Chưa có cụm rạp nào</p>
                    <p className="text-sm text-center max-w-md">Hãy bắt đầu bằng cách thêm cụm rạp đầu tiên vào hệ thống của bạn.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {cinemas.map((cinema) => (
                        <Card
                            key={cinema.id}
                            className={`transition-all duration-200 hover:shadow-md ${!cinema.isActive ? 'opacity-70 grayscale-[50%]' : ''}`}
                        >
                            <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold line-clamp-1">{cinema.name}</CardTitle>
                                    <div className="flex items-center text-sm text-muted-foreground gap-1">
                                        <MapPin className="h-3 w-3" />
                                        <span className="line-clamp-1">{cinema.city}</span>
                                    </div>
                                </div>
                                <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cinema.isActive ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
                                    {cinema.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                                        {cinema.address}
                                    </p>

                                    <div className="flex items-center justify-between border-t border-border pt-4">
                                        <div className="text-sm font-medium">
                                            <span className="text-primary font-bold">{cinema.numberOfAuditoriums}</span> Phòng chiếu
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                                                onClick={() => handleOpenDialog(cinema)}
                                                title="Sửa thông tin"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className={`h-8 w-8 transition-colors ${cinema.isActive ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-500/10' : 'text-green-500 hover:text-green-600 hover:bg-green-500/10'}`}
                                                onClick={() => toggleStatus(cinema.id, cinema.isActive)}
                                                title={cinema.isActive ? "Tạm ngưng" : "Kích hoạt"}
                                            >
                                                <Power className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                onClick={() => handleDelete(cinema.id)}
                                                title="Xóa rạp"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
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
                        <DialogTitle>{editingCinema ? "Cập Nhật Cụm Rạp" : "Thêm Cụm Rạp Mới"}</DialogTitle>
                        <DialogDescription>
                            {editingCinema ? "Thay đổi thông tin chi tiết của cụm rạp hiện tại." : "Nhập thông tin chi tiết để tạo cụm rạp mới trong hệ thống."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Tên rạp</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="city" className="text-right">Thành phố</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="address" className="text-right">Địa chỉ</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            {!editingCinema && (
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
                                            Hoạt động ngay lập tức
                                        </Label>
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Hủy bỏ
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

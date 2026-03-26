import { useEffect, useState } from "react";
import { UserService } from "../../services/user.service";
import type { User } from "../../services/user.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Loader2, Users, ShieldCheck, Mail, Phone, Calendar } from "lucide-react";
import { ConfirmDialog } from "../../components/ui/confirm-dialog";

export function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [pendingRoleChange, setPendingRoleChange] = useState<{ userId: string; newRole: string } | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const res = await UserService.getAll();
            if (res.succeeded) {
                setUsers(res.data);
            } else {
                setError(res.message || "Không thể tải danh sách người dùng.");
            }
        } catch (err) {
            setError("Đã xảy ra lỗi kết nối khi tải dữ liệu.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChangeRole = async (userId: string, newRole: string) => {
        try {
            setUpdatingId(userId);
            const res = await UserService.changeRole(userId, newRole);
            if (res.succeeded) {
                // Update local state to reflect the change
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole.toUpperCase() } : u));
            } else {
                alert(res.message || "Không thể cập nhật quyền.");
            }
        } catch (err: any) {
            console.error(err);
            alert(err?.response?.data?.message || "Lỗi khi cập nhật quyền.");
        } finally {
            setUpdatingId(null);
            setPendingRoleChange(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric', month: 'short', day: '2-digit'
        }).format(date);
    };

    const getInitials = (name: string) => {
        if (!name) return "U";
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Quản Lý Người Dùng</h2>
                    <p className="text-muted-foreground mt-1">Tra cứu danh sách tài khoản và phân quyền quản trị.</p>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm">
                    <Users className="h-5 w-5" />
                    Tổng số: {users.length}
                </div>
            </div>

            {error && (
                <div className="bg-destructive/15 text-destructive p-4 rounded-md border border-destructive/20">
                    {error}
                </div>
            )}

            <Card className="shadow-sm border-border/50">
                <CardHeader className="bg-muted/30 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                        Danh sách tài khoản hệ thống
                    </CardTitle>
                    <CardDescription>
                        Cẩn trọng khi cấp quyền ADMIN cho người dùng mới.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center flex-col items-center gap-4 py-24 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            Đang tải danh sách...
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-24 text-muted-foreground">
                            Không tìm thấy tài khoản nào trong hệ thống.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 font-semibold">Tài khoản</th>
                                        <th scope="col" className="px-6 py-4 font-semibold">Liên hệ</th>
                                        <th scope="col" className="px-6 py-4 font-semibold">Ngày tham gia</th>
                                        <th scope="col" className="px-6 py-4 font-semibold text-right">Quyền Hạn</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-muted/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 border border-primary/20 rounded-full flex items-center justify-center bg-primary/5 text-primary text-xs font-bold overflow-hidden">
                                                        {user.avatarUrl ? (
                                                            <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full object-cover" />
                                                        ) : (
                                                            getInitials(user.fullName || user.username)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-foreground">{user.fullName || 'Chưa cung cấp tên'}</div>
                                                        <div className="text-xs text-muted-foreground">@{user.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <Mail className="h-3 w-3 text-muted-foreground" />
                                                        {user.email}
                                                    </div>
                                                    {user.phoneNumber && (
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                                            {user.phoneNumber}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {formatDate(user.createdAt)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end items-center gap-3">
                                                    {user.role === 'ADMIN' ? (
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full border border-purple-200">
                                                            <ShieldCheck className="h-3.5 w-3.5" /> ADMIN
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
                                                            <Users className="h-3.5 w-3.5" /> USER
                                                        </div>
                                                    )}

                                                    <select
                                                        className="w-[120px] h-8 text-xs rounded-md border border-input bg-background px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                                                        value={user.role}
                                                        onChange={(e) => setPendingRoleChange({ userId: user.id, newRole: e.target.value })}
                                                        disabled={updatingId === user.id}
                                                    >
                                                        <option value="USER">Thành viên</option>
                                                        <option value="ADMIN">Quản trị viên</option>
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
            <ConfirmDialog
                open={Boolean(pendingRoleChange)}
                title="Xác nhận đổi quyền"
                description={`Bạn có chắc muốn cấp quyền ${pendingRoleChange?.newRole ?? ""} cho người dùng này?`}
                confirmText="Xác nhận"
                loading={Boolean(updatingId)}
                onOpenChange={(open) => {
                    if (!open) setPendingRoleChange(null);
                }}
                onConfirm={() => {
                    if (pendingRoleChange) {
                        handleChangeRole(pendingRoleChange.userId, pendingRoleChange.newRole);
                    }
                }}
            />
        </div>
    );
}

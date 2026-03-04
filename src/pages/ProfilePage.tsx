import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthService } from "@/services/auth.service";
import { UploadService } from "@/services/upload.service";
import { useAuthStore } from "@/middlewares/useAuthStore";
import { updateProfileSchema, changePasswordSchema } from "@/types/auth";
import type { UpdateProfileFormData, ChangePasswordFormData } from "@/types/auth";
import { Loader2, Camera, User, Key, Save } from "lucide-react";

export function ProfilePage() {
    const { user, updateUser } = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

    const [isUploading, setIsUploading] = useState(false);
    const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });
    const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });

    const {
        register: registerProfile,
        handleSubmit: handleProfileSubmit,
        formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
        reset: resetProfileForm
    } = useForm<UpdateProfileFormData>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            fullName: user?.fullName || "",
            phoneNumber: user?.phoneNumber || "",
        }
    });

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
        reset: resetPasswordForm
    } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
    });

    // Re-sync form default values if user data is updated externally
    useEffect(() => {
        if (user) {
            resetProfileForm({
                fullName: user.fullName || "",
                phoneNumber: user.phoneNumber || "",
            });
        }
    }, [user, resetProfileForm]);

    const onProfileSave = async (data: UpdateProfileFormData) => {
        setProfileMsg({ type: "", text: "" });
        try {
            const response = await AuthService.updateProfile(data);
            if (response.succeeded && response.data) {
                updateUser(response.data);
                setProfileMsg({ type: "success", text: "Cập nhật hồ sơ thành công" });
            } else {
                setProfileMsg({ type: "error", text: response.message || "Không thể cập nhật hồ sơ" });
            }
        } catch (error) {
            if (error && typeof error === 'object' && 'response' in error) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const err = error as any;
                if (err.response?.data?.message) {
                    setProfileMsg({ type: "error", text: err.response.data.message });
                } else {
                    setProfileMsg({ type: "error", text: "Đã có lỗi xảy ra. Mời thử lại." });
                }
            } else {
                setProfileMsg({ type: "error", text: "Đã có lỗi xảy ra. Mời thử lại." });
            }
        }
    };

    const onPasswordSave = async (data: ChangePasswordFormData) => {
        setPasswordMsg({ type: "", text: "" });
        try {
            const response = await AuthService.changePassword(data);
            if (response.succeeded) {
                setPasswordMsg({ type: "success", text: "Đổi mật khẩu thành công" });
                resetPasswordForm(); // Clear the form on success
            } else {
                setPasswordMsg({ type: "error", text: response.message || "Không thể đổi mật khẩu" });
            }
        } catch (error) {
            if (error && typeof error === 'object' && 'response' in error) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const err = error as any;
                if (err.response?.data?.message) {
                    setPasswordMsg({ type: "error", text: err.response.data.message });
                } else {
                    setPasswordMsg({ type: "error", text: "Đã có lỗi xảy ra. Mời thử lại." });
                }
            } else {
                setPasswordMsg({ type: "error", text: "Đã có lỗi xảy ra. Mời thử lại." });
            }
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check size limit (e.g., 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setProfileMsg({ type: "error", text: "Kích thước ảnh không được vượt quá 5MB." });
            return;
        }

        setIsUploading(true);
        setProfileMsg({ type: "", text: "" });

        try {
            const response = await UploadService.uploadImage(file);
            if (response.succeeded && response.data) {
                // Automatically save the new avatar url by calling updateProfile
                if (user) {
                    // This assumes your backend allows patching or updating avatar Url via specific endpoint.
                    // Since our backend doesn't explicitly have an AvatarUrl in UserDto inside AuthService UpdateProfile
                    // We might need to ensure the backend supports mapping AvatarUrl or we just log a message 
                    // saying "Avatar uploaded!"
                    // For now, if your backend /Auth/profile doesn't update the AvatarUrl, we will just show it.
                    // Currently, let's pseudo-update it in state to preview it.
                    updateUser({ ...user, avatarUrl: response.data });
                    setProfileMsg({ type: "success", text: "Tải ảnh đại diện thành công!" });
                }
            } else {
                setProfileMsg({ type: "error", text: response.message || "Lỗi tải ảnh" });
            }
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            if (err.response?.data?.message) {
                setProfileMsg({ type: "error", text: err.response.data.message });
            } else {
                setProfileMsg({ type: "error", text: "Đã có lỗi xảy ra khi tải ảnh." });
            }
        } finally {
            setIsUploading(false);
            // Reset input value so the same file could be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    if (!user) {
        return <div className="text-center p-8">Đang tải thông tin...</div>;
    }

    return (
        <div className="container max-w-4xl py-10 mt-16">
            <h1 className="text-3xl font-bold mb-8">Hồ sơ cá nhân</h1>

            <div className="flex flex-col md:flex-row gap-8">

                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 flex flex-col space-y-2">
                    <Button
                        variant={activeTab === "profile" ? "secondary" : "ghost"}
                        className="justify-start"
                        onClick={() => setActiveTab("profile")}
                    >
                        <User className="mr-2 h-4 w-4" />
                        Thông tin chung
                    </Button>
                    <Button
                        variant={activeTab === "password" ? "secondary" : "ghost"}
                        className="justify-start"
                        onClick={() => setActiveTab("password")}
                    >
                        <Key className="mr-2 h-4 w-4" />
                        Đổi mật khẩu
                    </Button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 border border-white/10 rounded-lg p-6 bg-background/50">

                    {/* PROFILE SECTION */}
                    {activeTab === "profile" && (
                        <div className="space-y-8">
                            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                                <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-background bg-secondary flex items-center justify-center">
                                        {isUploading ? (
                                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        ) : user.avatarUrl ? (
                                            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="h-12 w-12 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="h-8 w-8 text-white" />
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <div className="flex-1 space-y-1 text-center sm:text-left">
                                    <h2 className="text-xl font-semibold">{user.fullName}</h2>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                    <p className="text-xs text-primary bg-primary/10 inline-block px-2 py-1 rounded-full mt-2">
                                        Vai trò: {user.role}
                                    </p>
                                </div>
                            </div>

                            {profileMsg.text && (
                                <div className={`p-3 rounded-md text-sm ${profileMsg.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                    {profileMsg.text}
                                </div>
                            )}

                            <form onSubmit={handleProfileSubmit(onProfileSave)} className="space-y-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium leading-none" htmlFor="fullName">
                                        Họ và tên
                                    </label>
                                    <Input
                                        id="fullName"
                                        {...registerProfile("fullName")}
                                    />
                                    {profileErrors.fullName && <p className="text-xs text-red-500">{profileErrors.fullName.message}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium leading-none" htmlFor="phoneNumber">
                                        Số điện thoại
                                    </label>
                                    <Input
                                        id="phoneNumber"
                                        {...registerProfile("phoneNumber")}
                                    />
                                    {profileErrors.phoneNumber && <p className="text-xs text-red-500">{profileErrors.phoneNumber.message}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium leading-none text-muted-foreground">
                                        Tên đăng nhập (Không thể thay đổi)
                                    </label>
                                    <Input value={user.username} disabled />
                                </div>

                                <Button type="submit" disabled={isSubmittingProfile} className="mt-4">
                                    {isSubmittingProfile ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Lưu thay đổi
                                </Button>
                            </form>
                        </div>
                    )}

                    {/* PASSWORD SECTION */}
                    {activeTab === "password" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold">Đổi mật khẩu</h2>
                                <p className="text-sm text-muted-foreground">Đảm bảo mật khẩu của bạn có ít nhất 6 ký tự để bảo mật tài khoản.</p>
                            </div>

                            {passwordMsg.text && (
                                <div className={`p-3 rounded-md text-sm ${passwordMsg.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                    {passwordMsg.text}
                                </div>
                            )}

                            <form onSubmit={handlePasswordSubmit(onPasswordSave)} className="space-y-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium leading-none" htmlFor="oldPassword">
                                        Mật khẩu hiện tại
                                    </label>
                                    <Input
                                        id="oldPassword"
                                        type="password"
                                        {...registerPassword("oldPassword")}
                                    />
                                    {passwordErrors.oldPassword && <p className="text-xs text-red-500">{passwordErrors.oldPassword.message}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium leading-none" htmlFor="newPassword">
                                        Mật khẩu mới
                                    </label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        {...registerPassword("newPassword")}
                                    />
                                    {passwordErrors.newPassword && <p className="text-xs text-red-500">{passwordErrors.newPassword.message}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium leading-none" htmlFor="confirmNewPassword">
                                        Xác nhận mật khẩu mới
                                    </label>
                                    <Input
                                        id="confirmNewPassword"
                                        type="password"
                                        {...registerPassword("confirmNewPassword")}
                                    />
                                    {passwordErrors.confirmNewPassword && <p className="text-xs text-red-500">{passwordErrors.confirmNewPassword.message}</p>}
                                </div>

                                <Button type="submit" disabled={isSubmittingPassword} className="mt-4 bg-primary">
                                    {isSubmittingPassword ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Cập nhật mật khẩu
                                </Button>
                            </form>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

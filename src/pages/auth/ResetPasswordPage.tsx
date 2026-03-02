import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthService } from "@/services/auth.service";
import { resetPasswordSchema } from "@/types/auth";
import type { ResetPasswordFormData } from "@/types/auth";
import { Loader2 } from "lucide-react";

export function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [errorMsg, setErrorMsg] = useState("");
    const [invalidToken, setInvalidToken] = useState(false);

    // Initial check for token presence
    useEffect(() => {
        // React 18 strict mode + no-sync-set-state warning fix
        let timeoutId: ReturnType<typeof setTimeout>;
        if (!token) {
            timeoutId = setTimeout(() => {
                setInvalidToken(true);
            }, 0);
        }
        return () => clearTimeout(timeoutId);
    }, [token]);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) return;

        setErrorMsg("");
        try {
            const payload = {
                ...data,
                token
            };

            const response = await AuthService.resetPassword(payload);
            if (response.succeeded) {
                navigate("/login?reset=success");
            } else {
                setErrorMsg(response.message || "Không thể đặt lại mật khẩu");
            }
        } catch (error) {
            if (error && typeof error === 'object' && 'response' in error) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const err = error as any;
                if (err.response?.data?.message) {
                    setErrorMsg(err.response.data.message);
                } else {
                    setErrorMsg("Đã có lỗi xảy ra. Mời thử lại.");
                }
            } else {
                setErrorMsg("Đã có lỗi xảy ra. Mời thử lại.");
            }
        }
    };

    if (invalidToken) {
        return (
            <div className="grid gap-6 text-center">
                <div className="mb-4 text-red-500">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">Liên kết không hợp lệ</h1>
                <p className="text-sm text-muted-foreground">
                    Đường dẫn lấy lại mật khẩu này không hợp lệ hoặc đã hết hạn.
                </p>
                <Link to="/forgot-password" className="mt-4">
                    <Button className="w-full">
                        Thử lại
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">Đặt Mật Khẩu Mới</h1>
                <p className="text-sm text-muted-foreground">
                    Vui lòng nhập mật khẩu mới của bạn bên dưới
                </p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none" htmlFor="newPassword">
                            Mật khẩu mới
                        </label>
                        <Input
                            id="newPassword"
                            type="password"
                            placeholder="Tạo mật khẩu"
                            disabled={isSubmitting}
                            {...register("newPassword")}
                        />
                        {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none" htmlFor="confirmPassword">
                            Xác nhận mật khẩu mới
                        </label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Nhập lại mật khẩu"
                            disabled={isSubmitting}
                            {...register("confirmPassword")}
                        />
                        {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
                    </div>

                    {errorMsg && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                            <p className="text-sm text-red-500 text-center">{errorMsg}</p>
                        </div>
                    )}

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : "Đổi mật khẩu"}
                    </Button>
                </div>
            </form>
        </div >
    );
}

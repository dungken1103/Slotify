import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { AuthService } from "@/services/auth.service";
import { forgotPasswordSchema } from "@/types/auth";
import type { ForgotPasswordFormData } from "@/types/auth";
import { Loader2, ArrowLeft } from "lucide-react";

export function ForgotPasswordPage() {
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setErrorMsg("");
        setSuccess(false);
        try {
            const response = await AuthService.forgotPassword(data);
            if (response.succeeded) {
                setSuccess(true);
            } else {
                setErrorMsg(response.message || "Yêu cầu khôi phục mật khẩu thất bại");
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

    if (success) {
        return (
            <div className="grid gap-6 text-center">
                <div className="mb-4 text-green-500">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">Kiểm tra Email của bạn</h1>
                <p className="text-sm text-muted-foreground">
                    Chúng tôi đã gửi hướng dẫn lấy lại mật khẩu vào địa chỉ email của bạn.
                    Vui lòng kiểm tra hộp thư đến (và mục thư rác).
                </p>
                <Link to="/login" className="mt-4">
                    <Button variant="outline" className="w-full">
                        Quay lại trang Đăng nhập
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">Quên Mật Khẩu</h1>
                <p className="text-sm text-muted-foreground">
                    Nhập địa chỉ email của bạn tự động nhận đường kết khôi phục.
                </p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none" htmlFor="email">
                            Email
                        </label>
                        <Input
                            id="email"
                            placeholder="nhập@email.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isSubmitting}
                            {...register("email")}
                        />
                        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
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
                                Đang gửi...
                            </>
                        ) : "Gửi yêu cầu"}
                    </Button>
                </div>
            </form>

            <p className="px-8 text-center text-sm text-muted-foreground">
                <Link to="/login" className="hover:text-primary underline underline-offset-4 flex justify-center items-center">
                    <ArrowLeft className="mr-1 h-3 w-3" /> Quay lại đăng nhập
                </Link>
            </p>
        </div >
    );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/middlewares/useAuthStore";
import { loginSchema } from "@/types/auth";
import type { LoginFormData } from "@/types/auth";
import { Loader2 } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMsg("");
    try {
      const response = await AuthService.login(data);
      if (response.succeeded && response.data) {
        setAuth(response.data.user, response.data.token);
        navigate("/");
      } else {
        setErrorMsg(response.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as any;
        if (err.response?.data?.message) {
          setErrorMsg(err.response.data.message);
        } else {
          setErrorMsg("Đã có lỗi xảy ra. Vui lòng thử lại.");
        }
      } else {
        setErrorMsg("Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Chào mừng trở lại</h1>
        <p className="text-sm text-muted-foreground">
          Nhập tài khoản của bạn để tiếp tục
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none" htmlFor="username">
              Tên đăng nhập
            </label>
            <Input
              id="username"
              placeholder="Nhập tên đăng nhập"
              autoCapitalize="none"
              autoCorrect="off"
              disabled={isSubmitting}
              {...register("username")}
            />
            {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none" htmlFor="password">
                Mật khẩu
              </label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Nhập mật khẩu"
              disabled={isSubmitting}
              {...register("password")}
            />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
              <p className="text-sm text-red-500 text-center">{errorMsg}</p>
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : "Đăng nhập"}
          </Button>
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Hoặc</span>
        </div>
      </div>

      {/* TODO: Google Login Implementation */}
      <Button variant="outline" type="button" disabled={isSubmitting} className="w-full">
        {/* Google Icon... */}
        Đăng nhập với Google
      </Button>

      <p className="px-8 text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link to="/register" className="hover:text-primary underline underline-offset-4 text-foreground">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}

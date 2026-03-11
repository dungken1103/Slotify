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
import { useGoogleLogin } from "@react-oauth/google";

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

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      setErrorMsg("");
      try {
        const response = await AuthService.googleLogin(codeResponse.access_token);
        if (response.succeeded && response.data) {
          setAuth(response.data.user, response.data.token);
          navigate("/");
        } else {
          setErrorMsg(response.message || "Đăng nhập Google thất bại");
        }
      } catch (error) {
        setErrorMsg("Lỗi xác thực Google. Vui lòng thử lại sau.");
        console.error("Google Login Error:", error);
      }
    },
    onError: (error) => {
      setErrorMsg("Đăng nhập Google bị hủy hoặc thất bại.");
      console.error("Google Login Failed:", error);
    }
  });

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

      {/* Google Login Implementation */}
      <Button 
        variant="outline" 
        type="button" 
        disabled={isSubmitting} 
        className="w-full relative bg-white text-gray-700 border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2 font-medium"
        onClick={() => loginWithGoogle()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          <path fill="none" d="M0 0h48v48H0z"/>
        </svg>
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

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { AuthService } from "@/services/auth.service";
import { registerSchema } from "@/types/auth";
import type { RegisterFormData } from "@/types/auth";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";

export function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting }, trigger } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange"
  });

  const handleNextStep = async () => {
    const isStepValid = await trigger(["username", "password", "confirmPassword"]);
    if (isStepValid) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setErrorMsg("");
    try {
      const response = await AuthService.register(data);
      if (response.succeeded) {
        // Automatically route to login on success
        navigate("/login?registered=true");
      } else {
        setErrorMsg(response.message || "Đăng ký thất bại");
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
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

  return (
    <div className="grid gap-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Tạo tài khoản mới</h1>
        <p className="text-sm text-muted-foreground">
          {step === 1 ? "Bước 1: Thông tin đăng nhập" : "Bước 2: Thông tin cá nhân"}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-300"
          style={{ width: step === 1 ? "50%" : "100%" }}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">

          {/* STEP 1: Credentials */}
          <div className={step === 1 ? "block space-y-4" : "hidden"}>
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none" htmlFor="username">
                Tên đăng nhập
              </label>
              <Input
                id="username"
                placeholder="Nhập tên đăng nhập"
                autoCapitalize="none"
                {...register("username")}
              />
              {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none" htmlFor="password">
                Mật khẩu
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                {...register("password")}
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none" htmlFor="confirmPassword">
                Xác nhận mật khẩu
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="button" onClick={handleNextStep} className="w-full mt-4 bg-primary text-primary-foreground">
              Tiếp tục <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* STEP 2: Personal Info */}
          <div className={step === 2 ? "block space-y-4" : "hidden"}>
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none" htmlFor="fullName">
                Họ và tên
              </label>
              <Input
                id="fullName"
                placeholder="Nguyễn Văn A"
                {...register("fullName")}
              />
              {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none" htmlFor="phoneNumber">
                Số điện thoại
              </label>
              <Input
                id="phoneNumber"
                placeholder="0912345678"
                {...register("phoneNumber")}
              />
              {errors.phoneNumber && <p className="text-xs text-red-500">{errors.phoneNumber.message}</p>}
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                <p className="text-sm text-red-500 text-center">{errorMsg}</p>
              </div>
            )}

            <div className="flex gap-4 mt-4">
              <Button type="button" variant="outline" onClick={handlePrevStep} className="w-1/3">
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-2/3 bg-primary text-primary-foreground">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : "Đăng ký tài khoản"}
              </Button>
            </div>
          </div>

        </div>
      </form>

      {step === 1 && (
        <>
          <div className="relative mt-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Hoặc</span>
            </div>
          </div>
          <Button variant="outline" type="button" className="w-full">
            Đăng ký bằng Google
          </Button>
        </>
      )}

      <p className="px-8 text-center text-sm text-muted-foreground mt-2">
        Đã có tài khoản?{" "}
        <Link to="/login" className="hover:text-primary underline underline-offset-4 text-foreground">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}

import { z } from "zod";

export interface User {
    id: string;
    username: string;
    email: string;
    phoneNumber: string;
    fullName: string;
    isActive: boolean;
    role: string;
    avatarUrl?: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

// Zod schemas for form validation
export const loginSchema = z.object({
    username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
    password: z.string().min(1, "Vui lòng nhập mật khẩu")
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    username: z.string().min(4, "Tên đăng nhập phải có ít nhất 4 ký tự"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    phoneNumber: z.string().regex(/^[0-9]{10}$/, "Số điện thoại phải gồm 10 chữ số"),
    fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const changePasswordSchema = z.object({
    oldPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Mật khẩu mới không khớp",
    path: ["confirmNewPassword"],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const forgotPasswordSchema = z.object({
    email: z.string().email("Email không hợp lệ")
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
    newPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const updateProfileSchema = z.object({
    fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
    phoneNumber: z.string().regex(/^[0-9]{10}$/, "Số điện thoại phải gồm 10 chữ số"),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

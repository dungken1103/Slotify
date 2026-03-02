// Generic API Response aligned with Backend Wrapper
export interface ApiResponse<T = any> {
    succeeded: boolean;
    message: string;
    data?: T;
    statusCode: number;
}

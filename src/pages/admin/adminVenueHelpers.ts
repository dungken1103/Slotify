export const adminSelectClassName =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export const getApiErrorMessage = (error: unknown, fallback: string) => {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
    return typeof message === "string" && message.trim() ? message : fallback;
};

export const fieldErrorClassName = "border-destructive focus-visible:ring-destructive";

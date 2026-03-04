import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface LoadingSpinnerProps {
    className?: string;
    size?: number;
}

export function LoadingSpinner({ className, size = 24 }: LoadingSpinnerProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-8", className)}>
            <Loader2
                className="animate-spin text-primary"
                size={size}
            />
            <span className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
                Loading...
            </span>
        </div>
    );
}

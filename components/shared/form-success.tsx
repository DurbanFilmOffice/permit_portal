import { CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface FormSuccessProps {
  message: string | undefined;
  className?: string;
}

export function FormSuccess({ message, className }: FormSuccessProps) {
  if (!message) return null;

  return (
    <Alert className={cn("border-green-500/50 bg-green-500/10", className)}>
      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      <AlertDescription className="text-base text-green-600 dark:text-green-400">
        {message}
      </AlertDescription>
    </Alert>
  );
}

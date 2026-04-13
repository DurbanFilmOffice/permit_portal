import Link from "next/link";
import { FileX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ApplicationNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <FileX className="h-12 w-12 text-muted-foreground mx-auto" />

      <h1 className="text-xl font-semibold mt-4">Application not found</h1>

      <p className="text-base text-muted-foreground mt-2">
        This application does not exist or you do not have permission to view
        it.
      </p>

      <Button variant="outline" asChild className="mt-6">
        <Link href="/applications">Back to My Applications</Link>
      </Button>
    </div>
  );
}

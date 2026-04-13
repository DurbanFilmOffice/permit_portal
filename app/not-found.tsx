import Link from "next/link";
import { FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md text-center space-y-6">
        <FileSearch className="h-16 w-16 text-muted-foreground mx-auto" />

        <h1 className="text-2xl font-semibold">Page not found</h1>

        <p className="text-base text-muted-foreground">
          The page you are looking for does not exist or you do not have
          permission to view it.
        </p>

        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/applications">My Applications</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

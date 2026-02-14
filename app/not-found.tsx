import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-sm p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xl font-bold">
          K
        </div>
        <h1 className="text-xl font-bold mb-1">Page Not Found</h1>
        <p className="text-sm text-muted-foreground mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/">
          <Button className="w-full" size="lg">
            Back to Home
          </Button>
        </Link>
      </Card>
    </div>
  );
}

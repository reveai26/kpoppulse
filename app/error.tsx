"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-sm p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive text-destructive-foreground text-xl font-bold">
          !
        </div>
        <h1 className="text-xl font-bold mb-1">Something went wrong</h1>
        <p className="text-sm text-muted-foreground mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <Button onClick={reset} className="w-full" size="lg">
          Try Again
        </Button>
      </Card>
    </div>
  );
}

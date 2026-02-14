import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-[10px] font-bold">
            K
          </div>
          <span className="text-sm font-semibold">
            {SITE_NAME}
          </span>
          <span className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()}
          </span>
        </div>
        <nav className="flex gap-4 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link href="/trending" className="hover:text-foreground transition-colors">Trending</Link>
          <Link href="/groups" className="hover:text-foreground transition-colors">Groups</Link>
          <Link href="/idols" className="hover:text-foreground transition-colors">Idols</Link>
        </nav>
      </div>
    </footer>
  );
};

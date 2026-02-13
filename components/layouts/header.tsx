"use client";

import Link from "next/link";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";

export const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            K
          </div>
          <span className="text-xl font-bold">
            Kpop<span className="text-primary">Pulse</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Feed
          </Link>
          <Link href="/rankings" className="text-sm font-medium hover:text-primary transition-colors">
            Rankings
          </Link>
          <Link href="/groups" className="text-sm font-medium hover:text-primary transition-colors">
            Groups
          </Link>
          <Link href="/idols" className="text-sm font-medium hover:text-primary transition-colors">
            Idols
          </Link>
        </nav>

        {/* Search & Auth */}
        <div className="flex items-center gap-2">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <Input
                autoFocus
                placeholder="Search idols, groups, news..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-48 md:w-64"
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => setSearchOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
              <Search className="h-4 w-4" />
            </Button>
          )}

          <Link href="/login" className="hidden md:block">
            <Button size="sm">Sign In</Button>
          </Link>

          {/* Mobile menu */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <nav className="border-t px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            <Link href="/" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>
              Feed
            </Link>
            <Link href="/rankings" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>
              Rankings
            </Link>
            <Link href="/groups" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>
              Groups
            </Link>
            <Link href="/idols" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>
              Idols
            </Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full" size="sm">Sign In</Button>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};

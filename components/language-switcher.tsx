"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useEffect, useState } from "react";

const LANGUAGES = [
  { code: "en", label: "EN", name: "English" },
  { code: "ko", label: "KO", name: "한국어" },
  { code: "ja", label: "JA", name: "日本語" },
  { code: "zh", label: "ZH", name: "中文" },
  { code: "es", label: "ES", name: "Español" },
];

export const LanguageSwitcher = () => {
  const router = useRouter();
  const [current, setCurrent] = useState("en");

  useEffect(() => {
    const match = document.cookie.match(/preferred_language=(\w+)/);
    if (match) setCurrent(match[1]);
  }, []);

  const handleChange = (code: string) => {
    document.cookie = `preferred_language=${code};path=/;max-age=${365 * 24 * 60 * 60};samesite=lax`;
    setCurrent(code);
    router.refresh();
  };

  const currentLang = LANGUAGES.find((l) => l.code === current);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Language">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            className={`cursor-pointer ${current === lang.code ? "bg-primary/10 text-primary" : ""}`}
          >
            <span className="font-mono text-xs w-6">{lang.label}</span>
            <span className="ml-2">{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

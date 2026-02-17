import { cookies } from "next/headers";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "EN", name: "English" },
  { code: "ko", label: "KO", name: "한국어" },
  { code: "ja", label: "JA", name: "日本語" },
  { code: "zh", label: "ZH", name: "中文" },
  { code: "es", label: "ES", name: "Español" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export async function getPreferredLanguage(): Promise<LanguageCode> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("preferred_language")?.value;
  if (lang && SUPPORTED_LANGUAGES.some((l) => l.code === lang)) {
    return lang as LanguageCode;
  }
  return "en";
}

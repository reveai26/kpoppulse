import { Polar } from "@polar-sh/sdk";

// Lazy init — Cloudflare Workers에서 모듈 레벨 process.env 접근 불가
let _polar: Polar | null = null;

export function getPolar() {
  if (!_polar) {
    _polar = new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN!,
      ...(process.env.POLAR_SERVER === "sandbox" && { server: "sandbox" as const }),
    });
  }
  return _polar;
}

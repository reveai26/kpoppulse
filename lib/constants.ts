export const SITE_NAME = "KpopPulse";
export const SITE_DESCRIPTION = "Real-time AI-translated K-pop news, personalized by your favorite idols. Follow BTS, BLACKPINK, aespa, NewJeans and 90+ idols.";
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://kpoppulse.app";
export const SITE_KEYWORDS = ["K-pop news", "K-pop idols", "BTS", "BLACKPINK", "aespa", "NewJeans", "Korean pop", "K-pop translation", "K-pop groups", "idol news"];

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    dailyReads: 20,
    maxFollows: 3,
    features: ["Browse news feed", "Follow up to 3 idols", "Basic search"],
  },
  pro: {
    name: "Pro",
    price: 4.99,
    dailyReads: 200,
    maxFollows: 20,
    features: [
      "200 articles/day",
      "Follow up to 20 idols",
      "AI Daily Digest",
      "Breaking news alerts",
      "Bookmarks",
      "No ads",
    ],
  },
  premium: {
    name: "Premium",
    price: 9.99,
    dailyReads: -1,
    maxFollows: -1,
    features: [
      "Unlimited articles",
      "Unlimited follows",
      "Multi-language translations",
      "Sentiment analysis",
      "Comeback tracker",
      "Priority support",
      "No ads",
    ],
  },
} as const;

export const SUPER_ADMIN_EMAILS = ["aireve26@gmail.com"];

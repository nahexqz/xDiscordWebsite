import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amountInSatang: number): string {
  return `฿${(amountInSatang / 100).toFixed(0)}`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getDiscordAvatarUrl(discordId: string, avatar: string | null | undefined, size = 128): string {
  if (!avatar) {
    const defaultIndex = Number(BigInt(discordId) % BigInt(5));
    return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
  }
  return `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.webp?size=${size}`;
}

export function snowflakeToDate(snowflake: string): Date {
  const timestamp = Number((BigInt(snowflake) >> BigInt(22)) + BigInt(1420070400000));
  return new Date(timestamp);
}

export function rateLimit(interval: number, maxRequests: number) {
  const requests = new Map<string, number[]>();
  return (key: string): boolean => {
    const now = Date.now();
    const windowStart = now - interval;
    const reqs = (requests.get(key) || []).filter((t) => t > windowStart);
    if (reqs.length >= maxRequests) return false;
    reqs.push(now);
    requests.set(key, reqs);
    return true;
  };
}

export const apiRateLimiter = rateLimit(60 * 1000, 30); // 30 req/min

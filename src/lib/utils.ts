import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

export function getYouTubeEmbedUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = regExp.exec(url);
  const videoId = match?.[2]?.length === 11 ? match[2] : null;
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&modestbranding=1&vq=hd1080&hd=1`;
}

export function splitCommaList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map(s => s.trim()).filter(Boolean);
  if (typeof value !== "string") return [];
  return value.split(",").map(s => s.trim()).filter(Boolean);
}

export function parseDate(value: unknown): Date | null {
  if (!value) return null;
  if (typeof value !== "string" && typeof value !== "number" && !(value instanceof Date)) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDateVi(value: unknown): string {
  const d = parseDate(value);
  if (!d) return "";
  return d.toLocaleDateString("en-GB");
}

export function isUpcomingRelease(releaseDate: unknown, now: Date = new Date()): boolean {
  const d = parseDate(releaseDate);
  if (!d) return false;
  // Compare by day to avoid timezone edge cases
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return d.getTime() > startOfToday.getTime();
}

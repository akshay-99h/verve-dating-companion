import type { AudienceCategory } from "../types";

export const ROTATION_INTERVAL_OPTIONS = [
  5_000,
  10_000,
  15_000,
  30_000,
  60_000,
] as const;

export const DEFAULT_ROTATION_INTERVAL = 10_000;

export const AUDIENCE_OPTIONS = [
  "all",
  "gym",
  "software",
  "creative",
  "traveler",
  "foodie",
  "bookish",
] as const satisfies readonly AudienceCategory[];

const AUDIENCE_LABELS: Record<AudienceCategory, string> = {
  all: "All",
  gym: "Gym",
  software: "Software",
  creative: "Creative",
  traveler: "Traveler",
  foodie: "Foodie",
  bookish: "Bookish",
};

export function clampIndex(index: number, size: number): number {
  if (size <= 0) {
    return 0;
  }

  return ((index % size) + size) % size;
}

export function getNextIndex(currentIndex: number, size: number): number {
  return clampIndex(currentIndex + 1, size);
}

export function getPreviousIndex(currentIndex: number, size: number): number {
  return clampIndex(currentIndex - 1, size);
}

export function getRandomIndex(size: number, currentIndex: number): number {
  if (size <= 1) {
    return 0;
  }

  let nextIndex = currentIndex;

  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * size);
  }

  return nextIndex;
}

export function sanitizeInterval(value: number): number {
  return ROTATION_INTERVAL_OPTIONS.includes(
    value as (typeof ROTATION_INTERVAL_OPTIONS)[number],
  )
    ? value
    : DEFAULT_ROTATION_INTERVAL;
}

export function formatIntervalLabel(value: number): string {
  return `${value / 1_000}s`;
}

export function formatAudienceLabel(value: AudienceCategory): string {
  return AUDIENCE_LABELS[value];
}

export function sanitizeAudience(value: string): AudienceCategory {
  return AUDIENCE_OPTIONS.includes(value as AudienceCategory)
    ? (value as AudienceCategory)
    : "all";
}

import AsyncStorage from "@react-native-async-storage/async-storage";

import type { RotatorState } from "../types";
import {
  DEFAULT_ROTATION_INTERVAL,
  sanitizeAudience,
  sanitizeInterval,
} from "./rotator";

const STORAGE_KEY = "prompt-rotator:settings:v1";

export const DEFAULT_ROTATOR_STATE: RotatorState = {
  currentIndex: 0,
  autoRotate: false,
  intervalMs: DEFAULT_ROTATION_INTERVAL,
  selectedAudience: "all",
};

export async function loadRotatorState(): Promise<RotatorState | null> {
  try {
    const rawValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as Partial<RotatorState>;
    if (
      typeof parsed.currentIndex !== "number" ||
      typeof parsed.autoRotate !== "boolean" ||
      typeof parsed.intervalMs !== "number" ||
      typeof parsed.selectedAudience !== "string"
    ) {
      return null;
    }

    return {
      currentIndex: Math.max(0, Math.floor(parsed.currentIndex)),
      autoRotate: parsed.autoRotate,
      intervalMs: sanitizeInterval(parsed.intervalMs),
      selectedAudience: sanitizeAudience(parsed.selectedAudience),
    };
  } catch {
    return null;
  }
}

export async function saveRotatorState(state: RotatorState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Persistence failure should not block prompt browsing.
  }
}

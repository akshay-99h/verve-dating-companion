import AsyncStorage from "@react-native-async-storage/async-storage";

import type { RotatorState, UserSession } from "../types";
import { sanitizeAudience } from "./rotator";

const STORAGE_KEY = "prompt-rotator:settings:v1";
const SAVED_PROMPTS_KEY = "prompt-rotator:saved-prompts:v1";
const SESSION_KEY = "prompt-rotator:session:v1";

export const DEFAULT_ROTATOR_STATE: RotatorState = {
  currentIndex: 0,
  selectedAudience: "all",
};

export async function loadRotatorState(): Promise<RotatorState | null> {
  try {
    const rawValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as Partial<RotatorState>;
    if (typeof parsed.currentIndex !== "number" || typeof parsed.selectedAudience !== "string") {
      return null;
    }

    return {
      currentIndex: Math.max(0, Math.floor(parsed.currentIndex)),
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

export async function loadSavedPromptIds(): Promise<string[]> {
  try {
    const rawValue = await AsyncStorage.getItem(SAVED_PROMPTS_KEY);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

export async function saveSavedPromptIds(promptIds: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(SAVED_PROMPTS_KEY, JSON.stringify(promptIds));
  } catch {
    // Persistence failure should not block prompt browsing.
  }
}

export async function loadUserSession(): Promise<UserSession | null> {
  try {
    const rawValue = await AsyncStorage.getItem(SESSION_KEY);
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as Partial<UserSession>;
    if (typeof parsed.name !== "string" || typeof parsed.email !== "string") {
      return null;
    }

    return {
      name: parsed.name,
      email: parsed.email,
    };
  } catch {
    return null;
  }
}

export async function saveUserSession(session: UserSession): Promise<void> {
  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Persistence failure should not block sign-in.
  }
}

export async function clearUserSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch {
    // Persistence failure should not block sign-out.
  }
}

export type PromptCategory = "funny" | "flirty" | "deep" | "casual";

export type AudienceCategory =
  | "all"
  | "gym"
  | "software"
  | "creative"
  | "traveler"
  | "foodie"
  | "bookish";

export type Prompt = {
  id: string;
  text: string;
  category?: PromptCategory;
  audiences?: Exclude<AudienceCategory, "all">[];
};

export type RotatorState = {
  currentIndex: number;
  autoRotate: boolean;
  intervalMs: number;
  selectedAudience: AudienceCategory;
};

export type AppTheme = {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceStrong: string;
  primary: string;
  primaryPressed: string;
  secondary: string;
  secondaryPressed: string;
  actionCopy: string;
  actionCopyPressed: string;
  actionNext: string;
  actionNextPressed: string;
  actionShuffle: string;
  actionShufflePressed: string;
  text: string;
  textMuted: string;
  border: string;
  accentSoft: string;
  shadow: string;
  toastBackground: string;
  toastText: string;
  switchTrack: string;
};

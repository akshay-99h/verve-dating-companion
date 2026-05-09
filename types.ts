export type PromptCategory =
  | "funny"
  | "flirty"
  | "borderline"
  | "deep"
  | "heartwarming"
  | "casual"
  | "sexual";

export type OpenerCategory =
  | "all"
  | "playful"
  | "direct"
  | "observational"
  | "teasing"
  | "confident"
  | "soft"
  | "witty"
  | "late-night";

export type SmallTalkCategory =
  | "all"
  | "everyday"
  | "food"
  | "travel"
  | "entertainment"
  | "work"
  | "childhood"
  | "opinions"
  | "habits"
  | "goals"
  | "random";

export type AudienceCategory =
  | "all"
  | "gym"
  | "software"
  | "creative"
  | "traveler"
  | "foodie"
  | "pretty"
  | "bookish"
  | "goth"
  | "alt"
  | "nightlife"
  | "anime"
  | "movies";

export type Prompt = {
  id: string;
  text: string;
  category?: PromptCategory;
  audiences?: Exclude<AudienceCategory, "all">[];
};

export type Opener = {
  id: string;
  text: string;
  category: Exclude<OpenerCategory, "all">;
};

export type SmallTalkTopic = {
  id: string;
  text: string;
  category: Exclude<SmallTalkCategory, "all">;
};

export type RotatorState = {
  currentIndex: number;
  selectedAudience: AudienceCategory;
};

export type UserSession = {
  name: string;
  email: string;
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

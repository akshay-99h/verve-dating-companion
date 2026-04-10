import type { ColorSchemeName } from "react-native";

import type { AppTheme } from "../types";

const lightTheme: AppTheme = {
  background: "#FFF5F1",
  backgroundSecondary: "#FBE4DE",
  surface: "#FFF9F7",
  surfaceStrong: "#FFE5DC",
  primary: "#D95762",
  primaryPressed: "#C44752",
  secondary: "#F5D6CF",
  secondaryPressed: "#EDC6BE",
  text: "#241517",
  textMuted: "#86595E",
  border: "#F1C3BA",
  accentSoft: "#F3B2A4",
  shadow: "rgba(92, 36, 43, 0.16)",
  toastBackground: "#241517",
  toastText: "#FFF5F1",
  switchTrack: "#E9C0B8",
};

const darkTheme: AppTheme = {
  background: "#140C0E",
  backgroundSecondary: "#251419",
  surface: "#201114",
  surfaceStrong: "#32181E",
  primary: "#F16F77",
  primaryPressed: "#FF858B",
  secondary: "#392128",
  secondaryPressed: "#4A2A32",
  text: "#FFF2EE",
  textMuted: "#D6B7B2",
  border: "#5B353D",
  accentSoft: "#8C414D",
  shadow: "rgba(0, 0, 0, 0.32)",
  toastBackground: "#FFF2EE",
  toastText: "#140C0E",
  switchTrack: "#64343C",
};

export function getTheme(colorScheme: ColorSchemeName): AppTheme {
  return colorScheme === "dark" ? darkTheme : lightTheme;
}

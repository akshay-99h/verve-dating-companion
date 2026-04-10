import type { ColorSchemeName } from "react-native";

import type { AppTheme } from "../types";

const lightTheme: AppTheme = {
  background: "#FFFFFF",
  backgroundSecondary: "#F6F6F6",
  surface: "#FFFFFF",
  surfaceStrong: "#F3F3F3",
  primary: "#111111",
  primaryPressed: "#000000",
  secondary: "#F5F5F5",
  secondaryPressed: "#EAEAEA",
  actionCopy: "#5B8CFF",
  actionCopyPressed: "#4B7AEB",
  actionNext: "#111111",
  actionNextPressed: "#000000",
  actionShuffle: "#FFB703",
  actionShufflePressed: "#E7A300",
  text: "#111111",
  textMuted: "#666666",
  border: "#E6E6E6",
  accentSoft: "#F3F3F3",
  shadow: "rgba(0, 0, 0, 0)",
  toastBackground: "#111111",
  toastText: "#FFFFFF",
  switchTrack: "#D9D9D9",
};

const darkTheme: AppTheme = {
  background: "#000000",
  backgroundSecondary: "#0E0E0E",
  surface: "#000000",
  surfaceStrong: "#141414",
  primary: "#FFFFFF",
  primaryPressed: "#F2F2F2",
  secondary: "#111111",
  secondaryPressed: "#1A1A1A",
  actionCopy: "#5B8CFF",
  actionCopyPressed: "#4B7AEB",
  actionNext: "#FFFFFF",
  actionNextPressed: "#EDEDED",
  actionShuffle: "#FFB703",
  actionShufflePressed: "#E7A300",
  text: "#FFFFFF",
  textMuted: "#A1A1A1",
  border: "#242424",
  accentSoft: "#111111",
  shadow: "rgba(0, 0, 0, 0)",
  toastBackground: "#FFFFFF",
  toastText: "#000000",
  switchTrack: "#2A2A2A",
};

export function getTheme(colorScheme: ColorSchemeName): AppTheme {
  return colorScheme === "dark" ? darkTheme : lightTheme;
}

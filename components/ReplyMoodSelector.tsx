import { StyleSheet, Text, View } from "react-native";

import { MotionPressable } from "./MotionPressable";
import type { AppTheme } from "../types";

export type ReplyMood =
  | "all"
  | "flirty"
  | "borderline"
  | "naughty"
  | "bold"
  | "playful"
  | "teasing"
  | "casual"
  | "thoughtful";

const REPLY_MOOD_OPTIONS: readonly ReplyMood[] = [
  "all",
  "flirty",
  "borderline",
  "naughty",
  "bold",
  "playful",
  "teasing",
  "casual",
  "thoughtful",
];

const REPLY_MOOD_LABELS: Record<ReplyMood, string> = {
  all: "All",
  flirty: "Flirty",
  borderline: "Borderline",
  naughty: "Naughty",
  bold: "Bold",
  playful: "Playful",
  teasing: "Teasing",
  casual: "Casual",
  thoughtful: "Thoughtful",
};

type ReplyMoodSelectorProps = {
  currentMood?: Exclude<ReplyMood, "all"> | null;
  onSelect: (value: ReplyMood) => void;
  selectedValue: ReplyMood;
  theme: AppTheme;
};

export function ReplyMoodSelector({
  currentMood,
  onSelect,
  selectedValue,
  theme,
}: ReplyMoodSelectorProps) {
  return (
    <View style={styles.container}>
      {REPLY_MOOD_OPTIONS.map((value) => {
        const isSelected = value === selectedValue;
        const isCurrentMood = value !== "all" && value === currentMood;

        return (
          <MotionPressable
            key={value}
            accessibilityRole="button"
            onPress={() => onSelect(value)}
            scaleTo={0.98}
            style={({ pressed }) => [
              styles.option,
              {
                backgroundColor: isSelected
                  ? theme.primary
                  : pressed
                    ? theme.secondaryPressed
                    : theme.secondary,
                borderColor: isSelected || isCurrentMood ? theme.primary : theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.optionLabel,
                {
                  color: isSelected ? theme.background : theme.text,
                },
              ]}
            >
              {REPLY_MOOD_LABELS[value]}
            </Text>
          </MotionPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  option: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
});

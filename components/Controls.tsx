import { StyleSheet, Text, View } from "react-native";

import { MotionPressable } from "./MotionPressable";
import type { AppTheme } from "../types";

type ControlsProps = {
  canChangePrompt: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onShuffle: () => void;
  theme: AppTheme;
};

type ActionButtonProps = {
  accent?: "next" | "shuffle" | "neutral";
  disabled?: boolean;
  isPrimary?: boolean;
  label: string;
  onPress: () => void;
  theme: AppTheme;
};

function ActionButton({
  accent = "neutral",
  disabled = false,
  isPrimary = false,
  label,
  onPress,
  theme,
}: ActionButtonProps) {
  const backgroundByAccent = {
    next: [theme.actionNext, theme.actionNextPressed],
    shuffle: [theme.actionShuffle, theme.actionShufflePressed],
    neutral: [theme.secondary, theme.secondaryPressed],
  } as const;
  const [defaultColor, pressedColor] = backgroundByAccent[accent];
  const labelColor =
    accent === "next" ? theme.background : accent === "shuffle" ? "#111111" : theme.text;

  return (
    <MotionPressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      scaleTo={0.985}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        {
          backgroundColor: pressed ? pressedColor : defaultColor,
          borderColor: accent === "next" ? theme.primary : "transparent",
          opacity: disabled ? 0.45 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.buttonLabel,
          {
            color: labelColor,
          },
        ]}
      >
        {label}
      </Text>
    </MotionPressable>
  );
}

export function Controls({
  canChangePrompt,
  onNext,
  onPrevious,
  onShuffle,
  theme,
}: ControlsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.flexItem}>
          <ActionButton
            accent="neutral"
            label="Previous"
            onPress={onPrevious}
            disabled={!canChangePrompt}
            theme={theme}
          />
        </View>
        <View style={styles.shuffleWrap}>
          <ActionButton
            accent="shuffle"
            label="Shuffle"
            onPress={onShuffle}
            disabled={!canChangePrompt}
            theme={theme}
          />
        </View>
        <View style={styles.flexItem}>
          <ActionButton
            accent="next"
            label="Next"
            onPress={onNext}
            disabled={!canChangePrompt}
            theme={theme}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flexItem: {
    flex: 1,
  },
  shuffleWrap: {
    minWidth: 106,
  },
  button: {
    minHeight: 56,
    borderWidth: 1,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  primaryButton: {
    width: "100%",
  },
  secondaryButton: {
    width: "100%",
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});

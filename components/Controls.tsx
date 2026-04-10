import { Pressable, StyleSheet, Text, View } from "react-native";

import type { AppTheme } from "../types";

type ControlsProps = {
  canChangePrompt: boolean;
  canCopy: boolean;
  onCopy: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onShuffle: () => void;
  theme: AppTheme;
};

type ActionButtonProps = {
  disabled?: boolean;
  isPrimary?: boolean;
  label: string;
  onPress: () => void;
  theme: AppTheme;
};

function ActionButton({
  disabled = false,
  isPrimary = false,
  label,
  onPress,
  theme,
}: ActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        {
          backgroundColor: isPrimary
            ? pressed
              ? theme.primaryPressed
              : theme.primary
            : pressed
              ? theme.secondaryPressed
              : theme.secondary,
          borderColor: isPrimary ? theme.primary : theme.border,
          opacity: disabled ? 0.45 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.buttonLabel,
          {
            color: isPrimary ? "#FFF8F5" : theme.text,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Controls({
  canChangePrompt,
  canCopy,
  onCopy,
  onNext,
  onPrevious,
  onShuffle,
  theme,
}: ControlsProps) {
  return (
    <View style={styles.container}>
      <ActionButton
        isPrimary
        label="Copy"
        onPress={onCopy}
        disabled={!canCopy}
        theme={theme}
      />

      <View style={styles.row}>
        <View style={styles.flexItem}>
          <ActionButton
            label="Previous"
            onPress={onPrevious}
            disabled={!canChangePrompt}
            theme={theme}
          />
        </View>
        <View style={styles.shuffleWrap}>
          <ActionButton
            label="Shuffle"
            onPress={onShuffle}
            disabled={!canChangePrompt}
            theme={theme}
          />
        </View>
        <View style={styles.flexItem}>
          <ActionButton
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
  container: {
    gap: 12,
  },
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

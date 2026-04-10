import { StyleSheet, Text, View } from "react-native";

import { MotionPressable } from "./MotionPressable";
import type { AppTheme } from "../types";
import {
  formatIntervalLabel,
  ROTATION_INTERVAL_OPTIONS,
} from "../utils/rotator";

type IntervalSelectorProps = {
  onSelect: (value: number) => void;
  selectedValue: number;
  theme: AppTheme;
};

export function IntervalSelector({
  onSelect,
  selectedValue,
  theme,
}: IntervalSelectorProps) {
  return (
    <View style={styles.container}>
      {ROTATION_INTERVAL_OPTIONS.map((value) => {
        const isSelected = value === selectedValue;

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
                borderColor: isSelected ? theme.primary : theme.border,
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
              {formatIntervalLabel(value)}
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
    minWidth: 72,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
});

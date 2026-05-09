import { StyleSheet, Text, View } from "react-native";

import { MotionPressable } from "./MotionPressable";
import type { AppTheme, AudienceCategory } from "../types";
import { AUDIENCE_OPTIONS, formatAudienceLabel } from "../utils/rotator";

type AudienceSelectorProps = {
  onSelect: (value: AudienceCategory) => void;
  selectedValue: AudienceCategory;
  theme: AppTheme;
};

export function AudienceSelector({
  onSelect,
  selectedValue,
  theme,
}: AudienceSelectorProps) {
  return (
    <View style={styles.container}>
      {AUDIENCE_OPTIONS.map((value) => {
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
              {formatAudienceLabel(value)}
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
    gap: 8,
  },
  option: {
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
});

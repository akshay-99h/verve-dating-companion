import { Pressable, StyleSheet, Text, View } from "react-native";

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
          <Pressable
            key={value}
            accessibilityRole="button"
            onPress={() => onSelect(value)}
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
                  color: isSelected ? "#FFF8F5" : theme.text,
                },
              ]}
            >
              {formatAudienceLabel(value)}
            </Text>
          </Pressable>
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

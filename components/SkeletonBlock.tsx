import { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import type { AppTheme } from "../types";

type SkeletonBlockProps = {
  borderRadius?: number;
  height: number;
  style?: StyleProp<ViewStyle>;
  theme: AppTheme;
  width?: number | `${number}%` | "auto";
};

export function SkeletonBlock({
  borderRadius = 12,
  height,
  style,
  theme,
  width = "100%",
}: SkeletonBlockProps) {
  const opacity = useRef(new Animated.Value(0.52)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 680,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.52,
          duration: 680,
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();
    return () => {
      pulse.stop();
    };
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.block,
        style,
        {
          backgroundColor: theme.surfaceStrong,
          borderRadius,
          height,
          opacity,
          width,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  block: {
    overflow: "hidden",
  },
});

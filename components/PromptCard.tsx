import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import type { AppTheme, Prompt } from "../types";

type PromptCardProps = {
  footerAccessory?: ReactNode;
  onAdvance?: () => void;
  onCopy?: () => void;
  prompt: Prompt | null;
  theme: AppTheme;
};

const EMPTY_STATE_MESSAGE =
  "Add prompts in data/prompts.ts to start rotating through them.";

export function PromptCard({
  footerAccessory,
  onAdvance,
  onCopy,
  prompt,
  theme,
}: PromptCardProps) {
  const { width } = useWindowDimensions();
  const [displayedPrompt, setDisplayedPrompt] = useState(prompt);
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const didSwipe = useRef(false);

  useEffect(() => {
    const nextKey = prompt?.id ?? "empty";
    const currentKey = displayedPrompt?.id ?? "empty";

    if (nextKey === currentKey) {
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -10,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDisplayedPrompt(prompt);
      opacity.setValue(0);
      translateY.setValue(12);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [displayedPrompt?.id, opacity, prompt, prompt?.id, translateY]);

  const promptLength = displayedPrompt?.text.length ?? EMPTY_STATE_MESSAGE.length;
  const baseFontSize = Math.max(21, Math.min(27, width * 0.061));
  const lengthScale =
    promptLength > 260
      ? 0.72
      : promptLength > 220
        ? 0.76
        : promptLength > 180
          ? 0.82
          : promptLength > 140
            ? 0.88
            : promptLength > 105
              ? 0.94
              : 1;
  const fontSize = Math.round(baseFontSize * lengthScale);
  const lineHeight = Math.round(fontSize * 1.34);
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Boolean(onAdvance) &&
          Math.abs(gestureState.dx) > 16 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
        onPanResponderGrant: () => {
          didSwipe.current = false;
        },
        onPanResponderMove: (_, gestureState) => {
          if (
            !didSwipe.current &&
            onAdvance &&
            Math.abs(gestureState.dx) > 48 &&
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
          ) {
            didSwipe.current = true;
            onAdvance();
          }
        },
        onPanResponderRelease: () => {
          didSwipe.current = false;
        },
        onPanResponderTerminate: () => {
          didSwipe.current = false;
        },
      }),
    [onAdvance],
  );

  return (
    <View
      style={[
        styles.frame,
        {
          borderColor: theme.border,
        },
      ]}
    >
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.promptWrap,
          {
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <Pressable
          disabled={!displayedPrompt || !onCopy}
          onPress={() => {
            if (!didSwipe.current) {
              onCopy?.();
            }
          }}
        >
          <Text
            style={[
              styles.promptText,
              {
                color: theme.text,
                fontSize,
                lineHeight,
              },
            ]}
          >
            {displayedPrompt?.text ?? EMPTY_STATE_MESSAGE}
          </Text>
        </Pressable>
      </Animated.View>

      <View style={styles.footerRow}>
        <Text style={[styles.note, { color: theme.textMuted }]}>
          Tap to copy or swipe to change the reply.
        </Text>
        {footerAccessory ? <View style={styles.footerAccessory}>{footerAccessory}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 8,
    paddingTop: 0,
    paddingBottom: 2,
    gap: 8,
    justifyContent: "center",
  },
  promptWrap: {
    flexShrink: 1,
    justifyContent: "center",
    paddingTop: 10,
    paddingBottom: 6,
  },
  promptText: {
    textAlign: "left",
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      default: undefined,
    }),
    fontWeight: "600",
  },
  note: {
    flexShrink: 1,
    textAlign: "left",
    fontSize: 11,
    lineHeight: 14,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    paddingBottom: 2,
  },
  footerAccessory: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexShrink: 0,
  },
});

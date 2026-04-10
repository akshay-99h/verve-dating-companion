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

  const fontSize = Math.max(22, Math.min(28, width * 0.065));
  const lineHeight = Math.round(fontSize * 1.42);
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
    width: "100%",
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    gap: 10,
  },
  promptWrap: {
    paddingTop: 18,
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
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  footerAccessory: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexShrink: 0,
  },
});

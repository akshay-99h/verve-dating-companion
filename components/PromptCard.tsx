import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import type { AppTheme, Prompt } from "../types";

type PromptCardProps = {
  prompt: Prompt | null;
  theme: AppTheme;
};

const EMPTY_STATE_MESSAGE =
  "Add prompts in data/prompts.ts to start rotating through them.";

function formatCategory(category?: Prompt["category"]) {
  return category ? category.toUpperCase() : "PROMPT";
}

export function PromptCard({ prompt, theme }: PromptCardProps) {
  const { width } = useWindowDimensions();
  const [displayedPrompt, setDisplayedPrompt] = useState(prompt);
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

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

  return (
    <View
      style={[
        styles.frame,
        {
          borderColor: theme.border,
        },
      ]}
    >
      <View
        style={[
          styles.badge,
          {
            borderColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.badgeText, { color: theme.primary }]}>
          {formatCategory(displayedPrompt?.category)}
        </Text>
      </View>

      <Animated.View
        style={[
          styles.promptWrap,
          {
            opacity,
            transform: [{ translateY }],
          },
        ]}
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
      </Animated.View>

      <Text style={[styles.note, { color: theme.textMuted }]}>
        Tap Copy when you want this on your clipboard.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 0,
    paddingTop: 6,
    paddingBottom: 8,
    justifyContent: "space-between",
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.3,
  },
  promptWrap: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 16,
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
    textAlign: "left",
    fontSize: 13,
    lineHeight: 18,
  },
});

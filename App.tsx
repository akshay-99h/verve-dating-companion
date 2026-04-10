import * as Clipboard from "expo-clipboard";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  useColorScheme,
  View,
} from "react-native";

import { AudienceSelector } from "./components/AudienceSelector";
import { Controls } from "./components/Controls";
import { IntervalSelector } from "./components/IntervalSelector";
import { PromptCard } from "./components/PromptCard";
import { prompts } from "./data/prompts";
import { useRotator } from "./hooks/useRotator";
import { getTheme } from "./utils/theme";

export default function App() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const {
    autoRotate,
    currentIndex,
    currentPrompt,
    intervalMs,
    isAppActive,
    promptCount,
    goToNext,
    goToPrevious,
    setAutoRotate,
    setIntervalMs,
    setSelectedAudience,
    selectedAudience,
    shuffle,
  } = useRotator(prompts);
  const [toast, setToast] = useState({
    message: "",
    version: 0,
  });
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    if (!toast.message) {
      return;
    }

    toastOpacity.stopAnimation();
    toastTranslateY.stopAnimation();
    toastOpacity.setValue(0);
    toastTranslateY.setValue(14);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1500),
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          toValue: 14,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),
    ]).start(({ finished }) => {
      if (finished) {
        setToast((previousToast) => ({
          ...previousToast,
          message: "",
        }));
      }
    });
  }, [toast.message, toast.version, toastOpacity, toastTranslateY]);

  async function handleCopy() {
    if (!currentPrompt) {
      return;
    }

    try {
      await Clipboard.setStringAsync(currentPrompt.text);
      setToast((previousToast) => ({
        message: "Prompt copied",
        version: previousToast.version + 1,
      }));
    } catch {
      setToast((previousToast) => ({
        message: "Clipboard unavailable",
        version: previousToast.version + 1,
      }));
    }
  }

  const promptCounterLabel =
    promptCount === 0
      ? "No prompts loaded"
      : `${String(currentIndex + 1).padStart(2, "0")} / ${String(promptCount).padStart(
          2,
          "0",
        )}`;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />

      <View style={styles.root}>
        <View
          pointerEvents="none"
          style={[
            styles.blobTop,
            {
              backgroundColor: theme.accentSoft,
            },
          ]}
        />
        <View
          pointerEvents="none"
          style={[
            styles.blobBottom,
            {
              backgroundColor: theme.backgroundSecondary,
            },
          ]}
        />

        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: theme.primary }]}>
              Prompt Rotator
            </Text>
            <Text style={[styles.title, { color: theme.text }]}>Prompt</Text>
          </View>
          <Text style={[styles.counter, { color: theme.textMuted }]}>
            {promptCounterLabel}
          </Text>
        </View>

        <View style={styles.promptSection}>
          <PromptCard prompt={currentPrompt} theme={theme} />
        </View>

        <View style={styles.controlsSection}>
          <Controls
            canChangePrompt={promptCount > 1}
            canCopy={Boolean(currentPrompt)}
            onCopy={handleCopy}
            onNext={goToNext}
            onPrevious={goToPrevious}
            onShuffle={shuffle}
            theme={theme}
          />
        </View>

        <View
          style={[
            styles.settings,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              shadowColor: theme.shadow,
            },
          ]}
        >
          <View style={styles.settingsHeader}>
            <View style={styles.settingsCopy}>
              <Text style={[styles.settingsTitle, { color: theme.text }]}>
                Auto Rotate
              </Text>
              <Text style={[styles.settingsBody, { color: theme.textMuted }]}>
                {isAppActive
                  ? "Runs only while the app is open in the foreground."
                  : "Paused until the app returns to the foreground."}
              </Text>
            </View>

            <Switch
              ios_backgroundColor={theme.switchTrack}
              onValueChange={setAutoRotate}
              trackColor={{
                false: theme.switchTrack,
                true: theme.primary,
              }}
              thumbColor={autoRotate ? "#FFF8F5" : "#FFF8F5"}
              value={autoRotate}
              disabled={promptCount < 2}
            />
          </View>

          <View style={styles.intervalBlock}>
            <Text style={[styles.intervalLabel, { color: theme.text }]}>
              Best for
            </Text>
            <AudienceSelector
              onSelect={setSelectedAudience}
              selectedValue={selectedAudience}
              theme={theme}
            />
          </View>

          <View style={styles.intervalBlock}>
            <Text style={[styles.intervalLabel, { color: theme.text }]}>
              Rotate every
            </Text>
            <IntervalSelector
              onSelect={setIntervalMs}
              selectedValue={intervalMs}
              theme={theme}
            />
          </View>

          <View style={styles.captionRow}>
            <Text style={[styles.caption, { color: theme.textMuted }]}>
              Clipboard stays untouched until you tap Copy.
            </Text>
            <Pressable
              onPress={shuffle}
              disabled={promptCount < 2}
              style={({ pressed }) => [
                styles.inlineAction,
                {
                  opacity: promptCount < 2 ? 0.45 : 1,
                  backgroundColor: pressed ? theme.secondaryPressed : theme.secondary,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.inlineActionLabel, { color: theme.text }]}>
                Mix it up
              </Text>
            </Pressable>
          </View>
        </View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.toast,
            {
              opacity: toastOpacity,
              transform: [{ translateY: toastTranslateY }],
              backgroundColor: theme.toastBackground,
            },
          ]}
        >
          <Text style={[styles.toastLabel, { color: theme.toastText }]}>
            {toast.message}
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  root: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 18,
    gap: 18,
    overflow: "hidden",
  },
  blobTop: {
    position: "absolute",
    top: -80,
    right: -50,
    width: 240,
    height: 240,
    borderRadius: 999,
    opacity: 0.22,
  },
  blobBottom: {
    position: "absolute",
    left: -60,
    bottom: 180,
    width: 220,
    height: 220,
    borderRadius: 999,
    opacity: 0.24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    paddingTop: 8,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
    fontFamily: Platform.select({
      ios: "Avenir Next",
      android: "sans-serif-medium",
      default: undefined,
    }),
    fontWeight: "700",
    maxWidth: 220,
  },
  counter: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
  },
  promptSection: {
    flex: 1,
    minHeight: 280,
  },
  controlsSection: {
    gap: 12,
  },
  settings: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 18,
    gap: 16,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
  },
  settingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  settingsCopy: {
    flex: 1,
    gap: 6,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  settingsBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  intervalBlock: {
    gap: 12,
  },
  intervalLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  captionRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  caption: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  inlineAction: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inlineActionLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  toast: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 22,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  toastLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
});

import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";

import { AudienceSelector } from "./components/AudienceSelector";
import { MotionPressable } from "./components/MotionPressable";
import { OpenerCategorySelector } from "./components/OpenerCategorySelector";
import { PromptCard } from "./components/PromptCard";
import { ReplyMoodSelector, type ReplyMood } from "./components/ReplyMoodSelector";
import { SkeletonBlock } from "./components/SkeletonBlock";
import { SmallTalkCategorySelector } from "./components/SmallTalkCategorySelector";
import { openers } from "./data/openers";
import { prompts } from "./data/prompts";
import { smallTalkTopics } from "./data/smallTalkTopics";
import { useRotator } from "./hooks/useRotator";
import type {
  AppTheme,
  Opener,
  OpenerCategory,
  Prompt,
  SmallTalkCategory,
  SmallTalkTopic,
  UserSession,
} from "./types";
import {
  clearUserSession,
  loadSavedPromptIds,
  loadUserSession,
  saveSavedPromptIds,
  saveUserSession,
} from "./utils/storage";
import { getTheme } from "./utils/theme";

type AppTab = "replies" | "openers" | "topics" | "saved" | "profile";

type ToastState = {
  message: string;
  version: number;
};

type CopyableLine = {
  id: string;
  text: string;
};

const TAB_ITEMS: { key: AppTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "replies", label: "Replies", icon: "chatbubble-ellipses-outline" },
  { key: "openers", label: "Openers", icon: "sparkles-outline" },
  { key: "topics", label: "Topics", icon: "chatbubbles-outline" },
  { key: "saved", label: "Saved", icon: "bookmark-outline" },
  { key: "profile", label: "Profile", icon: "person-outline" },
];

function FlatButton({
  label,
  onPress,
  theme,
  tone = "neutral",
}: {
  label: string;
  onPress: () => void;
  theme: AppTheme;
  tone?: "neutral" | "copy" | "dark";
}) {
  const palette =
    tone === "copy"
      ? {
          defaultColor: theme.actionCopy,
          pressedColor: theme.actionCopyPressed,
          textColor: "#FFFFFF",
          borderColor: "transparent",
        }
      : tone === "dark"
        ? {
            defaultColor: theme.actionNext,
            pressedColor: theme.actionNextPressed,
            textColor: theme.background,
            borderColor: "transparent",
          }
        : {
            defaultColor: "transparent",
            pressedColor: theme.secondaryPressed,
            textColor: theme.text,
            borderColor: theme.border,
          };

  return (
    <MotionPressable
      onPress={onPress}
      scaleTo={0.99}
      style={({ pressed }) => [
        styles.flatButton,
        {
          backgroundColor: pressed ? palette.pressedColor : palette.defaultColor,
          borderColor: palette.borderColor,
        },
      ]}
    >
      <Text style={[styles.flatButtonLabel, { color: palette.textColor }]}>{label}</Text>
    </MotionPressable>
  );
}

function SaveTag({
  isSaved,
  onPress,
  theme,
}: {
  isSaved: boolean;
  onPress: () => void;
  theme: AppTheme;
}) {
  return (
    <MotionPressable
      accessibilityRole="button"
      onPress={onPress}
      scaleTo={0.985}
      style={({ pressed }) => [
        styles.saveTag,
        {
          backgroundColor: pressed
            ? "#F7D7E0"
            : isSaved
              ? "#FBE4EA"
              : "transparent",
          borderColor: isSaved ? "#E8A7B8" : theme.border,
        },
      ]}
    >
      <Ionicons
        name={isSaved ? "bookmark" : "bookmark-outline"}
        size={16}
        color={isSaved ? "#C85D7D" : theme.text}
      />
    </MotionPressable>
  );
}

function RefreshTag({
  disabled,
  onPress,
  theme,
}: {
  disabled: boolean;
  onPress: () => void;
  theme: AppTheme;
}) {
  return (
    <MotionPressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      scaleTo={0.985}
      style={({ pressed }) => [
        styles.iconTag,
        {
          backgroundColor: pressed ? theme.secondaryPressed : "transparent",
          borderColor: theme.border,
          opacity: disabled ? 0.45 : 1,
        },
      ]}
    >
      <Ionicons name="refresh-outline" size={16} color={theme.text} />
    </MotionPressable>
  );
}

function PromptRow({
  prompt,
  isSaved,
  onCopy,
  onToggleSave,
  theme,
}: {
  prompt: Pick<Prompt, "id" | "text" | "category"> | Opener | SmallTalkTopic;
  isSaved: boolean;
  onCopy: (prompt: CopyableLine) => void;
  onToggleSave: (promptId: string) => void;
  theme: AppTheme;
}) {
  return (
    <View style={[styles.promptRow, { borderColor: theme.border }]}>
      <View style={styles.promptRowTop}>
        <Text style={[styles.promptRowCategory, { color: theme.textMuted }]}>
          {(prompt.category ?? "prompt").toUpperCase()}
        </Text>
      </View>
      <MotionPressable onPress={() => onCopy(prompt)} scaleTo={0.995}>
        <Text style={[styles.promptRowText, { color: theme.text }]}>{prompt.text}</Text>
      </MotionPressable>
      <View style={styles.promptRowFooter}>
        <SaveTag isSaved={isSaved} onPress={() => onToggleSave(prompt.id)} theme={theme} />
      </View>
    </View>
  );
}

function ProfileStat({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: AppTheme;
}) {
  return (
    <View style={[styles.profileStat, { borderColor: theme.border }]}>
      <Text style={[styles.profileStatValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.profileStatLabel, { color: theme.textMuted }]}>{label}</Text>
    </View>
  );
}

function PromptRowSkeleton({ theme }: { theme: AppTheme }) {
  return (
    <View style={[styles.promptRow, { borderColor: theme.border }]}>
      <View style={styles.promptRowTop}>
        <SkeletonBlock borderRadius={6} height={12} theme={theme} width={82} />
        <SkeletonBlock borderRadius={7} height={14} theme={theme} width={44} />
      </View>
      <View style={styles.skeletonTextGroup}>
        <SkeletonBlock borderRadius={10} height={24} theme={theme} width="94%" />
        <SkeletonBlock borderRadius={10} height={24} theme={theme} width="81%" />
      </View>
      <SkeletonBlock borderRadius={999} height={34} theme={theme} width={92} />
    </View>
  );
}

function RepliesTabSkeleton({ theme }: { theme: AppTheme }) {
  return (
    <View style={styles.tabContent}>
      <View style={styles.intervalBlock}>
        <SkeletonBlock borderRadius={8} height={18} theme={theme} width={174} />
        <View style={styles.skeletonChipRow}>
          <SkeletonBlock borderRadius={999} height={42} theme={theme} width={74} />
          <SkeletonBlock borderRadius={999} height={42} theme={theme} width={118} />
          <SkeletonBlock borderRadius={999} height={42} theme={theme} width={102} />
        </View>
      </View>

      <View style={[styles.promptSection, { borderColor: theme.border }]}>
        <View style={styles.replySkeletonContent}>
          <View style={styles.skeletonTextGroupLarge}>
            <SkeletonBlock borderRadius={12} height={34} theme={theme} width="93%" />
            <SkeletonBlock borderRadius={12} height={34} theme={theme} width="86%" />
            <SkeletonBlock borderRadius={12} height={34} theme={theme} width="68%" />
          </View>
          <View style={styles.replySkeletonFooter}>
            <SkeletonBlock borderRadius={8} height={18} theme={theme} width="62%" />
            <SkeletonBlock borderRadius={999} height={34} theme={theme} width={34} />
          </View>
        </View>
      </View>

      <View style={styles.controlsSection}>
        <View style={styles.replySkeletonFooter}>
          <SkeletonBlock borderRadius={8} height={18} theme={theme} width="42%" />
          <SkeletonBlock borderRadius={999} height={34} theme={theme} width={34} />
          <SkeletonBlock borderRadius={999} height={34} theme={theme} width={34} />
        </View>
      </View>

      <View style={styles.moodFilterBlock}>
        <SkeletonBlock borderRadius={8} height={18} theme={theme} width={72} />
        <View style={styles.skeletonChipRow}>
          <SkeletonBlock borderRadius={999} height={42} theme={theme} width={62} />
          <SkeletonBlock borderRadius={999} height={42} theme={theme} width={82} />
          <SkeletonBlock borderRadius={999} height={42} theme={theme} width={96} />
        </View>
      </View>
    </View>
  );
}

function LibraryTabSkeleton({
  introWidth,
  theme,
}: {
  introWidth: number | `${number}%` | "auto";
  theme: AppTheme;
}) {
  return (
    <View style={styles.tabContent}>
      <SkeletonBlock borderRadius={8} height={16} theme={theme} width={introWidth} />
      <View style={styles.skeletonChipRow}>
        <SkeletonBlock borderRadius={999} height={42} theme={theme} width={74} />
        <SkeletonBlock borderRadius={999} height={42} theme={theme} width={102} />
        <SkeletonBlock borderRadius={999} height={42} theme={theme} width={88} />
      </View>
      {[0, 1, 2].map((index) => (
        <PromptRowSkeleton key={index} theme={theme} />
      ))}
    </View>
  );
}

function ProfileTabSkeleton({ theme }: { theme: AppTheme }) {
  return (
    <View style={styles.tabContent}>
      <SkeletonBlock borderRadius={8} height={16} theme={theme} width="92%" />

      <View style={[styles.authSection, { borderColor: theme.border }]}>
        <SkeletonBlock borderRadius={6} height={12} theme={theme} width={56} />
        <SkeletonBlock borderRadius={14} height={52} theme={theme} />
        <SkeletonBlock borderRadius={6} height={12} theme={theme} width={56} />
        <SkeletonBlock borderRadius={14} height={52} theme={theme} />
        <View style={styles.profileActions}>
          <SkeletonBlock
            borderRadius={999}
            height={46}
            style={styles.skeletonFlexButton}
            theme={theme}
          />
          <SkeletonBlock
            borderRadius={999}
            height={46}
            style={styles.skeletonFlexButton}
            theme={theme}
          />
        </View>
      </View>

      <View style={styles.profileStatsRow}>
        <View style={[styles.profileStat, { borderColor: theme.border }]}>
          <SkeletonBlock borderRadius={10} height={22} theme={theme} width={48} />
          <SkeletonBlock borderRadius={7} height={13} theme={theme} width={74} />
        </View>
        <View style={[styles.profileStat, { borderColor: theme.border }]}>
          <SkeletonBlock borderRadius={10} height={22} theme={theme} width={68} />
          <SkeletonBlock borderRadius={7} height={13} theme={theme} width={82} />
        </View>
      </View>

      <View style={[styles.profilePanel, { borderColor: theme.border }]}>
        <SkeletonBlock borderRadius={8} height={20} theme={theme} width={132} />
        <View style={styles.skeletonTextGroup}>
          <SkeletonBlock borderRadius={8} height={16} theme={theme} width="94%" />
          <SkeletonBlock borderRadius={8} height={16} theme={theme} width="72%" />
        </View>
      </View>
    </View>
  );
}

export default function App() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const [activeTab, setActiveTab] = useState<AppTab>("replies");
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [savedPromptIds, setSavedPromptIds] = useState<string[]>([]);
  const [selectedOpenerCategory, setSelectedOpenerCategory] =
    useState<OpenerCategory>("all");
  const [selectedReplyMood, setSelectedReplyMood] = useState<ReplyMood>("all");
  const [selectedSmallTalkCategory, setSelectedSmallTalkCategory] =
    useState<SmallTalkCategory>("all");
  const [session, setSession] = useState<UserSession | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [toast, setToast] = useState<ToastState>({
    message: "",
    version: 0,
  });
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(14)).current;
  const moodFilteredPrompts = useMemo(() => {
    switch (selectedReplyMood) {
      case "flirty":
      case "naughty":
      case "bold":
        return prompts.filter((prompt) => prompt.category === "flirty");
      case "borderline":
        return prompts.filter((prompt) => prompt.category === "borderline");
      case "sexual":
        return prompts.filter((prompt) => prompt.category === "sexual");
      case "playful":
      case "teasing":
        return prompts.filter((prompt) => prompt.category === "funny");
      case "casual":
        return prompts.filter((prompt) => prompt.category === "casual");
      case "thoughtful":
        return prompts.filter((prompt) => prompt.category === "deep");
      default:
        return prompts;
    }
  }, [selectedReplyMood]);
  const {
    currentIndex,
    currentPrompt,
    isHydrated: isRotatorHydrated,
    promptCount,
    setSelectedAudience,
    selectedAudience,
    shuffle,
  } = useRotator(moodFilteredPrompts);
  const currentReplyMood = useMemo<Exclude<ReplyMood, "all"> | null>(() => {
    switch (currentPrompt?.category) {
      case "flirty":
        return "flirty";
      case "borderline":
        return "borderline";
      case "sexual":
        return "sexual";
      case "funny":
        return "playful";
      case "casual":
        return "casual";
      case "deep":
        return "thoughtful";
      default:
        return null;
    }
  }, [currentPrompt?.category]);

  useEffect(() => {
    let isMounted = true;

    void Promise.all([loadSavedPromptIds(), loadUserSession()]).then(
      ([storedPromptIds, storedSession]) => {
        if (!isMounted) {
          return;
        }

        setSavedPromptIds(storedPromptIds);
        setSession(storedSession);

        if (storedSession) {
          setNameInput(storedSession.name);
          setEmailInput(storedSession.email);
        }

        setIsBootstrapping(false);
      },
    );

    return () => {
      isMounted = false;
    };
  }, []);

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

  const isRepliesLoading = isBootstrapping || !isRotatorHydrated;
  const promptCounterLabel =
    isRepliesLoading
      ? "Loading"
      : promptCount === 0
      ? "No prompts loaded"
      : `${String(currentIndex + 1).padStart(2, "0")} / ${String(promptCount).padStart(
          2,
          "0",
        )}`;

  const openerPrompts = useMemo(
    () =>
      selectedOpenerCategory === "all"
        ? openers
        : openers.filter((opener) => opener.category === selectedOpenerCategory),
    [selectedOpenerCategory],
  );
  const topicPrompts = useMemo(
    () =>
      selectedSmallTalkCategory === "all"
        ? smallTalkTopics
        : smallTalkTopics.filter((topic) => topic.category === selectedSmallTalkCategory),
    [selectedSmallTalkCategory],
  );
  const savedPrompts = useMemo(
    () =>
      [...prompts, ...openers, ...smallTalkTopics].filter((prompt) =>
        savedPromptIds.includes(prompt.id),
      ),
    [savedPromptIds],
  );
  const tabMeta = {
    replies: {
      eyebrow: "Photo Reply",
      title: "Replies",
      counter: promptCounterLabel,
    },
    openers: {
      eyebrow: "Starter Bank",
      title: "Openers",
      counter: `${String(openerPrompts.length).padStart(2, "0")} total`,
    },
    topics: {
      eyebrow: "Small Talk",
      title: "Topics",
      counter: `${String(topicPrompts.length).padStart(3, "0")} ideas`,
    },
    saved: {
      eyebrow: "Saved List",
      title: "Saved",
      counter: isBootstrapping ? "Loading" : `${String(savedPrompts.length).padStart(2, "0")} kept`,
    },
    profile: {
      eyebrow: "Account",
      title: "Profile",
      counter: isBootstrapping ? "Loading" : session ? "Signed in" : "Guest",
    },
  } satisfies Record<AppTab, { eyebrow: string; title: string; counter: string }>;

  function showToast(message: string) {
    setToast((previousToast) => ({
      message,
      version: previousToast.version + 1,
    }));
  }

  async function handleCopy(prompt: CopyableLine) {
    try {
      await Clipboard.setStringAsync(prompt.text);
      showToast("Copied to clipboard");
    } catch {
      showToast("Clipboard unavailable");
    }
  }

  function toggleSavedPrompt(promptId: string) {
    setSavedPromptIds((previousIds) => {
      const nextIds = previousIds.includes(promptId)
        ? previousIds.filter((id) => id !== promptId)
        : [...previousIds, promptId];

      void saveSavedPromptIds(nextIds);
      return nextIds;
    });
  }

  async function handleSignIn() {
    const name = nameInput.trim();
    const email = emailInput.trim();

    if (!name || !email) {
      showToast("Add name and email");
      return;
    }

    const nextSession = { name, email };
    setSession(nextSession);
    await saveUserSession(nextSession);
    showToast("Profile saved");
  }

  async function handleSignOut() {
    setSession(null);
    setNameInput("");
    setEmailInput("");
    await clearUserSession();
    showToast("Signed out");
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />

      <View style={styles.root}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: theme.textMuted }]}>
              {tabMeta[activeTab].eyebrow}
            </Text>
            <Text style={[styles.title, { color: theme.text }]}>{tabMeta[activeTab].title}</Text>
          </View>
          <Text style={[styles.counter, { color: theme.textMuted }]}>
            {tabMeta[activeTab].counter}
          </Text>
        </View>

        {activeTab === "replies" ? (
          <View style={styles.repliesPage}>
            <View style={styles.repliesPageContent}>
              {isRepliesLoading ? (
                <RepliesTabSkeleton theme={theme} />
              ) : (
                <View style={styles.tabContent}>
                  <View style={styles.intervalBlock}>
                    <Text style={[styles.intervalLabel, { color: theme.text }]}>
                      Best for her vibe
                    </Text>
                    <AudienceSelector
                      onSelect={setSelectedAudience}
                      selectedValue={selectedAudience}
                      theme={theme}
                    />
                  </View>

                  <View style={[styles.promptSection, styles.replyPromptSection, { borderColor: theme.border }]}>
                    <PromptCard
                      footerAccessory={
                        currentPrompt ? (
                          <>
                            <RefreshTag
                              disabled={promptCount < 2}
                              onPress={shuffle}
                              theme={theme}
                            />
                            <SaveTag
                              isSaved={savedPromptIds.includes(currentPrompt.id)}
                              onPress={() => toggleSavedPrompt(currentPrompt.id)}
                              theme={theme}
                            />
                          </>
                        ) : null
                      }
                      onAdvance={promptCount > 1 ? shuffle : undefined}
                      onCopy={() => {
                        if (currentPrompt) {
                          void handleCopy(currentPrompt);
                        }
                      }}
                      prompt={currentPrompt}
                      theme={theme}
                    />
                  </View>

                  <View style={styles.moodFilterBlock}>
                    <Text style={[styles.intervalLabel, { color: theme.text }]}>Moods</Text>
                    <ReplyMoodSelector
                      currentMood={currentReplyMood}
                      onSelect={setSelectedReplyMood}
                      selectedValue={selectedReplyMood}
                      theme={theme}
                    />
                  </View>
                </View>
              )}
            </View>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
          >
          {activeTab === "openers" ? (
            isBootstrapping ? (
              <LibraryTabSkeleton introWidth="78%" theme={theme} />
            ) : (
            <View style={styles.tabContent}>
              <Text style={[styles.tabIntro, { color: theme.textMuted }]}>
                Shorter lines you can use when you want a lighter entry point than a direct photo
                reply.
              </Text>
              <OpenerCategorySelector
                onSelect={setSelectedOpenerCategory}
                selectedValue={selectedOpenerCategory}
                theme={theme}
              />
              {openerPrompts.map((prompt) => (
                <PromptRow
                  key={prompt.id}
                  prompt={prompt}
                  isSaved={savedPromptIds.includes(prompt.id)}
                  onCopy={(selectedPrompt) => {
                    void handleCopy(selectedPrompt);
                  }}
                  onToggleSave={toggleSavedPrompt}
                  theme={theme}
                />
              ))}
            </View>
            )
          ) : null}

          {activeTab === "topics" ? (
            isBootstrapping ? (
              <LibraryTabSkeleton introWidth="88%" theme={theme} />
            ) : (
            <View style={styles.tabContent}>
              <Text style={[styles.tabIntro, { color: theme.textMuted }]}>
                A larger bank of lighter prompts when you want to keep the conversation moving
                without sounding over-rehearsed.
              </Text>
              <SmallTalkCategorySelector
                onSelect={setSelectedSmallTalkCategory}
                selectedValue={selectedSmallTalkCategory}
                theme={theme}
              />
              {topicPrompts.map((prompt) => (
                <PromptRow
                  key={prompt.id}
                  prompt={prompt}
                  isSaved={savedPromptIds.includes(prompt.id)}
                  onCopy={(selectedPrompt) => {
                    void handleCopy(selectedPrompt);
                  }}
                  onToggleSave={toggleSavedPrompt}
                  theme={theme}
                />
              ))}
            </View>
            )
          ) : null}

          {activeTab === "saved" ? (
            isBootstrapping ? (
              <LibraryTabSkeleton introWidth="84%" theme={theme} />
            ) : (
            <View style={styles.tabContent}>
              <Text style={[styles.tabIntro, { color: theme.textMuted }]}>
                Keep the replies, openers, and small-talk topics that fit your tone so you can come
                back to them fast.
              </Text>
              {savedPrompts.length === 0 ? (
                <View style={[styles.emptyState, { borderColor: theme.border }]}>
                  <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                    Nothing saved yet
                  </Text>
                  <Text style={[styles.emptyStateBody, { color: theme.textMuted }]}>
                    Save a few items from the other tabs and they will show up here.
                  </Text>
                </View>
              ) : (
                savedPrompts.map((prompt) => (
                  <PromptRow
                    key={prompt.id}
                    prompt={prompt}
                    isSaved
                    onCopy={(selectedPrompt) => {
                      void handleCopy(selectedPrompt);
                    }}
                    onToggleSave={toggleSavedPrompt}
                    theme={theme}
                  />
                ))
              )}
            </View>
            )
          ) : null}

          {activeTab === "profile" ? (
            isBootstrapping ? (
              <ProfileTabSkeleton theme={theme} />
            ) : (
            <View style={styles.tabContent}>
              <Text style={[styles.tabIntro, { color: theme.textMuted }]}>
                This is a local profile for now. It keeps your identity and preferences on this
                device until a real backend is added.
              </Text>

              <View style={[styles.authSection, { borderColor: theme.border }]}>
                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Name</Text>
                <TextInput
                  autoCapitalize="words"
                  placeholder="Akshay"
                  placeholderTextColor={theme.textMuted}
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  value={nameInput}
                  onChangeText={setNameInput}
                />

                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Email</Text>
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="you@example.com"
                  placeholderTextColor={theme.textMuted}
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  value={emailInput}
                  onChangeText={setEmailInput}
                />

                <View style={styles.profileActions}>
                  <FlatButton
                    label={session ? "Update profile" : "Continue"}
                    onPress={() => {
                      void handleSignIn();
                    }}
                    theme={theme}
                    tone="dark"
                  />
                  {session ? (
                    <FlatButton
                      label="Sign out"
                      onPress={() => {
                        void handleSignOut();
                      }}
                      theme={theme}
                    />
                  ) : null}
                </View>
              </View>

              <View style={styles.profileStatsRow}>
                <ProfileStat
                  label="Saved items"
                  value={String(savedPromptIds.length).padStart(2, "0")}
                  theme={theme}
                />
                <ProfileStat
                  label="Active vibe"
                  value={selectedAudience === "all" ? "All" : selectedAudience}
                  theme={theme}
                />
              </View>

              <View style={[styles.profilePanel, { borderColor: theme.border }]}>
                <Text style={[styles.profilePanelTitle, { color: theme.text }]}>
                  Profile options
                </Text>
                <Text style={[styles.profilePanelBody, { color: theme.textMuted }]}>
                  Next sensible additions here would be real auth, synced saves, and separate prompt packs per app or dating intent.
                </Text>
              </View>
            </View>
            )
          ) : null}
        </ScrollView>
        )}

        <View
          style={[
            styles.bottomDockWrap,
            {
              backgroundColor: theme.background,
              borderColor: theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.bottomNav,
              { backgroundColor: theme.background },
            ]}
          >
          {TAB_ITEMS.map((tab) => {
            const isActive = tab.key === activeTab;

            return (
              <MotionPressable
                key={tab.key}
                containerStyle={styles.navItemWrap}
                onPress={() => setActiveTab(tab.key)}
                scaleTo={0.985}
                style={[
                  styles.navItem,
                  {
                    borderColor: isActive ? theme.text : "transparent",
                    backgroundColor: isActive ? theme.surfaceStrong : "transparent",
                  },
                ]}
              >
                <Ionicons
                  name={tab.icon}
                  size={18}
                  color={isActive ? theme.text : theme.textMuted}
                />
                <Text
                  style={[
                    styles.navLabel,
                    {
                      color: isActive ? theme.text : theme.textMuted,
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </MotionPressable>
            );
          })}
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
    paddingTop: 12,
    overflow: "hidden",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    paddingTop: 8,
    paddingBottom: 18,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    fontSize: 34,
    lineHeight: 38,
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
  scrollContent: {
    paddingBottom: 90,
  },
  repliesPage: {
    flex: 1,
    paddingBottom: 90,
  },
  repliesPageContent: {
    flex: 1,
    gap: 18,
  },
  tabContent: {
    gap: 22,
  },
  promptSection: {
    minHeight: 190,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  replyPromptSection: {
    flex: 1,
    justifyContent: "center",
  },
  controlsSection: {
    gap: 12,
  },
  intervalBlock: {
    gap: 12,
  },
  moodFilterBlock: {
    gap: 10,
  },
  intervalLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  tabIntro: {
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 360,
  },
  skeletonTextGroup: {
    gap: 10,
  },
  skeletonTextGroupLarge: {
    gap: 12,
  },
  skeletonChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  replySkeletonContent: {
    gap: 20,
    paddingTop: 18,
  },
  replySkeletonFooter: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  promptRow: {
    borderTopWidth: 1,
    paddingTop: 14,
    gap: 12,
  },
  promptRowTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  promptRowFooter: {
    alignItems: "flex-end",
  },
  promptRowCategory: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  promptRowText: {
    fontSize: 24,
    lineHeight: 34,
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      default: undefined,
    }),
    fontWeight: "600",
  },
  skeletonFlexButton: {
    flex: 1,
  },
  saveTag: {
    minWidth: 34,
    minHeight: 34,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  iconTag: {
    minWidth: 34,
    minHeight: 34,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  flatButton: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  flatButtonLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  emptyState: {
    borderTopWidth: 1,
    paddingTop: 14,
    gap: 8,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  emptyStateBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  authSection: {
    borderTopWidth: 1,
    gap: 12,
    paddingTop: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    minHeight: 52,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  profileActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  profileStatsRow: {
    flexDirection: "row",
    gap: 12,
  },
  profileStat: {
    flex: 1,
    borderTopWidth: 1,
    paddingTop: 14,
    gap: 6,
  },
  profileStatValue: {
    fontSize: 22,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  profileStatLabel: {
    fontSize: 13,
  },
  profilePanel: {
    borderTopWidth: 1,
    paddingTop: 14,
    gap: 8,
  },
  profilePanelTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  profilePanelBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomDockWrap: {
    position: "absolute",
    left: -20,
    right: -20,
    bottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    borderTopWidth: 1,
  },
  bottomNav: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 6,
    gap: 4,
  },
  navItem: {
    width: "100%",
    minHeight: 50,
    gap: 3,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  navItemWrap: {
    flex: 1,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  toast: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 100,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  toastLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
});

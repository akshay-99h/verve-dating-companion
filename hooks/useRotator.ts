import {
  startTransition,
  type Dispatch,
  type SetStateAction,
  useEffect,
  useState,
} from "react";
import { AppState, type AppStateStatus } from "react-native";

import type { AudienceCategory, Prompt, RotatorState } from "../types";
import {
  sanitizeAudience,
  clampIndex,
  getNextIndex,
  getPreviousIndex,
  getRandomIndex,
  sanitizeInterval,
} from "../utils/rotator";
import {
  DEFAULT_ROTATOR_STATE,
  loadRotatorState,
  saveRotatorState,
} from "../utils/storage";

function updateState(
  setState: Dispatch<SetStateAction<RotatorState>>,
  updater: (previousState: RotatorState) => RotatorState,
) {
  startTransition(() => {
    setState(updater);
  });
}

export function useRotator(promptList: Prompt[]) {
  const [state, setState] = useState<RotatorState>(DEFAULT_ROTATOR_STATE);
  const [isHydrated, setIsHydrated] = useState(false);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const filteredPrompts =
    state.selectedAudience === "all"
      ? promptList
      : promptList.filter((prompt) =>
          prompt.audiences?.includes(state.selectedAudience as Exclude<AudienceCategory, "all">),
        );
  const promptCount = filteredPrompts.length;

  useEffect(() => {
    let isMounted = true;

    void loadRotatorState().then((storedState) => {
      if (!isMounted) {
        return;
      }

      if (storedState) {
        const selectedAudience = sanitizeAudience(storedState.selectedAudience);
        const filteredPromptCount =
          selectedAudience === "all"
            ? promptList.length
            : promptList.filter((prompt) =>
                prompt.audiences?.includes(
                  selectedAudience as Exclude<AudienceCategory, "all">,
                ),
              ).length;

        setState({
          currentIndex: clampIndex(storedState.currentIndex, filteredPromptCount),
          autoRotate: filteredPromptCount > 1 ? storedState.autoRotate : false,
          intervalMs: sanitizeInterval(storedState.intervalMs),
          selectedAudience,
        });
      }

      setIsHydrated(true);
    });

    return () => {
      isMounted = false;
    };
  }, [promptList]);

  useEffect(() => {
    updateState(setState, (previousState) => ({
      ...previousState,
      currentIndex: clampIndex(previousState.currentIndex, promptCount),
      autoRotate: promptCount > 1 ? previousState.autoRotate : false,
    }));
  }, [promptCount]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", setAppState);

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void saveRotatorState(state);
  }, [isHydrated, state]);

  useEffect(() => {
    if (!isHydrated || !state.autoRotate || appState !== "active" || promptCount < 2) {
      return;
    }

    const intervalId = setInterval(() => {
      updateState(setState, (previousState) => ({
        ...previousState,
        currentIndex: getNextIndex(previousState.currentIndex, promptCount),
      }));
    }, state.intervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [appState, isHydrated, promptCount, state.autoRotate, state.intervalMs]);

  const currentPrompt = filteredPrompts[state.currentIndex] ?? null;

  function goToNext() {
    if (promptCount < 2) {
      return;
    }

    updateState(setState, (previousState) => ({
      ...previousState,
      currentIndex: getNextIndex(previousState.currentIndex, promptCount),
    }));
  }

  function goToPrevious() {
    if (promptCount < 2) {
      return;
    }

    updateState(setState, (previousState) => ({
      ...previousState,
      currentIndex: getPreviousIndex(previousState.currentIndex, promptCount),
    }));
  }

  function shuffle() {
    if (promptCount < 2) {
      return;
    }

    updateState(setState, (previousState) => ({
      ...previousState,
      currentIndex: getRandomIndex(promptCount, previousState.currentIndex),
    }));
  }

  function setAutoRotate(value: boolean) {
    updateState(setState, (previousState) => ({
      ...previousState,
      autoRotate: promptCount > 1 ? value : false,
    }));
  }

  function setIntervalMs(value: number) {
    updateState(setState, (previousState) => ({
      ...previousState,
      intervalMs: sanitizeInterval(value),
    }));
  }

  function setSelectedAudience(value: AudienceCategory) {
    updateState(setState, (previousState) => ({
      ...previousState,
      currentIndex: 0,
      selectedAudience: sanitizeAudience(value),
    }));
  }

  return {
    autoRotate: state.autoRotate,
    currentIndex: state.currentIndex,
    currentPrompt,
    intervalMs: state.intervalMs,
    isAppActive: appState === "active",
    isHydrated,
    promptCount,
    selectedAudience: state.selectedAudience,
    goToNext,
    goToPrevious,
    setAutoRotate,
    setIntervalMs,
    setSelectedAudience,
    shuffle,
  };
}

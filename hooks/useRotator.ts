import {
  startTransition,
  type Dispatch,
  type SetStateAction,
  useEffect,
  useState,
} from "react";

import type { AudienceCategory, Prompt, RotatorState } from "../types";
import {
  sanitizeAudience,
  clampIndex,
  getNextIndex,
  getPreviousIndex,
  getRandomIndex,
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
    }));
  }, [promptCount]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void saveRotatorState(state);
  }, [isHydrated, state]);

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

  function setSelectedAudience(value: AudienceCategory) {
    updateState(setState, (previousState) => ({
      ...previousState,
      currentIndex: 0,
      selectedAudience: sanitizeAudience(value),
    }));
  }

  return {
    currentIndex: state.currentIndex,
    currentPrompt,
    isHydrated,
    promptCount,
    selectedAudience: state.selectedAudience,
    goToNext,
    goToPrevious,
    setSelectedAudience,
    shuffle,
  };
}

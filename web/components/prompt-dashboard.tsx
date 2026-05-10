"use client"

import * as React from "react"
import {
  BookmarkIcon,
  MessageCircleMoreIcon,
  MessagesSquareIcon,
  RefreshCcwIcon,
  SparklesIcon,
  UserIcon,
} from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  AUDIENCE_OPTIONS,
  formatAudienceLabel,
  getNextIndex,
  getPreviousIndex,
  getRandomIndex,
  openers,
  OPENER_CATEGORY_LABELS,
  OPENER_CATEGORY_OPTIONS,
  prompts,
  smallTalkTopics,
  SMALL_TALK_CATEGORY_LABELS,
  SMALL_TALK_CATEGORY_OPTIONS,
} from "../../shared"
import type {
  AudienceCategory,
  OpenerCategory,
  PromptCategory,
  SmallTalkCategory,
} from "../../shared"
import { cn } from "@/lib/utils"

type SectionKey = "replies" | "openers" | "topics" | "saved" | "about"
type ItemKind = "reply" | "opener" | "topic"
type MobileTab = "replies" | "openers" | "topics" | "saved" | "profile"
type ReplyMood =
  | "all"
  | "flirty"
  | "borderline"
  | "sexual"
  | "naughty"
  | "bold"
  | "playful"
  | "teasing"
  | "casual"
  | "thoughtful"
  | "heartwarming"

type SavedItem = {
  id: string
  category: string
  kind: ItemKind
  text: string
}

type PromptLike = {
  id: string
  text: string
  category?: string | null
}

type SearchRecord = {
  id: string
  kind: ItemKind | "about"
  section: SectionKey
  text: string
}

const STORAGE_KEY = "verve:web:v4"
const SAVED_KEY = "verve:web:saved:v4"
const SECTION_ORDER: SectionKey[] = ["replies", "openers", "topics", "saved", "about"]

const REPLY_MOOD_OPTIONS: readonly ReplyMood[] = [
  "all",
  "flirty",
  "borderline",
  "sexual",
  "naughty",
  "bold",
  "playful",
  "teasing",
  "casual",
  "thoughtful",
  "heartwarming",
] as const

const REPLY_MOOD_LABELS: Record<ReplyMood, string> = {
  all: "All",
  flirty: "Flirty",
  borderline: "Borderline",
  sexual: "Sexual",
  naughty: "Naughty",
  bold: "Bold",
  playful: "Playful",
  teasing: "Teasing",
  casual: "Casual",
  thoughtful: "Thoughtful",
  heartwarming: "Heartwarming",
}

const ABOUT_COPY = [
  "Replies are tuned for the middle of a conversation when you want something with more personality than a safe fallback.",
  "Openers stay lighter and quicker, so the first message does not sound stiff or overbuilt.",
  "Topics give you a softer way to keep the exchange moving when the next question matters more than the perfect line.",
]

const MOBILE_TABS: Array<{
  key: MobileTab
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { key: "replies", label: "Replies", icon: MessageCircleMoreIcon },
  { key: "openers", label: "Openers", icon: SparklesIcon },
  { key: "topics", label: "Topics", icon: MessagesSquareIcon },
  { key: "saved", label: "Saved", icon: BookmarkIcon },
  { key: "profile", label: "Profile", icon: UserIcon },
]

function clampIndex(index: number, size: number) {
  if (size <= 0) {
    return 0
  }

  return ((index % size) + size) % size
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim()
}

function fuzzyScore(query: string, candidate: string) {
  if (!query) {
    return 1
  }

  const q = normalizeText(query)
  const c = normalizeText(candidate)

  if (!q || !c) {
    return 0
  }

  if (c.includes(q)) {
    return 1000 - c.indexOf(q)
  }

  let score = 0
  let cursor = 0
  let streak = 0

  for (const char of q) {
    const nextIndex = c.indexOf(char, cursor)
    if (nextIndex === -1) {
      return 0
    }

    const contiguous = nextIndex === cursor
    streak = contiguous ? streak + 1 : 1
    score += contiguous ? 6 + streak * 3 : 2
    cursor = nextIndex + 1
  }

  return score
}

function labelReplyCategory(category?: PromptCategory | string | null) {
  if (!category) {
    return "Reply"
  }

  return category.charAt(0).toUpperCase() + category.slice(1)
}

function getReplyMoodForCategory(category?: PromptCategory | null): Exclude<ReplyMood, "all"> | null {
  switch (category) {
    case "flirty":
      return "flirty"
    case "borderline":
      return "borderline"
    case "sexual":
      return "sexual"
    case "funny":
      return "playful"
    case "casual":
      return "casual"
    case "deep":
      return "thoughtful"
    case "heartwarming":
      return "heartwarming"
    default:
      return null
  }
}

function filterRepliesByMood(selectedReplyMood: ReplyMood) {
  switch (selectedReplyMood) {
    case "flirty":
    case "naughty":
    case "bold":
      return prompts.filter((prompt) => prompt.category === "flirty")
    case "borderline":
      return prompts.filter((prompt) => prompt.category === "borderline")
    case "sexual":
      return prompts.filter((prompt) => prompt.category === "sexual")
    case "playful":
    case "teasing":
      return prompts.filter((prompt) => prompt.category === "funny")
    case "casual":
      return prompts.filter((prompt) => prompt.category === "casual")
    case "thoughtful":
      return prompts.filter((prompt) => prompt.category === "deep")
    case "heartwarming":
      return prompts.filter((prompt) => prompt.category === "heartwarming")
    default:
      return prompts
  }
}

function ChipGroup<T extends string>({
  labelFor,
  onSelect,
  options,
  selected,
}: {
  labelFor: (value: T) => string
  onSelect: (value: T) => void
  options: readonly T[]
  selected: T
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((value) => (
        <Button
          key={value}
          className={cn(
            "rounded-lg px-3.5",
            selected === value &&
              "border-[var(--text)] bg-[var(--text)] text-[#fff6ef] hover:bg-[var(--text)]",
          )}
          onClick={() => onSelect(value)}
          size="sm"
          variant="secondary"
        >
          {labelFor(value)}
        </Button>
      ))}
    </div>
  )
}

function Toolbar({
  onCopy,
  onNext,
  onPrevious,
  onSave,
  onShuffle,
  saved,
}: {
  onCopy: () => void
  onNext: () => void
  onPrevious: () => void
  onSave: () => void
  onShuffle: () => void
  saved: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={onPrevious} size="sm" variant="secondary">
        Previous
      </Button>
      <Button onClick={onNext} size="sm" variant="secondary">
        Next
      </Button>
      <Button onClick={onShuffle} size="sm" variant="secondary">
        Shuffle
      </Button>
      <Button onClick={onCopy} size="sm">
        Copy
      </Button>
      <Button onClick={onSave} size="sm" variant="outline">
        {saved ? "Unsave" : "Save"}
      </Button>
    </div>
  )
}

function ListRow({
  isSaved,
  item,
  onCopy,
  onToggleSave,
}: {
  isSaved: boolean
  item: PromptLike
  onCopy: (selectedPrompt: PromptLike) => void
  onToggleSave: (item: PromptLike, kind: ItemKind) => void
}) {
  const kind = item.id.startsWith("opener-")
    ? "opener"
    : item.id.startsWith("topic-")
      ? "topic"
      : "reply"

  return (
    <article className="dashboard-list-row">
      <div className="dashboard-list-row__meta">
        <Badge variant="outline">{item.category ?? kind}</Badge>
        <Button onClick={() => onToggleSave(item, kind)} size="sm" variant="outline">
          {isSaved ? "Unsave" : "Save"}
        </Button>
      </div>
      <button
        className="dashboard-list-row__button"
        onClick={() => onCopy(item)}
        type="button"
      >
        {item.text}
      </button>
    </article>
  )
}

function SavedList({
  items,
  onCopy,
  onRemove,
}: {
  items: SavedItem[]
  onCopy: (value: string) => void
  onRemove: (item: SavedItem) => void
}) {
  if (items.length === 0) {
    return (
      <div className="dashboard-empty-state">
        Save a few lines from replies, openers, or topics and they will stay here on this device.
      </div>
    )
  }

  return (
    <div className="grid gap-0">
      {items.map((item) => (
        <article key={item.id} className="dashboard-list-row">
          <div className="dashboard-list-row__meta">
            <Badge variant="outline">{`${item.kind} / ${item.category}`}</Badge>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => onCopy(item.text)} size="sm" variant="secondary">
                Copy
              </Button>
              <Button onClick={() => onRemove(item)} size="sm" variant="outline">
                Remove
              </Button>
            </div>
          </div>
          <p className="dashboard-list-row__text">{item.text}</p>
        </article>
      ))}
    </div>
  )
}

export function PromptDashboard({
  userName,
  userEmail,
}: {
  userName: string
  userEmail: string
}) {
  const isMobile = useIsMobile()
  const [activeSection, setActiveSection] = React.useState<SectionKey>("replies")
  const [mobileTab, setMobileTab] = React.useState<MobileTab>("replies")
  const [query, setQuery] = React.useState("")
  const [selectedAudience, setSelectedAudience] = React.useState<AudienceCategory>("all")
  const [selectedReplyMood, setSelectedReplyMood] = React.useState<ReplyMood>("all")
  const [replyIndex, setReplyIndex] = React.useState(0)
  const [openerCategory, setOpenerCategory] = React.useState<OpenerCategory>("all")
  const [openerIndex, setOpenerIndex] = React.useState(0)
  const [topicCategory, setTopicCategory] = React.useState<SmallTalkCategory>("all")
  const [topicIndex, setTopicIndex] = React.useState(0)
  const [savedItems, setSavedItems] = React.useState<SavedItem[]>([])
  const [copyStatus, setCopyStatus] = React.useState("")
  const sectionRefs = React.useRef<Partial<Record<SectionKey, HTMLElement | null>>>({})
  const swipeStartX = React.useRef<number | null>(null)
  const swipeStartY = React.useRef<number | null>(null)
  const sectionLabel = activeSection.charAt(0).toUpperCase() + activeSection.slice(1)

  const moodFilteredReplies = React.useMemo(
    () => filterRepliesByMood(selectedReplyMood),
    [selectedReplyMood],
  )

  const baseReplies = React.useMemo(
    () =>
      selectedAudience === "all"
        ? moodFilteredReplies
        : moodFilteredReplies.filter((prompt) =>
            prompt.audiences?.includes(selectedAudience as Exclude<AudienceCategory, "all">),
          ),
    [moodFilteredReplies, selectedAudience],
  )

  const baseOpeners = React.useMemo(
    () =>
      openerCategory === "all"
        ? openers
        : openers.filter((item) => item.category === openerCategory),
    [openerCategory],
  )

  const baseTopics = React.useMemo(
    () =>
      topicCategory === "all"
        ? smallTalkTopics
        : smallTalkTopics.filter((item) => item.category === topicCategory),
    [topicCategory],
  )

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      const savedRaw = window.localStorage.getItem(SAVED_KEY)

      if (raw) {
        const parsed = JSON.parse(raw) as Partial<{
          activeSection: SectionKey
          mobileTab: MobileTab
          openerCategory: OpenerCategory
          openerIndex: number
          query: string
          replyIndex: number
          selectedAudience: AudienceCategory
          selectedReplyMood: ReplyMood
          topicCategory: SmallTalkCategory
          topicIndex: number
        }>

        if (parsed.activeSection && SECTION_ORDER.includes(parsed.activeSection)) {
          setActiveSection(parsed.activeSection)
        }

        if (
          parsed.mobileTab &&
          MOBILE_TABS.some((tab) => tab.key === parsed.mobileTab)
        ) {
          setMobileTab(parsed.mobileTab)
        }

        if (typeof parsed.query === "string") {
          setQuery(parsed.query)
        }

        if (parsed.selectedAudience && AUDIENCE_OPTIONS.includes(parsed.selectedAudience)) {
          setSelectedAudience(parsed.selectedAudience)
        }

        if (parsed.selectedReplyMood && REPLY_MOOD_OPTIONS.includes(parsed.selectedReplyMood)) {
          setSelectedReplyMood(parsed.selectedReplyMood)
        }

        if (parsed.openerCategory && OPENER_CATEGORY_OPTIONS.includes(parsed.openerCategory)) {
          setOpenerCategory(parsed.openerCategory)
        }

        if (parsed.topicCategory && SMALL_TALK_CATEGORY_OPTIONS.includes(parsed.topicCategory)) {
          setTopicCategory(parsed.topicCategory)
        }

        setReplyIndex(typeof parsed.replyIndex === "number" ? parsed.replyIndex : 0)
        setOpenerIndex(typeof parsed.openerIndex === "number" ? parsed.openerIndex : 0)
        setTopicIndex(typeof parsed.topicIndex === "number" ? parsed.topicIndex : 0)
      }

      if (savedRaw) {
        const parsedSaved = JSON.parse(savedRaw) as unknown
        if (Array.isArray(parsedSaved)) {
          setSavedItems(
            parsedSaved.filter(
              (value): value is SavedItem =>
                typeof value === "object" &&
                value !== null &&
                typeof (value as SavedItem).id === "string" &&
                typeof (value as SavedItem).text === "string" &&
                typeof (value as SavedItem).kind === "string" &&
                typeof (value as SavedItem).category === "string",
            ),
          )
        }
      }
    } catch {
      // Ignore local persistence failures.
    }
  }, [])

  React.useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          activeSection,
          mobileTab,
          openerCategory,
          openerIndex,
          query,
          replyIndex,
          selectedAudience,
          selectedReplyMood,
          topicCategory,
          topicIndex,
        }),
      )
    } catch {
      // Ignore local persistence failures.
    }
  }, [
    activeSection,
    mobileTab,
    openerCategory,
    openerIndex,
    query,
    replyIndex,
    selectedAudience,
    selectedReplyMood,
    topicCategory,
    topicIndex,
  ])

  React.useEffect(() => {
    try {
      window.localStorage.setItem(SAVED_KEY, JSON.stringify(savedItems))
    } catch {
      // Ignore local persistence failures.
    }
  }, [savedItems])

  React.useEffect(() => {
    if (!copyStatus) {
      return
    }

    const timeoutId = window.setTimeout(() => setCopyStatus(""), 1600)
    return () => window.clearTimeout(timeoutId)
  }, [copyStatus])

  const searchRecords = React.useMemo<SearchRecord[]>(
    () => [
      ...prompts.map((item) => ({
        id: item.id,
        kind: "reply" as const,
        section: "replies" as const,
        text: `${item.text} ${item.category ?? ""}`,
      })),
      ...openers.map((item) => ({
        id: item.id,
        kind: "opener" as const,
        section: "openers" as const,
        text: `${item.text} ${item.category}`,
      })),
      ...smallTalkTopics.map((item) => ({
        id: item.id,
        kind: "topic" as const,
        section: "topics" as const,
        text: `${item.text} ${item.category}`,
      })),
      ...savedItems.map((item) => ({
        id: `saved-${item.id}`,
        kind: item.kind,
        section: "saved" as const,
        text: `${item.text} ${item.category}`,
      })),
      ...ABOUT_COPY.map((item, index) => ({
        id: `about-${index}`,
        kind: "about" as const,
        section: "about" as const,
        text: item,
      })),
    ],
    [savedItems],
  )

  const bestSearchMatch = React.useMemo(() => {
    if (!query.trim()) {
      return null
    }

    return searchRecords
      .map((record) => ({
        record,
        score: fuzzyScore(query, record.text),
      }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score)[0]?.record ?? null
  }, [query, searchRecords])

  const ghostText = React.useMemo(() => {
    if (!query.trim() || !bestSearchMatch) {
      return ""
    }

    return bestSearchMatch.text
  }, [bestSearchMatch, query])

  const filterByQuery = React.useCallback(
    <T extends PromptLike>(items: T[]) => {
      if (!query.trim()) {
        return items
      }

      return items
        .map((item) => ({
          item,
          score: fuzzyScore(query, `${item.text} ${item.category ?? ""}`),
        }))
        .filter((entry) => entry.score > 0)
        .sort((left, right) => right.score - left.score)
        .map((entry) => entry.item)
    },
    [query],
  )

  const filteredReplies = React.useMemo(() => filterByQuery(baseReplies), [baseReplies, filterByQuery])
  const filteredOpeners = React.useMemo(() => filterByQuery(baseOpeners), [baseOpeners, filterByQuery])
  const filteredTopics = React.useMemo(() => filterByQuery(baseTopics), [baseTopics, filterByQuery])
  const filteredSaved = React.useMemo(
    () => (query.trim() ? filterByQuery(savedItems) : savedItems),
    [filterByQuery, query, savedItems],
  )

  React.useEffect(() => {
    setReplyIndex((current) => clampIndex(current, filteredReplies.length))
  }, [filteredReplies.length])

  React.useEffect(() => {
    setOpenerIndex((current) => clampIndex(current, filteredOpeners.length))
  }, [filteredOpeners.length])

  React.useEffect(() => {
    setTopicIndex((current) => clampIndex(current, filteredTopics.length))
  }, [filteredTopics.length])

  const currentReply =
    query.trim() && filteredReplies.length > 0
      ? filteredReplies[0]
      : filteredReplies[clampIndex(replyIndex, filteredReplies.length)] ?? null
  const currentOpener =
    query.trim() && filteredOpeners.length > 0
      ? filteredOpeners[0]
      : filteredOpeners[clampIndex(openerIndex, filteredOpeners.length)] ?? null
  const currentTopic =
    query.trim() && filteredTopics.length > 0
      ? filteredTopics[0]
      : filteredTopics[clampIndex(topicIndex, filteredTopics.length)] ?? null
  const currentReplyMood = getReplyMoodForCategory(currentReply?.category ?? null)

  React.useEffect(() => {
    const sections = SECTION_ORDER.map((key) => sectionRefs.current[key]).filter(Boolean) as HTMLElement[]
    if (sections.length === 0) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0]

        if (visible) {
          const key = visible.target.getAttribute("data-section") as SectionKey | null
          if (key) {
            setActiveSection(key)
          }
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0.15 },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  function saveOrRemove(item: SavedItem) {
    React.startTransition(() => {
      setSavedItems((current) =>
        current.some((entry) => entry.id === item.id)
          ? current.filter((entry) => entry.id !== item.id)
          : [item, ...current],
      )
    })
  }

  function onToggleSave(item: PromptLike, kind: ItemKind) {
    saveOrRemove({
      id: item.id,
      category: item.category ?? kind,
      kind,
      text: item.text,
    })
  }

  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopyStatus("Copied.")
    } catch {
      setCopyStatus("Clipboard access failed.")
    }
  }

  function scrollToSection(section: SectionKey) {
    setActiveSection(section)
    sectionRefs.current[section]?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  React.useEffect(() => {
    if (bestSearchMatch) {
      setActiveSection(bestSearchMatch.section)
    }
  }, [bestSearchMatch])

  const counts: Record<SectionKey, string> = {
    replies: String(filteredReplies.length),
    openers: String(filteredOpeners.length),
    topics: String(filteredTopics.length),
    saved: String(filteredSaved.length),
    about: bestSearchMatch ? "Match" : "Info",
  }

  const replySaved = currentReply ? savedItems.some((item) => item.id === currentReply.id) : false
  const openerSaved = currentOpener ? savedItems.some((item) => item.id === currentOpener.id) : false
  const topicSaved = currentTopic ? savedItems.some((item) => item.id === currentTopic.id) : false

  function handleStageTouchStart(event: React.TouchEvent<HTMLElement>) {
    const touch = event.changedTouches[0]
    swipeStartX.current = touch.clientX
    swipeStartY.current = touch.clientY
  }

  function handleStageTouchEnd(
    event: React.TouchEvent<HTMLElement>,
    onNext: () => void,
    onPrevious: () => void,
  ) {
    if (swipeStartX.current === null || swipeStartY.current === null) {
      return
    }

    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - swipeStartX.current
    const deltaY = touch.clientY - swipeStartY.current

    swipeStartX.current = null
    swipeStartY.current = null

    if (Math.abs(deltaX) < 44 || Math.abs(deltaX) < Math.abs(deltaY)) {
      return
    }

    if (deltaX < 0) {
      onNext()
    } else {
      onPrevious()
    }
  }

  const mobileMeta: Record<MobileTab, { eyebrow: string; title: string; counter: string }> = {
    replies: {
      eyebrow: "Photo reply",
      title: "Replies",
      counter: currentReply ? `${clampIndex(replyIndex, filteredReplies.length) + 1} / ${filteredReplies.length}` : `0 / ${filteredReplies.length}`,
    },
    openers: {
      eyebrow: "First move",
      title: "Openers",
      counter: `${filteredOpeners.length} lines`,
    },
    topics: {
      eyebrow: "Conversation topic",
      title: "Topics",
      counter: `${filteredTopics.length} ideas`,
    },
    saved: {
      eyebrow: "Saved lines",
      title: "Saved",
      counter: `${filteredSaved.length}`,
    },
    profile: {
      eyebrow: "Profile",
      title: "Profile",
      counter: userName,
    },
  }

  if (isMobile) {
    return (
      <section className="verve-mobile-shell">
        <div className="verve-mobile-top">
          <div>
            <p className="verve-mobile-eyebrow">{mobileMeta[mobileTab].eyebrow}</p>
            <h1 className="verve-mobile-title">{mobileMeta[mobileTab].title}</h1>
          </div>
          <p className="verve-mobile-counter">{mobileMeta[mobileTab].counter}</p>
        </div>

        <div className="verve-mobile-content">
          {mobileTab === "replies" ? (
            <div className="verve-mobile-stack">
              <div className="verve-mobile-chip-grid">
                {AUDIENCE_OPTIONS.map((value) => (
                  <button
                    key={value}
                    className="verve-mobile-chip"
                    data-active={selectedAudience === value}
                    onClick={() => {
                      setSelectedAudience(value)
                      setReplyIndex(0)
                    }}
                    type="button"
                  >
                    {formatAudienceLabel(value)}
                  </button>
                ))}
              </div>

              <section
                className="verve-mobile-stage"
                onTouchEnd={(event) =>
                  handleStageTouchEnd(
                    event,
                    () => setReplyIndex((current) => getNextIndex(current, filteredReplies.length)),
                    () => setReplyIndex((current) => getPreviousIndex(current, filteredReplies.length)),
                  )
                }
                onTouchStart={handleStageTouchStart}
              >
                {currentReply ? (
                  <>
                    <button
                      className="verve-mobile-stage-copy"
                      onClick={() => copyText(currentReply.text)}
                      type="button"
                    >
                      <p className="verve-mobile-prompt">{currentReply.text}</p>
                    </button>
                    <div className="verve-mobile-stage-footer">
                      <p className="verve-mobile-hint">Tap to copy or swipe to change the reply.</p>
                      <div className="verve-mobile-actions">
                        <button
                          aria-label="Shuffle reply"
                          className="verve-mobile-icon-button"
                          onClick={() =>
                            setReplyIndex((current) => getRandomIndex(filteredReplies.length, current))
                          }
                          type="button"
                        >
                          <RefreshCcwIcon className="size-6" />
                        </button>
                        <button
                          aria-label={replySaved ? "Unsave reply" : "Save reply"}
                          className="verve-mobile-icon-button"
                          onClick={() => onToggleSave(currentReply, "reply")}
                          type="button"
                        >
                          <BookmarkIcon className={cn("size-6", replySaved && "fill-current")} />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="verve-mobile-hint">No reply matches the current filters.</p>
                )}
              </section>

              <div className="verve-mobile-stack">
                <h2 className="verve-mobile-section-heading">Moods</h2>
                <div className="verve-mobile-chip-grid">
                  {REPLY_MOOD_OPTIONS.map((value) => {
                    const isSelected = selectedReplyMood === value
                    const isCurrent = currentReplyMood === value && !isSelected

                    return (
                      <button
                        key={value}
                        className="verve-mobile-chip"
                        data-active={isSelected}
                        data-current={isCurrent}
                        onClick={() => {
                          setSelectedReplyMood(value)
                          setReplyIndex(0)
                        }}
                        type="button"
                      >
                        {REPLY_MOOD_LABELS[value]}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {mobileTab === "openers" ? (
            <div className="verve-mobile-stack">
              <p className="verve-mobile-intro">
                Shorter lines you can use when you want a lighter entry point than a direct photo reply.
              </p>
              <div className="verve-mobile-chip-grid">
                {OPENER_CATEGORY_OPTIONS.map((value) => (
                  <button
                    key={value}
                    className="verve-mobile-chip"
                    data-active={openerCategory === value}
                    onClick={() => {
                      setOpenerCategory(value)
                      setOpenerIndex(0)
                    }}
                    type="button"
                  >
                    {OPENER_CATEGORY_LABELS[value]}
                  </button>
                ))}
              </div>
              <div className="verve-mobile-list">
                {filteredOpeners.map((item) => (
                  <article key={item.id} className="verve-mobile-row">
                    <p className="verve-mobile-row-label">{OPENER_CATEGORY_LABELS[item.category]}</p>
                    <button
                      className="verve-mobile-row-copy"
                      onClick={() => copyText(item.text)}
                      type="button"
                    >
                      <p className="verve-mobile-row-text">{item.text}</p>
                    </button>
                    <button
                      className="verve-mobile-inline-save"
                      onClick={() => onToggleSave(item, "opener")}
                      type="button"
                    >
                      {savedItems.some((savedItem) => savedItem.id === item.id) ? "Saved" : "Save"}
                    </button>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {mobileTab === "topics" ? (
            <div className="verve-mobile-stack">
              <p className="verve-mobile-intro">
                A larger bank of lighter prompts when you want to keep the conversation moving without sounding over-rehearsed.
              </p>
              <div className="verve-mobile-chip-grid">
                {SMALL_TALK_CATEGORY_OPTIONS.map((value) => (
                  <button
                    key={value}
                    className="verve-mobile-chip"
                    data-active={topicCategory === value}
                    onClick={() => {
                      setTopicCategory(value)
                      setTopicIndex(0)
                    }}
                    type="button"
                  >
                    {SMALL_TALK_CATEGORY_LABELS[value]}
                  </button>
                ))}
              </div>
              <div className="verve-mobile-list">
                {filteredTopics.map((item) => (
                  <article key={item.id} className="verve-mobile-row">
                    <p className="verve-mobile-row-label">{SMALL_TALK_CATEGORY_LABELS[item.category]}</p>
                    <button
                      className="verve-mobile-row-copy"
                      onClick={() => copyText(item.text)}
                      type="button"
                    >
                      <p className="verve-mobile-row-text">{item.text}</p>
                    </button>
                    <button
                      className="verve-mobile-inline-save"
                      onClick={() => onToggleSave(item, "topic")}
                      type="button"
                    >
                      {savedItems.some((savedItem) => savedItem.id === item.id) ? "Saved" : "Save"}
                    </button>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {mobileTab === "saved" ? (
            <div className="verve-mobile-stack">
              <p className="verve-mobile-intro">
                Keep the replies, openers, and topics that fit your tone so you can come back to them fast.
              </p>
              {filteredSaved.length > 0 ? (
                <div className="verve-mobile-list">
                  {filteredSaved.map((item) => (
                    <article key={item.id} className="verve-mobile-row">
                      <p className="verve-mobile-row-label">{`${item.kind} / ${item.category}`}</p>
                      <button
                        className="verve-mobile-row-copy"
                        onClick={() => copyText(item.text)}
                        type="button"
                      >
                        <p className="verve-mobile-row-text">{item.text}</p>
                      </button>
                      <button
                        className="verve-mobile-inline-save"
                        onClick={() => saveOrRemove(item)}
                        type="button"
                      >
                        Remove
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="verve-mobile-hint">Save a few items from the other tabs and they will show up here.</p>
              )}
            </div>
          ) : null}

          {mobileTab === "profile" ? (
            <div className="verve-mobile-stack">
              <div className="verve-mobile-profile-block">
                <p className="verve-mobile-row-label">Signed in</p>
                <p className="verve-mobile-profile-value">{userName}</p>
                <p className="verve-mobile-hint">{userEmail}</p>
              </div>
              <div className="verve-mobile-list">
                <div className="verve-mobile-row">
                  <p className="verve-mobile-row-label">Saved items</p>
                  <p className="verve-mobile-row-text">{String(savedItems.length).padStart(2, "0")}</p>
                </div>
                <div className="verve-mobile-row">
                  <p className="verve-mobile-row-label">Library size</p>
                  <p className="verve-mobile-row-text">
                    {prompts.length + openers.length + smallTalkTopics.length} lines
                  </p>
                </div>
              </div>
              <button
                className="verve-mobile-logout"
                onClick={() => window.location.assign("/logout")}
                type="button"
              >
                Sign out
              </button>
            </div>
          ) : null}
        </div>

        <nav className="verve-mobile-dock" aria-label="Primary">
          {MOBILE_TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = mobileTab === tab.key

            return (
              <button
                key={tab.key}
                className="verve-mobile-dock-item"
                data-active={isActive}
                onClick={() => setMobileTab(tab.key)}
                type="button"
              >
                <Icon className="size-5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>

        <div aria-live="polite" className={cn("copy-toast", copyStatus && "copy-toast--visible")}>
          {copyStatus}
        </div>
      </section>
    )
  }

  return (
    <SidebarProvider
      defaultOpen
      style={
        {
          "--sidebar-width": "17.5rem",
          "--sidebar-width-icon": "4rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        activeSection={activeSection}
        counts={counts}
        onSectionSelect={scrollToSection}
        onSignOut={() => window.location.assign("/logout")}
        user={{ email: userEmail, name: userName }}
      />

      <SidebarInset className="verve-main">
        <div className="verve-ambient" aria-hidden="true">
          <div className="verve-ambient__blob verve-ambient__blob--one" />
          <div className="verve-ambient__blob verve-ambient__blob--two" />
          <div className="verve-ambient__blob verve-ambient__blob--three" />
        </div>

        <SiteHeader
          breadcrumb={["Verve"]}
          ghostText={ghostText}
          onQueryChange={setQuery}
          query={query}
          sectionLabel={sectionLabel}
        />

        <div className="verve-page">
          <div className="verve-stack">
          <section
            className="verve-section"
            data-section="replies"
            ref={(element) => {
              sectionRefs.current.replies = element
            }}
          >
            <div className="verve-section__body">
              <div className="verve-section__header">
                <div className="grid gap-3">
                  <Badge variant="outline">Replies</Badge>
                  <h2 className="verve-section__title">Find a reply that sounds like you.</h2>
                </div>
                <p className="verve-section__count">{filteredReplies.length} lines</p>
              </div>
              <p className="verve-section__intro">
                Pick the audience and mood first, then move through lines until one lands naturally.
              </p>
              <ChipGroup
                labelFor={formatAudienceLabel}
                onSelect={(value) => {
                  setSelectedAudience(value)
                  setReplyIndex(0)
                }}
                options={AUDIENCE_OPTIONS}
                selected={selectedAudience}
              />
              <ChipGroup
                labelFor={(value) => REPLY_MOOD_LABELS[value]}
                onSelect={(value) => {
                  setSelectedReplyMood(value)
                  setReplyIndex(0)
                }}
                options={REPLY_MOOD_OPTIONS}
                selected={selectedReplyMood}
              />
              {currentReply ? (
                <div className="verve-stage">
                  <div className="verve-stage__meta">
                    <Badge variant="outline">{labelReplyCategory(currentReply.category)}</Badge>
                    {currentReplyMood ? (
                      <p className="m-0 text-sm text-muted-foreground">
                        {REPLY_MOOD_LABELS[currentReplyMood]}
                      </p>
                    ) : null}
                  </div>
                  <p className="verve-stage__text">{currentReply.text}</p>
                  <Toolbar
                    onCopy={() => copyText(currentReply.text)}
                    onNext={() => setReplyIndex((current) => getNextIndex(current, filteredReplies.length))}
                    onPrevious={() =>
                      setReplyIndex((current) => getPreviousIndex(current, filteredReplies.length))
                    }
                    onSave={() => onToggleSave(currentReply, "reply")}
                    onShuffle={() =>
                      setReplyIndex((current) => getRandomIndex(filteredReplies.length, current))
                    }
                    saved={replySaved}
                  />
                </div>
              ) : (
                <div className="dashboard-empty-state">No reply matches the current search.</div>
              )}
            </div>
          </section>

          <section
            className="verve-section"
            data-section="openers"
            ref={(element) => {
              sectionRefs.current.openers = element
            }}
          >
            <div className="verve-section__body">
              <div className="verve-section__header">
                <div className="grid gap-3">
                  <Badge variant="outline">Openers</Badge>
                  <h2 className="verve-section__title">Start lighter, sharper, or more direct.</h2>
                </div>
                <p className="verve-section__count">{filteredOpeners.length} lines</p>
              </div>
              <p className="verve-section__intro">
                Browse by tone and keep the first line confident without sounding forced.
              </p>
              <ChipGroup
                labelFor={(value) => OPENER_CATEGORY_LABELS[value]}
                onSelect={(value) => {
                  setOpenerCategory(value)
                  setOpenerIndex(0)
                }}
                options={OPENER_CATEGORY_OPTIONS}
                selected={openerCategory}
              />
              {currentOpener ? (
                <div className="verve-stage">
                  <div className="verve-stage__meta">
                    <Badge variant="outline">{OPENER_CATEGORY_LABELS[currentOpener.category]}</Badge>
                    <p className="m-0 text-sm text-muted-foreground">
                      {String(clampIndex(openerIndex, filteredOpeners.length) + 1).padStart(2, "0")} /{" "}
                      {String(filteredOpeners.length).padStart(2, "0")}
                    </p>
                  </div>
                  <p className="verve-stage__text">{currentOpener.text}</p>
                  <Toolbar
                    onCopy={() => copyText(currentOpener.text)}
                    onNext={() => setOpenerIndex((current) => getNextIndex(current, filteredOpeners.length))}
                    onPrevious={() =>
                      setOpenerIndex((current) => getPreviousIndex(current, filteredOpeners.length))
                    }
                    onSave={() => onToggleSave(currentOpener, "opener")}
                    onShuffle={() =>
                      setOpenerIndex((current) => getRandomIndex(filteredOpeners.length, current))
                    }
                    saved={openerSaved}
                  />
                </div>
              ) : null}
              <div className="dashboard-list">
                {filteredOpeners.slice(0, 8).map((item) => (
                  <ListRow
                    key={item.id}
                    isSaved={savedItems.some((savedItem) => savedItem.id === item.id)}
                    item={item}
                    onCopy={(selectedPrompt) => void copyText(selectedPrompt.text)}
                    onToggleSave={onToggleSave}
                  />
                ))}
              </div>
            </div>
          </section>

          <section
            className="verve-section"
            data-section="topics"
            ref={(element) => {
              sectionRefs.current.topics = element
            }}
          >
            <div className="verve-section__body">
              <div className="verve-section__header">
                <div className="grid gap-3">
                  <Badge variant="outline">Topics</Badge>
                  <h2 className="verve-section__title">Keep the conversation moving naturally.</h2>
                </div>
                <p className="verve-section__count">{filteredTopics.length} ideas</p>
              </div>
              <p className="verve-section__intro">
                Use these when you want something easy to say next without reaching.
              </p>
              <ChipGroup
                labelFor={(value) => SMALL_TALK_CATEGORY_LABELS[value]}
                onSelect={(value) => {
                  setTopicCategory(value)
                  setTopicIndex(0)
                }}
                options={SMALL_TALK_CATEGORY_OPTIONS}
                selected={topicCategory}
              />
              {currentTopic ? (
                <div className="verve-stage">
                  <div className="verve-stage__meta">
                    <Badge variant="outline">{SMALL_TALK_CATEGORY_LABELS[currentTopic.category]}</Badge>
                    <p className="m-0 text-sm text-muted-foreground">
                      {String(clampIndex(topicIndex, filteredTopics.length) + 1).padStart(2, "0")} /{" "}
                      {String(filteredTopics.length).padStart(2, "0")}
                    </p>
                  </div>
                  <p className="verve-stage__text">{currentTopic.text}</p>
                  <Toolbar
                    onCopy={() => copyText(currentTopic.text)}
                    onNext={() => setTopicIndex((current) => getNextIndex(current, filteredTopics.length))}
                    onPrevious={() =>
                      setTopicIndex((current) => getPreviousIndex(current, filteredTopics.length))
                    }
                    onSave={() => onToggleSave(currentTopic, "topic")}
                    onShuffle={() =>
                      setTopicIndex((current) => getRandomIndex(filteredTopics.length, current))
                    }
                    saved={topicSaved}
                  />
                </div>
              ) : null}
              <div className="dashboard-list">
                {filteredTopics.slice(0, 8).map((item) => (
                  <ListRow
                    key={item.id}
                    isSaved={savedItems.some((savedItem) => savedItem.id === item.id)}
                    item={item}
                    onCopy={(selectedPrompt) => void copyText(selectedPrompt.text)}
                    onToggleSave={onToggleSave}
                  />
                ))}
              </div>
            </div>
          </section>

          <section
            className="verve-section"
            data-section="saved"
            ref={(element) => {
              sectionRefs.current.saved = element
            }}
          >
            <div className="verve-section__body">
              <div className="verve-section__header">
                <div className="grid gap-3">
                  <Badge variant="outline">Saved</Badge>
                  <h2 className="verve-section__title">Keep the strongest lines close.</h2>
                </div>
                <p className="verve-section__count">{filteredSaved.length} saved</p>
              </div>
              <p className="verve-section__intro">
                Everything saved here stays on this device and is ready for the next conversation.
              </p>
              <SavedList
                items={filteredSaved}
                onCopy={(value) => void copyText(value)}
                onRemove={saveOrRemove}
              />
            </div>
          </section>

          <section
            className="verve-section"
            data-section="about"
            ref={(element) => {
              sectionRefs.current.about = element
            }}
          >
            <div className="verve-section__body">
              <div className="verve-section__header">
                <div className="grid gap-3">
                  <Badge variant="outline">About</Badge>
                  <h2 className="verve-section__title">Fast enough for real timing.</h2>
                </div>
                <p className="verve-section__count">{userName}</p>
              </div>
              <div className="dashboard-about-grid">
                <div className="dashboard-about-stat">
                  <p className="dashboard-about-stat__label">Signed in</p>
                  <p className="dashboard-about-stat__value">{userEmail}</p>
                </div>
                <div className="dashboard-about-stat">
                  <p className="dashboard-about-stat__label">Library</p>
                  <p className="dashboard-about-stat__value">
                    {prompts.length + openers.length + smallTalkTopics.length} lines
                  </p>
                </div>
                <div className="dashboard-about-stat">
                  <p className="dashboard-about-stat__label">Saved</p>
                  <p className="dashboard-about-stat__value">{savedItems.length} on device</p>
                </div>
              </div>
              <div className="dashboard-about-copy">
                {ABOUT_COPY.filter((item) => !query.trim() || fuzzyScore(query, item) > 0).map((item) => (
                  <p key={item} className="m-0">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </section>
          </div>
        </div>

        <div aria-live="polite" className={cn("copy-toast", copyStatus && "copy-toast--visible")}>
          {copyStatus}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

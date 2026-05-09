"use client";

import { startTransition, useEffect, useMemo, useState } from "react";

import {
  AUDIENCE_OPTIONS,
  formatAudienceLabel,
  openers,
  OPENER_CATEGORY_LABELS,
  OPENER_CATEGORY_OPTIONS,
  prompts,
  smallTalkTopics,
  SMALL_TALK_CATEGORY_LABELS,
  SMALL_TALK_CATEGORY_OPTIONS,
} from "../../shared";
import type {
  AudienceCategory,
  OpenerCategory,
  Prompt,
  SmallTalkCategory,
} from "../../shared";

type TabKey = "replies" | "openers" | "topics" | "saved";

type SavedItem = {
  id: string;
  category: string;
  kind: "reply" | "opener" | "topic";
  text: string;
};

const STORAGE_KEY = "verve:web:v1";
const SAVED_KEY = "verve:web:saved:v1";

function clampIndex(index: number, size: number) {
  if (size <= 0) {
    return 0;
  }

  return ((index % size) + size) % size;
}

function nextIndex(index: number, size: number) {
  return clampIndex(index + 1, size);
}

function previousIndex(index: number, size: number) {
  return clampIndex(index - 1, size);
}

function randomIndex(currentIndex: number, size: number) {
  if (size <= 1) {
    return 0;
  }

  let candidate = currentIndex;

  while (candidate === currentIndex) {
    candidate = Math.floor(Math.random() * size);
  }

  return candidate;
}

export function PromptDashboard({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("replies");
  const [selectedAudience, setSelectedAudience] = useState<AudienceCategory>("all");
  const [replyIndex, setReplyIndex] = useState(0);
  const [openerCategory, setOpenerCategory] = useState<OpenerCategory>("all");
  const [openerIndex, setOpenerIndex] = useState(0);
  const [topicCategory, setTopicCategory] = useState<SmallTalkCategory>("all");
  const [topicIndex, setTopicIndex] = useState(0);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [copyStatus, setCopyStatus] = useState("");

  const filteredReplies = useMemo(
    () =>
      selectedAudience === "all"
        ? prompts
        : prompts.filter((prompt) =>
            prompt.audiences?.includes(selectedAudience as Exclude<AudienceCategory, "all">),
          ),
    [selectedAudience],
  );

  const filteredOpeners = useMemo(
    () =>
      openerCategory === "all"
        ? openers
        : openers.filter((item) => item.category === openerCategory),
    [openerCategory],
  );

  const filteredTopics = useMemo(
    () =>
      topicCategory === "all"
        ? smallTalkTopics
        : smallTalkTopics.filter((item) => item.category === topicCategory),
    [topicCategory],
  );

  const currentReply = filteredReplies[clampIndex(replyIndex, filteredReplies.length)] ?? null;
  const currentOpener = filteredOpeners[clampIndex(openerIndex, filteredOpeners.length)] ?? null;
  const currentTopic = filteredTopics[clampIndex(topicIndex, filteredTopics.length)] ?? null;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const savedRaw = window.localStorage.getItem(SAVED_KEY);

      if (raw) {
        const parsed = JSON.parse(raw) as Partial<{
          selectedAudience: AudienceCategory;
          replyIndex: number;
          openerCategory: OpenerCategory;
          openerIndex: number;
          topicCategory: SmallTalkCategory;
          topicIndex: number;
        }>;

        if (parsed.selectedAudience && AUDIENCE_OPTIONS.includes(parsed.selectedAudience)) {
          setSelectedAudience(parsed.selectedAudience);
        }

        if (parsed.openerCategory && OPENER_CATEGORY_OPTIONS.includes(parsed.openerCategory)) {
          setOpenerCategory(parsed.openerCategory);
        }

        if (parsed.topicCategory && SMALL_TALK_CATEGORY_OPTIONS.includes(parsed.topicCategory)) {
          setTopicCategory(parsed.topicCategory);
        }

        setReplyIndex(typeof parsed.replyIndex === "number" ? parsed.replyIndex : 0);
        setOpenerIndex(typeof parsed.openerIndex === "number" ? parsed.openerIndex : 0);
        setTopicIndex(typeof parsed.topicIndex === "number" ? parsed.topicIndex : 0);
      }

      if (savedRaw) {
        const parsedSaved = JSON.parse(savedRaw) as unknown;
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
          );
        }
      }
    } catch {
      // Ignore local persistence failures on boot.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          selectedAudience,
          replyIndex,
          openerCategory,
          openerIndex,
          topicCategory,
          topicIndex,
        }),
      );
    } catch {
      // Ignore local persistence failures during browsing.
    }
  }, [
    openerCategory,
    openerIndex,
    replyIndex,
    selectedAudience,
    topicCategory,
    topicIndex,
  ]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SAVED_KEY, JSON.stringify(savedItems));
    } catch {
      // Ignore local persistence failures during save actions.
    }
  }, [savedItems]);

  useEffect(() => {
    setReplyIndex((current) => clampIndex(current, filteredReplies.length));
  }, [filteredReplies.length]);

  useEffect(() => {
    setOpenerIndex((current) => clampIndex(current, filteredOpeners.length));
  }, [filteredOpeners.length]);

  useEffect(() => {
    setTopicIndex((current) => clampIndex(current, filteredTopics.length));
  }, [filteredTopics.length]);

  function remember(item: SavedItem) {
    startTransition(() => {
      setSavedItems((current) =>
        current.some((entry) => entry.id === item.id)
          ? current.filter((entry) => entry.id !== item.id)
          : [item, ...current],
      );
    });
  }

  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus("Copied.");
    } catch {
      setCopyStatus("Clipboard access failed.");
    }
  }

  const replySaved = currentReply ? savedItems.some((item) => item.id === currentReply.id) : false;
  const openerSaved = currentOpener
    ? savedItems.some((item) => item.id === currentOpener.id)
    : false;
  const topicSaved = currentTopic ? savedItems.some((item) => item.id === currentTopic.id) : false;

  return (
    <section className="dashboard-card">
      <div className="dashboard-column">
        <div className="tab-row">
          {[
            ["replies", "Replies"],
            ["openers", "Openers"],
            ["topics", "Topics"],
            ["saved", "Saved"],
          ].map(([key, label]) => (
            <button
              key={key}
              className="tab-button"
              data-selected={activeTab === key}
              onClick={() => setActiveTab(key as TabKey)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === "replies" && currentReply ? (
          <div className="section-stack">
            <div className="section-header">
              <div>
                <p className="section-kicker">Replies</p>
                <h2 className="section-title">{currentReply.category}</h2>
              </div>
              <span className="saved-count">{filteredReplies.length} prompts</span>
            </div>

            <div className="audience-grid">
              {AUDIENCE_OPTIONS.map((value) => (
                <button
                  key={value}
                  className="mini-button"
                  data-selected={selectedAudience === value}
                  onClick={() => {
                    setSelectedAudience(value);
                    setReplyIndex(0);
                  }}
                  type="button"
                >
                  {formatAudienceLabel(value)}
                </button>
              ))}
            </div>

            <article className="prompt-card">
              <p className="saved-label">{currentReply.category}</p>
              <p className="prompt-text">{currentReply.text}</p>
            </article>

            <div className="prompt-actions">
              <button
                className="mini-button"
                onClick={() =>
                  setReplyIndex((current) => previousIndex(current, filteredReplies.length))
                }
                type="button"
              >
                Previous
              </button>
              <button
                className="mini-button"
                onClick={() => setReplyIndex((current) => nextIndex(current, filteredReplies.length))}
                type="button"
              >
                Next
              </button>
              <button
                className="mini-button"
                onClick={() =>
                  setReplyIndex((current) => randomIndex(current, filteredReplies.length))
                }
                type="button"
              >
                Shuffle
              </button>
              <button className="copy-button" onClick={() => copyText(currentReply.text)} type="button">
                Copy
              </button>
              <button
                className="mini-button"
                onClick={() =>
                  remember({
                    id: currentReply.id,
                    category: currentReply.category ?? "reply",
                    kind: "reply",
                    text: currentReply.text,
                  })
                }
                type="button"
              >
                {replySaved ? "Unsave" : "Save"}
              </button>
            </div>
          </div>
        ) : null}

        {activeTab === "openers" && currentOpener ? (
          <div className="section-stack">
            <div className="section-header">
              <div>
                <p className="section-kicker">Openers</p>
                <h2 className="section-title">{OPENER_CATEGORY_LABELS[currentOpener.category]}</h2>
              </div>
              <span className="saved-count">{filteredOpeners.length} openers</span>
            </div>

            <div className="chip-row">
              {OPENER_CATEGORY_OPTIONS.map((value) => (
                <button
                  key={value}
                  className="mini-button"
                  data-selected={openerCategory === value}
                  onClick={() => {
                    setOpenerCategory(value);
                    setOpenerIndex(0);
                  }}
                  type="button"
                >
                  {OPENER_CATEGORY_LABELS[value]}
                </button>
              ))}
            </div>

            <article className="prompt-card">
              <p className="saved-label">{OPENER_CATEGORY_LABELS[currentOpener.category]}</p>
              <p className="prompt-text">{currentOpener.text}</p>
            </article>

            <div className="prompt-actions">
              <button
                className="mini-button"
                onClick={() =>
                  setOpenerIndex((current) => previousIndex(current, filteredOpeners.length))
                }
                type="button"
              >
                Previous
              </button>
              <button
                className="mini-button"
                onClick={() => setOpenerIndex((current) => nextIndex(current, filteredOpeners.length))}
                type="button"
              >
                Next
              </button>
              <button
                className="mini-button"
                onClick={() =>
                  setOpenerIndex((current) => randomIndex(current, filteredOpeners.length))
                }
                type="button"
              >
                Shuffle
              </button>
              <button className="copy-button" onClick={() => copyText(currentOpener.text)} type="button">
                Copy
              </button>
              <button
                className="mini-button"
                onClick={() =>
                  remember({
                    id: currentOpener.id,
                    category: currentOpener.category,
                    kind: "opener",
                    text: currentOpener.text,
                  })
                }
                type="button"
              >
                {openerSaved ? "Unsave" : "Save"}
              </button>
            </div>
          </div>
        ) : null}

        {activeTab === "topics" && currentTopic ? (
          <div className="section-stack">
            <div className="section-header">
              <div>
                <p className="section-kicker">Small Talk</p>
                <h2 className="section-title">{SMALL_TALK_CATEGORY_LABELS[currentTopic.category]}</h2>
              </div>
              <span className="saved-count">{filteredTopics.length} prompts</span>
            </div>

            <div className="chip-row">
              {SMALL_TALK_CATEGORY_OPTIONS.map((value) => (
                <button
                  key={value}
                  className="mini-button"
                  data-selected={topicCategory === value}
                  onClick={() => {
                    setTopicCategory(value);
                    setTopicIndex(0);
                  }}
                  type="button"
                >
                  {SMALL_TALK_CATEGORY_LABELS[value]}
                </button>
              ))}
            </div>

            <article className="prompt-card">
              <p className="saved-label">{SMALL_TALK_CATEGORY_LABELS[currentTopic.category]}</p>
              <p className="prompt-text">{currentTopic.text}</p>
            </article>

            <div className="prompt-actions">
              <button
                className="mini-button"
                onClick={() => setTopicIndex((current) => previousIndex(current, filteredTopics.length))}
                type="button"
              >
                Previous
              </button>
              <button
                className="mini-button"
                onClick={() => setTopicIndex((current) => nextIndex(current, filteredTopics.length))}
                type="button"
              >
                Next
              </button>
              <button
                className="mini-button"
                onClick={() => setTopicIndex((current) => randomIndex(current, filteredTopics.length))}
                type="button"
              >
                Shuffle
              </button>
              <button className="copy-button" onClick={() => copyText(currentTopic.text)} type="button">
                Copy
              </button>
              <button
                className="mini-button"
                onClick={() =>
                  remember({
                    id: currentTopic.id,
                    category: currentTopic.category,
                    kind: "topic",
                    text: currentTopic.text,
                  })
                }
                type="button"
              >
                {topicSaved ? "Unsave" : "Save"}
              </button>
            </div>
          </div>
        ) : null}

        {activeTab === "saved" ? (
          <div className="section-stack">
            <div className="section-header">
              <div>
                <p className="section-kicker">Saved</p>
                <h2 className="section-title">Pinned prompts</h2>
              </div>
              <span className="saved-count">{savedItems.length} items</span>
            </div>

            {savedItems.length > 0 ? (
              <div className="saved-grid">
                {savedItems.map((item) => (
                  <article key={item.id} className="saved-card">
                    <div className="saved-topline">
                      <span className="saved-label">
                        {item.kind} / {item.category}
                      </span>
                      <button
                        className="mini-button"
                        onClick={() => remember(item)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="saved-text">{item.text}</p>
                    <div className="prompt-actions">
                      <button className="copy-button" onClick={() => copyText(item.text)} type="button">
                        Copy
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="empty-state">Save prompts from any tab to keep them here.</p>
            )}
          </div>
        ) : null}

        <p className="copy-status">{copyStatus}</p>
      </div>

      <aside className="dashboard-column">
        <div className="section-stack">
          <div>
            <p className="section-kicker">Profile</p>
            <h2 className="section-title">{userName}</h2>
            <p className="section-subtle">{userEmail}</p>
          </div>

          <div className="stats-grid">
            <div className="meta-pill">
              <strong>{prompts.length}</strong>
              <span>Shared replies</span>
            </div>
            <div className="meta-pill">
              <strong>{openers.length}</strong>
              <span>Shared openers</span>
            </div>
            <div className="meta-pill">
              <strong>{smallTalkTopics.length}</strong>
              <span>Shared topics</span>
            </div>
            <div className="meta-pill">
              <strong>{savedItems.length}</strong>
              <span>Saved locally on this device</span>
            </div>
          </div>

          <article className="prompt-card">
            <h3 className="section-title">How shared content works</h3>
            <p className="footer-note">
              The web app imports prompt data from the repo-level shared export layer, which
              re-exports the existing `data/` modules. Adding a new prompt remains a single edit.
            </p>
          </article>

          <article className="prompt-card">
            <h3 className="section-title">PWA notes</h3>
            <p className="footer-note">
              The app registers a service worker, exposes a manifest, and caches core assets for a
              faster installed experience. Authentication still requires network access.
            </p>
          </article>
        </div>
      </aside>
    </section>
  );
}

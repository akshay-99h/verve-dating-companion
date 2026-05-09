import Link from "next/link";

import FlowArt, { FlowSection } from "@/components/ui/story-scroll";

const imageA =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80";
const imageB =
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80";
const imageC =
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80";
const imageD =
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1200&q=80";

function MoodCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="min-w-[200px] flex-1 rounded-[1.75rem] border border-black/10 bg-white/70 p-5 shadow-[0_24px_80px_rgba(20,16,12,0.08)] backdrop-blur">
      <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-black/45">
        {title}
      </p>
      <p className="text-base leading-7 text-black/72">{body}</p>
    </div>
  );
}

function ImagePanel({
  image,
  alt,
  className = "",
}: {
  image: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      aria-label={alt}
      className={`overflow-hidden rounded-[2rem] border border-black/10 bg-[#f3ede6] ${className}`}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(17, 13, 9, 0.02), rgba(17, 13, 9, 0.24)), url(${image})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    />
  );
}

export default function FlowArtDefaultDemo() {
  return (
    <FlowArt aria-label="Verve introduction">
      <FlowSection aria-label="What Verve is" style={{ backgroundColor: "#f5efe8", color: "#21170f" }}>
        <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#9e5d3d]">
                01 — Meet Verve
              </p>
              <h1 className="max-w-5xl text-[clamp(3.75rem,11vw,9rem)] font-semibold uppercase leading-[0.88] tracking-[-0.06em]">
                Say more.
                <br />
                Freeze less.
                <br />
                Feel natural.
              </h1>
            </div>
            <div className="max-w-md rounded-[2rem] border border-black/10 bg-white/65 p-6 shadow-[0_24px_80px_rgba(20,16,12,0.08)] backdrop-blur">
              <p className="text-lg leading-8 text-black/70">
                Verve helps you move from staring at the screen to sending something that actually
                sounds like you. It gives you a better starting point when you want to flirt,
                reply, keep things playful, or simply avoid another flat conversation.
              </p>
            </div>
          </div>

          <div className="grid flex-1 gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <ImagePanel image={imageA} alt="Warm portrait" className="min-h-[22rem]" />
            <div className="flex flex-col justify-between gap-6 rounded-[2rem] border border-black/10 bg-[#fff8f1] p-6 shadow-[0_24px_80px_rgba(20,16,12,0.06)]">
              <div>
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-black/45">
                  Built for real moments
                </p>
                <p className="text-[clamp(1.25rem,2.2vw,2rem)] leading-[1.5] text-black/78">
                  Whether you want a clever opener, a softer reply, or something with more spark,
                  Verve helps you find the tone without turning every message into work.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#21170f] px-6 text-sm font-semibold text-[#fff8f1] transition hover:-translate-y-0.5"
                  href="/signup"
                >
                  Start with Verve
                </Link>
                <Link
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-black/10 bg-white px-6 text-sm font-semibold text-[#21170f] transition hover:-translate-y-0.5"
                  href="/login"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </FlowSection>

      <FlowSection aria-label="How Verve helps" style={{ backgroundColor: "#1f1712", color: "#fff8f1" }}>
        <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">
            02 — What it helps you do
          </p>
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <h2 className="text-[clamp(3.25rem,10vw,8rem)] font-semibold uppercase leading-[0.88] tracking-[-0.06em]">
                Find the right energy for the moment.
              </h2>
            </div>
            <p className="max-w-2xl text-[clamp(1.15rem,2vw,1.7rem)] leading-[1.7] text-white/72">
              Some chats need warmth. Some need edge. Some need a line that opens the door without
              trying too hard. Verve gives you choices that match the mood you want to create.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <MoodCard
              title="Openers"
              body="For when you want the first message to feel confident, playful, and actually worth replying to."
            />
            <MoodCard
              title="Replies"
              body="For when the conversation has started, but you want to keep it moving without sounding rehearsed."
            />
            <MoodCard
              title="Small talk"
              body="For when you want an easy way to keep things flowing and turn a basic exchange into something more personal."
            />
          </div>

          <div className="grid flex-1 gap-6 md:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-white/50">
                A better starting place
              </p>
              <ul className="space-y-4 text-lg leading-8 text-white/76">
                <li>Choose a vibe that feels like you.</li>
                <li>Browse lines until one clicks.</li>
                <li>Save the ones you want to keep close.</li>
                <li>Use them as-is or make them your own.</li>
              </ul>
            </div>
            <ImagePanel image={imageB} alt="Conversation confidence" className="min-h-[22rem]" />
          </div>
        </div>
      </FlowSection>

      <FlowSection aria-label="Why people use Verve" style={{ backgroundColor: "#f8f3ec", color: "#140f0a" }}>
        <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            03 — Why it feels different
          </p>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <h2 className="text-[clamp(3.25rem,10vw,8rem)] font-semibold uppercase leading-[0.88] tracking-[-0.06em]">
                Less second-guessing.
                <br />
                More momentum.
              </h2>
            </div>
            <div className="rounded-[2rem] border border-black/10 bg-white/80 p-6 shadow-[0_24px_80px_rgba(20,16,12,0.06)]">
              <p className="text-[clamp(1.15rem,1.8vw,1.45rem)] leading-[1.75] text-black/72">
                Verve is for the moments when you know what you want to say in spirit, but not in
                words yet. It helps you get unstuck quickly and stay in the conversation instead of
                overthinking it.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-6 md:grid-cols-2">
              <MoodCard
                title="Natural variety"
                body="Different tones for different people, moods, and situations, so everything does not start sounding the same."
              />
              <MoodCard
                title="Personal rhythm"
                body="Keep the lines that fit you best and come back to them whenever you want a faster start."
              />
              <MoodCard
                title="Easy browsing"
                body="Move through ideas quickly until one feels right instead of staring at a blank message box."
              />
              <MoodCard
                title="Room to adapt"
                body="Use a line directly or tweak it into your own voice. The point is flow, not perfection."
              />
            </div>
            <ImagePanel image={imageC} alt="Relaxed confidence" className="min-h-[26rem]" />
          </div>
        </div>
      </FlowSection>

      <FlowSection aria-label="How Verve fits into your day" style={{ backgroundColor: "#c55f3f", color: "#fff9f2" }}>
        <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
            04 — Everyday use
          </p>
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-white/14 bg-white/8 p-6 backdrop-blur">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-white/55">
                Picture this
              </p>
              <p className="text-[clamp(1.25rem,2.2vw,1.9rem)] leading-[1.7] text-white/82">
                You spot a profile you like. You want to say something better than a flat hello.
                Or the chat is moving, but you want to steer it somewhere more fun, softer,
                bolder, or more memorable. Verve gives you options fast, so the moment does not go
                cold.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-[0.7fr_1.3fr]">
              <ImagePanel image={imageD} alt="Playful date energy" className="min-h-[22rem]" />
              <div className="grid gap-6">
                <MoodCard
                  title="When you are in a rush"
                  body="Open the app, pick a section, copy what fits, and move."
                />
                <MoodCard
                  title="When you want to browse"
                  body="Shuffle through ideas until you land on something that feels playful, warm, direct, or smooth."
                />
                <MoodCard
                  title="When you find your favorites"
                  body="Save the ones that match your style and build your own personal bench of go-to lines."
                />
              </div>
            </div>
          </div>
        </div>
      </FlowSection>

      <FlowSection aria-label="Call to action" style={{ backgroundColor: "#101010", color: "#fff9f2" }}>
        <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-between gap-10">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-white/45">
              05 — Start here
            </p>
            <h2 className="max-w-5xl text-[clamp(3.5rem,11vw,8.5rem)] font-semibold uppercase leading-[0.88] tracking-[-0.06em]">
              Better openings.
              <br />
              Better replies.
              <br />
              More flow.
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <p className="max-w-3xl text-[clamp(1.15rem,2vw,1.7rem)] leading-[1.75] text-white/68">
              Verve is here when you want a stronger first move, a better follow-up, or a lighter
              way to keep the conversation going. Start with an idea, make it yours, and send it
              with more confidence.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#fff7ef] px-6 text-sm font-semibold text-[#140f0a] transition hover:-translate-y-0.5"
                href="/signup"
              >
                Create your account
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/6 px-6 text-sm font-semibold text-[#fff9f2] transition hover:-translate-y-0.5"
                href="/login"
              >
                I already have one
              </Link>
            </div>
          </div>
        </div>
      </FlowSection>
    </FlowArt>
  );
}

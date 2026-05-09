import Link from "next/link";

import FlowArt, { FlowSection } from "@/components/ui/story-scroll";

const imageA =
  "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80";
const imageB =
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80";
const imageC =
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80";
const imageD =
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1200&q=80";

function Rule({ light = false }: { light?: boolean }) {
  return <hr className={light ? "border-white/18" : "border-black/12"} />;
}

function ImageAside({
  image,
  alt,
  className = "",
}: {
  image: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="relative min-h-[18rem] w-full overflow-hidden bg-[#e9ded1]">
        <img
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          src={image}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,13,9,0.08),rgba(17,13,9,0.28))]" />
      </div>
      <p className="text-sm leading-6 opacity-65">{alt}</p>
    </div>
  );
}

function ActionLink({
  href,
  tone,
  children,
}: {
  href: string;
  tone: "light" | "dark";
  children: React.ReactNode;
}) {
  const classes =
    tone === "light"
      ? "border-[#1b120c] bg-[#1b120c] text-[#fff7ef]"
      : "border-white/16 bg-transparent text-[#fff7ef]";

  return (
    <Link
      className={`inline-flex min-h-[68px] items-center justify-center rounded-full border px-9 text-lg font-semibold tracking-[-0.02em] whitespace-nowrap transition hover:-translate-y-0.5 ${classes}`}
      href={href}
    >
      {children}
    </Link>
  );
}

export default function FlowArtDefaultDemo() {
  return (
    <FlowArt aria-label="Verve introduction">
      <FlowSection aria-label="Verve hero" style={{ backgroundColor: "#f5efe8", color: "#1d140e" }}>
        <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-between gap-8">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#9e5d3d]">
            00 — Verve
          </p>
          <div className="grid flex-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="max-w-6xl">
              <h1 className="text-[clamp(5rem,16vw,13rem)] font-semibold uppercase leading-[0.82] tracking-[-0.08em]">
                Verve
              </h1>
              <p className="mt-6 max-w-3xl text-[clamp(1.4rem,2.5vw,2.3rem)] leading-[1.45] text-black/72">
                Better words for better timing.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="relative min-h-[26rem] w-full overflow-hidden bg-[#eadfd1]">
                <img
                  alt="People in conversation and sharing a laugh."
                  className="absolute inset-0 h-full w-full object-cover"
                  src={imageA}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,13,9,0.06),rgba(17,13,9,0.18))]" />
              </div>
              <p className="max-w-md text-sm leading-6 text-black/62">
                The kind of moment that feels easier when the first words land well.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <ActionLink href="/signup" tone="light">
              Start with Verve
            </ActionLink>
            <Link
              className="inline-flex min-h-[68px] items-center justify-center rounded-full border border-black/12 px-9 text-lg font-semibold tracking-[-0.02em] text-[#1d140e] whitespace-nowrap transition hover:-translate-y-0.5"
              href="/login"
            >
              Sign in
            </Link>
          </div>
        </div>
      </FlowSection>

      <FlowSection aria-label="What Verve is" style={{ backgroundColor: "#f5efe8", color: "#21170f" }}>
        <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-8">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#9e5d3d]">
            01 — Meet Verve
          </p>
          <Rule />
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <h2 className="text-[clamp(3.9rem,11vw,9.5rem)] font-semibold uppercase leading-[0.84] tracking-[-0.07em]">
              Say more.
              <br />
              Freeze less.
              <br />
              Feel natural.
            </h2>
            <div className="flex flex-col justify-between gap-8">
              <p className="text-[clamp(1.2rem,1.9vw,1.6rem)] leading-[1.75] text-black/72">
                Verve helps you move from staring at the screen to sending something that actually
                sounds like you. It gives you a better starting point when you want to flirt,
                reply, keep things playful, or simply avoid another flat conversation.
              </p>
              <div className="flex flex-wrap gap-4">
                <ActionLink href="/signup" tone="light">
                  Start with Verve
                </ActionLink>
                <Link
                  className="inline-flex min-h-[68px] items-center justify-center rounded-full border border-black/12 px-9 text-lg font-semibold tracking-[-0.02em] text-[#1d140e] whitespace-nowrap transition hover:-translate-y-0.5"
                  href="/login"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
          <Rule />
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <p className="max-w-3xl text-[clamp(1.25rem,2vw,1.95rem)] leading-[1.55] text-black/80">
              Whether you want a clever opener, a softer reply, or something with more spark,
              Verve helps you find the tone without turning every message into work.
            </p>
            <ImageAside image={imageA} alt="A calm, confident energy that feels easy to reply to." />
          </div>
        </div>
      </FlowSection>

      <FlowSection aria-label="How Verve helps" style={{ backgroundColor: "#1f1712", color: "#fff8f1" }}>
        <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-8">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/55">
            02 — What it helps you do
          </p>
          <Rule light />
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <h2 className="text-[clamp(3.25rem,10vw,8.4rem)] font-semibold uppercase leading-[0.84] tracking-[-0.07em]">
              Find the right energy for the moment.
            </h2>
            <p className="max-w-2xl text-[clamp(1.15rem,2vw,1.7rem)] leading-[1.75] text-white/74">
              Some chats need warmth. Some need edge. Some need a line that opens the door without
              trying too hard. Verve gives you choices that match the mood you want to create.
            </p>
          </div>
          <Rule light />
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-8">
              <div className="grid gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/52">Openers</p>
                <p className="text-xl leading-9 text-white/82">
                  For when you want the first message to feel confident, playful, and actually
                  worth replying to.
                </p>
              </div>
              <Rule light />
              <div className="grid gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/52">Replies</p>
                <p className="text-xl leading-9 text-white/82">
                  For when the conversation has started, but you want to keep it moving without
                  sounding rehearsed.
                </p>
              </div>
              <Rule light />
              <div className="grid gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/52">Small talk</p>
                <p className="text-xl leading-9 text-white/82">
                  For when you want an easy way to keep things flowing and turn a basic exchange
                  into something more personal.
                </p>
              </div>
            </div>
            <ImageAside image={imageB} alt="A side glance that keeps the conversation moving." />
          </div>
          <Rule light />
          <ul className="grid gap-4 text-lg leading-8 text-white/78 md:grid-cols-2">
            <li>Choose a vibe that feels like you.</li>
            <li>Browse lines until one clicks.</li>
            <li>Save the ones you want to keep close.</li>
            <li>Use them as-is or make them your own.</li>
          </ul>
        </div>
      </FlowSection>

      <FlowSection aria-label="Why people use Verve" style={{ backgroundColor: "#f8f3ec", color: "#140f0a" }}>
        <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-8">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-black/45">
            03 — Why it feels different
          </p>
          <Rule />
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <h2 className="text-[clamp(3.25rem,10vw,8.4rem)] font-semibold uppercase leading-[0.84] tracking-[-0.07em]">
              Less second-guessing.
              <br />
              More momentum.
            </h2>
            <p className="text-[clamp(1.15rem,1.8vw,1.45rem)] leading-[1.8] text-black/72">
              Verve is for the moments when you know what you want to say in spirit, but not in
              words yet. It helps you get unstuck quickly and stay in the conversation instead of
              overthinking it.
            </p>
          </div>
          <Rule />
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="grid gap-7">
              <div className="grid gap-2">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/45">Natural variety</p>
                <p className="text-xl leading-9 text-black/78">
                  Different tones for different people, moods, and situations, so everything does
                  not start sounding the same.
                </p>
              </div>
              <Rule />
              <div className="grid gap-2">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/45">Personal rhythm</p>
                <p className="text-xl leading-9 text-black/78">
                  Keep the lines that fit you best and come back to them whenever you want a faster
                  start.
                </p>
              </div>
              <Rule />
              <div className="grid gap-2">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/45">Easy browsing</p>
                <p className="text-xl leading-9 text-black/78">
                  Move through ideas quickly until one feels right instead of staring at a blank
                  message box.
                </p>
              </div>
              <Rule />
              <div className="grid gap-2">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/45">Room to adapt</p>
                <p className="text-xl leading-9 text-black/78">
                  Use a line directly or tweak it into your own voice. The point is flow, not
                  perfection.
                </p>
              </div>
            </div>
            <div className="self-end">
              <ImageAside image={imageC} alt="Words that feel smoother, lighter, and more like you." />
            </div>
          </div>
        </div>
      </FlowSection>

      <FlowSection aria-label="How Verve fits into your day" style={{ backgroundColor: "#c55f3f", color: "#fff9f2" }}>
        <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-8">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">
            04 — Everyday use
          </p>
          <Rule light />
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <h2 className="text-[clamp(3rem,9vw,7.8rem)] font-semibold uppercase leading-[0.84] tracking-[-0.07em]">
              Use it when the moment matters.
            </h2>
            <p className="text-[clamp(1.2rem,2vw,1.8rem)] leading-[1.75] text-white/82">
              You spot a profile you like. You want to say something better than a flat hello. Or
              the chat is moving, but you want to steer it somewhere more fun, softer, bolder, or
              more memorable. Verve gives you options fast, so the moment does not go cold.
            </p>
          </div>
          <Rule light />
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <ImageAside image={imageD} alt="A better first move, without overthinking it." />
            <div className="grid gap-7">
              <div className="grid gap-2">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/56">When you are in a rush</p>
                <p className="text-xl leading-9 text-white/82">
                  Open the app, pick a section, copy what fits, and move.
                </p>
              </div>
              <Rule light />
              <div className="grid gap-2">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/56">When you want to browse</p>
                <p className="text-xl leading-9 text-white/82">
                  Shuffle through ideas until you land on something that feels playful, warm,
                  direct, or smooth.
                </p>
              </div>
              <Rule light />
              <div className="grid gap-2">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/56">When you find your favorites</p>
                <p className="text-xl leading-9 text-white/82">
                  Save the ones that match your style and build your own personal bench of go-to
                  lines.
                </p>
              </div>
            </div>
          </div>
        </div>
      </FlowSection>

      <FlowSection aria-label="Call to action" style={{ backgroundColor: "#101010", color: "#fff9f2" }}>
        <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-between gap-10">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-white/45">
              05 — Start here
            </p>
            <h2 className="max-w-5xl text-[clamp(3.5rem,11vw,8.5rem)] font-semibold uppercase leading-[0.84] tracking-[-0.07em]">
              Better openings.
              <br />
              Better replies.
              <br />
              More flow.
            </h2>
          </div>
          <Rule light />
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <p className="max-w-3xl text-[clamp(1.15rem,2vw,1.7rem)] leading-[1.75] text-white/70">
              Verve is here when you want a stronger first move, a better follow-up, or a lighter
              way to keep the conversation going. Start with an idea, make it yours, and send it
              with more confidence.
            </p>
            <div className="flex flex-wrap gap-4">
              <ActionLink href="/signup" tone="dark">
                Create your account
              </ActionLink>
              <Link
                className="inline-flex min-h-[68px] items-center justify-center rounded-full border border-white/16 px-9 text-lg font-semibold tracking-[-0.02em] text-[#fff7ef] whitespace-nowrap transition hover:-translate-y-0.5"
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

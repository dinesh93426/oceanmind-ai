import { createFileRoute } from "@tanstack/react-router";
import {
  Bot,
  Copy,
  Download,
  FileUp,
  Loader2,
  Mic,
  Pin,
  Plus,
  Send,
  Share2,
  StickyNote,
  Waves,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { suggestedPrompts } from "@/lib/ocean-data";
import { sendOpenRouterChatMessage, type OpenRouterMessage } from "@/lib/openrouter-api";

export const Route = createFileRoute("/marine-ai")({
  head: () => ({
    meta: [
      { title: "Marine AI Research Assistant — AquaIntel AI" },
      {
        name: "description",
        content:
          "Ask AI marine research assistant about currents, coral reefs, species migration and oceanography.",
      },
      { property: "og:title", content: "Marine AI Research Assistant — AquaIntel AI" },
      {
        property: "og:description",
        content: "Research-grade ocean science chat assistant.",
      },
    ],
  }),
  component: MarineAI,
});

type Msg = {
  role: "user" | "assistant";
  content: string;
  error?: boolean;
};

const seedMessages: Msg[] = [
  { role: "user", content: "How do ocean currents affect tuna migration?" },
  {
    role: "assistant",
    content:
      "Tuna track thermal fronts rather than fixed routes. Western boundary currents such as the Kuroshio and Gulf Stream concentrate prey along sharp temperature gradients, so schools follow the 22–28 °C envelope as it shifts seasonally.\n\n| Driver | Effect on migration |\n| --- | --- |\n| Thermal fronts | Aggregation of prey and schooling |\n| Eddy fields | Localised feeding hotspots |\n| ENSO phase | Longitudinal displacement of stocks |\n\nReferences: Nakamura et al. 2026; Duarte & Mehta 2025.",
  },
];

function formatInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function renderContent(text: string) {
  return text.split("\n").map((line, i) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("### ")) {
      return (
        <h4 key={i} className="mt-3 mb-1 text-sm font-bold text-ocean-cyan">
          {formatInlineMarkdown(trimmed.replace(/^###\s+/, ""))}
        </h4>
      );
    }

    if (trimmed.startsWith("## ")) {
      return (
        <h3 key={i} className="mt-4 mb-2 text-base font-bold text-foreground">
          {formatInlineMarkdown(trimmed.replace(/^##\s+/, ""))}
        </h3>
      );
    }

    if (trimmed.startsWith("# ")) {
      return (
        <h2 key={i} className="mt-4 mb-2 text-lg font-extrabold text-foreground">
          {formatInlineMarkdown(trimmed.replace(/^#\s+/, ""))}
        </h2>
      );
    }

    if (trimmed.startsWith("|")) {
      const cells = trimmed.split("|").filter((c) => c.trim());
      const divider = cells.every((c) => /^[-\s:]+$/.test(c));
      if (divider) return null;
      return (
        <div key={i} className="grid grid-cols-2 gap-2 border-b border-border/60 py-1.5 text-xs sm:text-sm">
          {cells.map((c, j) => (
            <span key={j} className={j === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}>
              {formatInlineMarkdown(c.trim())}
            </span>
          ))}
        </div>
      );
    }

    if (/^[-–*]\s+/.test(trimmed)) {
      return (
        <li key={i} className="ml-4 list-disc text-sm leading-relaxed text-foreground/90">
          {formatInlineMarkdown(trimmed.replace(/^[-–*]\s+/, ""))}
        </li>
      );
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      return (
        <div key={i} className="ml-2 font-medium text-sm leading-relaxed text-foreground mt-1">
          {formatInlineMarkdown(trimmed)}
        </div>
      );
    }

    if (!trimmed) return <div key={i} className="h-2" />;

    return (
      <p key={i} className="text-sm leading-relaxed text-foreground/90">
        {formatInlineMarkdown(line)}
      </p>
    );
  });
}

function MarineAI() {
  const [messages, setMessages] = useState<Msg[]>(seedMessages);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  async function send(text: string) {
    const q = text.trim();
    if (!q || typing) return;

    const updatedUserMsgs = [...messages, { role: "user" as const, content: q }];
    setMessages(updatedUserMsgs);
    setInput("");
    setTyping(true);

    try {
      const historyPayload: OpenRouterMessage[] = updatedUserMsgs.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await sendOpenRouterChatMessage(historyPayload);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.content,
        },
      ]);
    } catch (err: unknown) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error from DeepSeek AI: ${err instanceof Error ? err.message : String(err)}`,
          error: true,
        },
      ]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 pt-12 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* Sidebar */}
      <aside className="glass hidden h-fit rounded-[2rem] p-5 lg:block">
        <Button variant="ocean" className="w-full" onClick={() => setMessages([])}>
          <Plus className="size-4" /> New chat
        </Button>
        <Section title="Recent Chats" items={["Tuna migration", "Red tide onset", "Reef bleaching"]} />
        <Section title="Pinned Research" items={["ENSO thermal niches", "MPA acoustics"]} icon={Pin} />
        <Section title="Saved Notes" items={["Survey plan Q3", "Sampling checklist"]} icon={StickyNote} />
      </aside>

      {/* Main Chat Container */}
      <section className="glass flex min-h-[75vh] flex-col rounded-[2rem] p-5">
        {/* Clean Header */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between border-b border-border/50 pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[image:var(--gradient-ocean)] text-primary-foreground shadow-[var(--shadow-glow)]">
              <Waves className="size-5" />
            </span>
            <div>
              <h1 className="truncate text-lg font-bold">AquaIntel Intelligence Assistant</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Powered by AquaIntel AI
              </p>
            </div>
          </div>

          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="icon" aria-label="Copy response" title="Copy last response">
              <Copy className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Download PDF" title="Export conversation">
              <Download className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Share" title="Share research">
              <Share2 className="size-4" />
            </Button>
          </div>
        </div>

        {/* Message History */}
        <ScrollArea className="mt-5 flex-1 pr-3">
          <div className="space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Bot className="size-12 mx-auto text-ocean-cyan opacity-80 mb-3" />
                <p className="font-semibold text-foreground">Welcome to AquaIntel AI Marine Assistant</p>
                <p className="text-xs mt-1">
                  Ask any research question about oceanography, sea temperatures, marine biology, or climate change.
                </p>
              </div>
            )}
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl bg-[image:var(--gradient-ocean)] px-4 py-3 text-sm text-primary-foreground shadow-[var(--shadow-glow)]">
                    {m.content}
                  </p>
                </div>
              ) : (
                <div
                  key={i}
                  className={`max-w-[92%] rounded-2xl p-4 border ${
                    m.error
                      ? "border-destructive/40 bg-destructive/10 text-destructive"
                      : "border-border/60 bg-secondary/30 text-foreground"
                  }`}
                >
                  <div className="space-y-1">{renderContent(m.content)}</div>
                </div>
              ),
            )}
            {typing && (
              <div className="flex items-center gap-2 text-muted-foreground p-3 rounded-2xl border border-border/40 bg-secondary/20 w-fit">
                <Loader2 className="size-4 animate-spin text-ocean-cyan" />
                <span className="text-xs">AquaIntel AI analyzing ocean data…</span>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggested Prompts */}
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestedPrompts.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              disabled={typing}
              className="rounded-full border border-border/80 bg-secondary/30 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-ocean-cyan/60 hover:text-foreground disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Text Input Area */}
        <div className="mt-4 rounded-2xl border border-border bg-secondary/40 p-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask AquaIntel AI about species, currents, climate or upload ocean data…"
            className="min-h-20 resize-none border-0 bg-transparent focus-visible:ring-0 text-sm"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" aria-label="Voice input" title="Voice input">
                <Mic className="size-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                <FileUp className="size-3.5 mr-1" /> PDF
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                <FileUp className="size-3.5 mr-1" /> Ocean data
              </Button>
            </div>
            <Button
              variant="ocean"
              size="icon"
              disabled={typing || !input.trim()}
              aria-label="Send"
              onClick={() => send(input)}
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Section({
  title,
  items,
  icon: Icon,
}: {
  title: string;
  items: string[];
  icon?: typeof Pin;
}) {
  return (
    <div className="mt-6">
      <h3 className="text-xs uppercase tracking-wide text-muted-foreground">{title}</h3>
      <ul className="mt-3 space-y-1">
        {items.map((i) => (
          <li
            key={i}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            {Icon && <Icon className="size-3.5 shrink-0" />}
            <span className="truncate">{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

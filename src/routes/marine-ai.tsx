import { createFileRoute } from "@tanstack/react-router";
import {
  Copy,
  Download,
  FileUp,
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

export const Route = createFileRoute("/marine-ai")({
  head: () => ({
    meta: [
      { title: "Marine AI Research Assistant — OceanMind AI" },
      {
        name: "description",
        content:
          "Ask an AI marine research assistant about currents, coral reefs, migration and blooms, with references and export options.",
      },
      { property: "og:title", content: "Marine AI Research Assistant — OceanMind AI" },
      {
        property: "og:description",
        content: "A research-grade ocean science chat assistant with citations and data uploads.",
      },
    ],
  }),
  component: MarineAI,
});

type Msg = { role: "user" | "assistant"; content: string };

const seed: Msg[] = [
  { role: "user", content: "How do ocean currents affect tuna migration?" },
  {
    role: "assistant",
    content:
      "Tuna track thermal fronts rather than fixed routes. Western boundary currents such as the Kuroshio and Gulf Stream concentrate prey along sharp temperature gradients, so schools follow the 22–28 °C envelope as it shifts seasonally.\n\n| Driver | Effect on migration |\n| --- | --- |\n| Thermal fronts | Aggregation of prey and schooling |\n| Eddy fields | Localised feeding hotspots |\n| ENSO phase | Longitudinal displacement of stocks |\n\nReferences: Nakamura et al. 2026; Duarte & Mehta 2025.",
  },
];

function renderContent(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("|")) {
      const cells = line.split("|").filter((c) => c.trim());
      const divider = cells.every((c) => /^[-\s]+$/.test(c));
      if (divider) return null;
      return (
        <div key={i} className="grid grid-cols-2 gap-2 border-b border-border py-2 text-sm">
          {cells.map((c, j) => (
            <span key={j} className={j === 0 ? "font-medium" : "text-muted-foreground"}>
              {c.trim()}
            </span>
          ))}
        </div>
      );
    }
    if (!line.trim()) return <div key={i} className="h-2" />;
    return (
      <p key={i} className="text-sm leading-relaxed">
        {line}
      </p>
    );
  });
}

function MarineAI() {
  const [messages, setMessages] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  function send(text: string) {
    const q = text.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Here is a research-grade summary based on the latest reanalysis products and the OceanMind literature index.\n\nKey points:\n– Regional signal is strongest in the upper 50 m mixed layer.\n– Anomalies of +0.4 °C shift species envelopes poleward within one season.\n– Confidence: moderate-high (ensemble agreement 0.78).\n\nReferences: OceanMind Library, 3 matching studies.",
        },
      ]);
    }, 1400);
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 pt-12 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="glass hidden h-fit rounded-[2rem] p-5 lg:block">
        <Button variant="ocean" className="w-full">
          <Plus className="size-4" /> New chat
        </Button>
        <Section title="Recent Chats" items={["Tuna migration", "Red tide onset", "Reef bleaching"]} />
        <Section title="Pinned Research" items={["ENSO thermal niches", "MPA acoustics"]} icon={Pin} />
        <Section title="Saved Notes" items={["Survey plan Q3", "Sampling checklist"]} icon={StickyNote} />
      </aside>

      <section className="glass flex min-h-[70vh] flex-col rounded-[2rem] p-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--gradient-ocean)] text-primary-foreground">
              <Waves className="size-4" />
            </span>
            <h1 className="truncate text-lg font-semibold">Ocean Research Assistant</h1>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="icon" aria-label="Copy response">
              <Copy className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Download PDF">
              <Download className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Share">
              <Share2 className="size-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="mt-5 flex-1">
          <div className="space-y-6 pr-3">
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl bg-primary px-4 py-3 text-sm text-primary-foreground">
                    {m.content}
                  </p>
                </div>
              ) : (
                <div key={i} className="max-w-[92%] space-y-1">{renderContent(m.content)}</div>
              ),
            )}
            {typing && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="size-2 animate-pulse-glow rounded-full bg-ocean-cyan"
                    style={{ animationDelay: `${d * 0.2}s` }}
                  />
                ))}
                <span className="ml-2 text-xs">Analyzing ocean literature…</span>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="mt-5 flex flex-wrap gap-2">
          {suggestedPrompts.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-ocean-cyan/50 hover:text-foreground"
            >
              {p}
            </button>
          ))}
        </div>

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
            placeholder="Ask about species, currents, climate or upload ocean data…"
            className="min-h-20 resize-none border-0 bg-transparent focus-visible:ring-0"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" aria-label="Voice input">
                <Mic className="size-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <FileUp className="size-4" /> PDF
              </Button>
              <Button variant="ghost" size="sm">
                <FileUp className="size-4" /> Ocean data
              </Button>
            </div>
            <Button variant="ocean" size="icon" aria-label="Send" onClick={() => send(input)}>
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

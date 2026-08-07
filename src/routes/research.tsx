import { createFileRoute } from "@tanstack/react-router";
import { Bookmark, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { researchPapers } from "@/lib/ocean-data";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Marine Research Library — OceanMind AI" },
      {
        name: "description",
        content:
          "Search and bookmark peer-reviewed marine science studies by species, location, climate and ecosystem.",
      },
      { property: "og:title", content: "Marine Research Library — OceanMind AI" },
      {
        property: "og:description",
        content: "A curated, filterable index of ocean and fisheries research publications.",
      },
    ],
  }),
  component: Research,
});

const filters = ["All", "Species", "Location", "Climate", "Ecosystem"] as const;

function Research() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [saved, setSaved] = useState<string[]>([]);

  const results = useMemo(
    () =>
      researchPapers.filter(
        (p) =>
          (filter === "All" || p.tags.includes(filter)) &&
          (p.title + p.authors + p.summary + p.region).toLowerCase().includes(query.toLowerCase()),
      ),
    [query, filter],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12">
      <h1 className="text-3xl font-bold sm:text-4xl">Marine Research Library</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        {researchPapers.length} curated studies across species, ecosystems and ocean climate.
      </p>

      <div className="glass mt-8 rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, authors, regions…"
            className="pl-9"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "ocean" : "ghost"}
              onClick={() => setFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {results.map((p) => (
          <article key={p.title} className="glass glass-hover flex flex-col rounded-2xl p-6">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold leading-snug">{p.title}</h2>
              <button
                aria-label="Bookmark"
                onClick={() =>
                  setSaved((s) => (s.includes(p.title) ? s.filter((t) => t !== p.title) : [...s, p.title]))
                }
                className="shrink-0 text-muted-foreground transition-colors hover:text-ocean-cyan"
              >
                <Bookmark
                  className={`size-4 ${saved.includes(p.title) ? "fill-ocean-cyan text-ocean-cyan" : ""}`}
                />
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{p.authors}</p>
            <p className="mt-3 flex-1 text-sm text-muted-foreground">{p.summary}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="secondary">{p.region}</Badge>
              {p.tags.map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))}
              <span className="ml-auto text-muted-foreground">{p.date}</span>
            </div>
          </article>
        ))}
      </div>

      {results.length === 0 && (
        <p className="glass mt-6 rounded-2xl p-8 text-center text-sm text-muted-foreground">
          No studies match that search.
        </p>
      )}
    </div>
  );
}

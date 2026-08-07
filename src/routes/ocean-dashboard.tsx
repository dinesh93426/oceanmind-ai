import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, MapPin, Radio, ShieldCheck, Waves } from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { alerts, oceanMetrics, oceanRegions, trend } from "@/lib/ocean-data";

export const Route = createFileRoute("/ocean-dashboard")({
  head: () => ({
    meta: [
      { title: "Ocean Conditions Dashboard — OceanMind AI" },
      {
        name: "description",
        content:
          "Live sea surface temperature, salinity, waves, currents and alerts for any ocean coordinate, with 24h to 30d forecasts.",
      },
      { property: "og:title", content: "Ocean Conditions Dashboard — OceanMind AI" },
      {
        property: "og:description",
        content: "Ten live marine metrics, interactive world map and habitat prediction heatmaps.",
      },
    ],
  }),
  component: OceanDashboard;
});

const chartStyle = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: "0.75rem",
    fontSize: 12,
  },
} as const;

function OceanDashboard() {
  const [region, setRegion] = useState(oceanRegions[4]);
  const [live, setLive] = useState(true);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-bold sm:text-4xl">Ocean Conditions</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {region.name} · surface layer · updated 2 min ago
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Radio className={live ? "size-4 animate-pulse-glow text-sea-green" : "size-4"} />
          <span className="text-sm text-muted-foreground">Live</span>
          <Switch checked={live} onCheckedChange={setLive} />
        </div>
      </div>

      <div className="glass mt-6 grid gap-3 rounded-2xl p-4 md:grid-cols-4">
        <Input placeholder="Latitude · 9.93" />
        <Input placeholder="Longitude · 75.31" />
        <Input placeholder="Search ocean region" />
        <Input type="date" defaultValue="2026-08-07" />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {oceanMetrics.map((m) => (
          <div key={m.label} className="glass glass-hover rounded-2xl p-4">
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className="mt-2 font-display text-2xl font-bold">
              {m.value}
              <span className="ml-1 text-sm font-normal text-muted-foreground">{m.unit}</span>
            </p>
            <p className="mt-1 text-xs text-ocean-teal">{m.delta}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="glass rounded-[2rem] p-6">
          <h2 className="font-semibold">Interactive World Map</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Click a region to load its conditions.
          </p>
          <div className="relative mt-5 aspect-[2/1] overflow-hidden rounded-2xl bg-[linear-gradient(180deg,color-mix(in_oklab,var(--ocean-deep)_75%,transparent),color-mix(in_oklab,var(--ocean-cyan)_25%,transparent))]">
            <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:40px_40px]" />
            {oceanRegions.map((r) => (
              <button
                key={r.name}
                onClick={() => setRegion(r)}
                aria-label={r.name}
                style={{ left: `${r.x}%`, top: `${r.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-1 transition-transform hover:scale-125 ${
                  region.name === r.name ? "scale-125" : ""
                }`}
              >
                <span
                  className={`grid size-7 place-items-center rounded-full ${
                    region.name === r.name
                      ? "bg-[var(--gradient-ocean)] text-primary-foreground shadow-[var(--shadow-glow)]"
                      : "bg-secondary/80 text-foreground"
                  }`}
                >
                  <MapPin className="size-3.5" />
                </span>
              </button>
            ))}
            <div className="glass absolute bottom-3 left-3 rounded-xl px-3 py-2 text-xs">
              {region.name} · SST {region.temp}
            </div>
          </div>
        </div>

        <div className="glass rounded-[2rem] p-6">
          <h2 className="font-semibold">Ocean Alerts</h2>
          <div className="mt-5 space-y-3">
            {alerts.map((a) => (
              <div key={a.title} className="rounded-2xl border border-border bg-secondary/40 p-4">
                <div className="flex items-start gap-3">
                  {a.level === "safe" ? (
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sea-green" />
                  ) : (
                    <AlertTriangle
                      className={`mt-0.5 size-4 shrink-0 ${
                        a.level === "critical" ? "text-destructive" : "text-chart-4"
                      }`}
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{a.region}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Badge className="mt-5 bg-sea-green/20 text-sea-green">Safe zone confidence 84%</Badge>
        </div>
      </div>

      <Tabs defaultValue="24h" className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Forecast</h2>
          <TabsList>
            <TabsTrigger value="24h">24 Hours</TabsTrigger>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        {[
          { title: "Temperature Trend (°C)", key: "temperature", color: "var(--chart-1)" },
          { title: "Salinity (PSU)", key: "salinity", color: "var(--chart-2)" },
          { title: "Wave Height (m)", key: "wave", color: "var(--chart-3)" },
          { title: "Current Speed (m/s)", key: "current", color: "var(--chart-4)" },
        ].map((c, i) => (
          <div key={c.key} className="glass rounded-[2rem] p-6">
            <h3 className="text-sm font-semibold">{c.title}</h3>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                {i % 2 === 0 ? (
                  <AreaChart data={trend}>
                    <defs>
                      <linearGradient id={`g-${c.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={c.color} stopOpacity={0.5} />
                        <stop offset="100%" stopColor={c.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={5} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" domain={["auto", "auto"]} />
                    <Tooltip {...chartStyle} />
                    <Area
                      type="monotone"
                      dataKey={c.key}
                      stroke={c.color}
                      strokeWidth={2}
                      fill={`url(#g-${c.key})`}
                    />
                  </AreaChart>
                ) : (
                  <LineChart data={trend}>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={5} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" domain={["auto", "auto"]} />
                    <Tooltip {...chartStyle} />
                    <Line type="monotone" dataKey={c.key} stroke={c.color} strokeWidth={2} dot={false} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      <div className="glass mt-8 rounded-[2rem] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Fish Habitat Prediction</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Probability heatmap · migration direction · temperature suitability
            </p>
          </div>
          <Button variant="glass" size="sm">
            <Waves className="size-4" /> Recompute
          </Button>
        </div>
        <div className="relative mt-5 aspect-[3/1] overflow-hidden rounded-2xl bg-secondary/40">
          <div className="absolute inset-0 [background:radial-gradient(circle_at_25%_55%,color-mix(in_oklab,var(--sea-green)_65%,transparent),transparent_35%),radial-gradient(circle_at_55%_35%,color-mix(in_oklab,var(--ocean-cyan)_60%,transparent),transparent_30%),radial-gradient(circle_at_78%_65%,color-mix(in_oklab,var(--chart-4)_55%,transparent),transparent_28%)]" />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 100" aria-hidden="true">
            <path
              d="M20 70 C90 40 160 80 280 35"
              fill="none"
              stroke="var(--foreground)"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.6"
            />
          </svg>
          <span className="glass absolute bottom-3 left-3 rounded-xl px-3 py-2 text-xs">
            Suitability 0.82 · migrating NE · peak season Jun–Sep
          </span>
        </div>
      </div>
    </div>
  );
}

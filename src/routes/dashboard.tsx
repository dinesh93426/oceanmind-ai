import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  Bookmark,
  Download,
  Fish,
  Globe,
  KeyRound,
  Ruler,
  Settings,
  Upload,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { identificationHistory, speciesDistribution, trend } from "@/lib/ocean-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Dashboard & Analytics — OceanMind AI" },
      {
        name: "description",
        content:
          "Track identification history, most identified species, temperature trends, saved research and account settings.",
      },
      { property: "og:title", content: "Your Dashboard & Analytics — OceanMind AI" },
      {
        property: "og:description",
        content: "Personal marine analytics: scans, species distribution, bookmarks and settings.",
      },
    ],
  }),
  component: Dashboard,
});

const chartTip = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: "0.75rem",
    fontSize: 12,
  },
} as const;

const pieColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-12">
      <div className="glass grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-[2rem] p-6 sm:flex sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[image:var(--gradient-ocean)] text-primary-foreground">
            <Fish className="size-6" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold">Dr. Aria Menon</h1>
            <p className="truncate text-sm text-muted-foreground">
              Marine biologist · Kochi, India · Pro plan
            </p>
          </div>
        </div>
        <Badge className="shrink-0 bg-sea-green/20 text-sea-green">1,284 scans</Badge>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Saved Fish", value: "148", icon: Fish },
          { label: "Saved Research", value: "62", icon: Bookmark },
          { label: "Downloads", value: "37", icon: Download },
          { label: "Recent Uploads", value: "9", icon: Upload },
          { label: "Regions Tracked", value: "12", icon: Globe },
        ].map((s) => (
          <div key={s.label} className="glass glass-hover rounded-2xl p-5">
            <s.icon className="size-4 text-ocean-cyan" />
            <p className="mt-3 font-display text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-semibold">Analytics</h2>
      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-[2rem] p-6">
          <h3 className="text-sm font-semibold">Fish Identification History</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={identificationHistory}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <Tooltip {...chartTip} />
                <Bar dataKey="scans" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-[2rem] p-6">
          <h3 className="text-sm font-semibold">Species Distribution</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={speciesDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {speciesDistribution.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip {...chartTip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-[2rem] p-6">
          <h3 className="text-sm font-semibold">Ocean Temperature Trends</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="hour" interval={5} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" domain={["auto", "auto"]} />
                <Tooltip {...chartTip} />
                <Area
                  type="monotone"
                  dataKey="temperature"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  fill="url(#tempGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-[2rem] p-6">
          <h3 className="text-sm font-semibold">Research Activity</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={identificationHistory}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <Tooltip {...chartTip} />
                <Line
                  type="monotone"
                  dataKey="species"
                  stroke="var(--chart-3)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass mt-6 rounded-[2rem] p-6">
        <h3 className="text-sm font-semibold">Most Identified Species — heatmap</h3>
        <div className="mt-5 grid grid-cols-6 gap-1.5 sm:grid-cols-12">
          {Array.from({ length: 48 }, (_, i) => (
            <div
              key={i}
              className="aspect-square rounded-md"
              style={{
                background: `color-mix(in oklab, var(--ocean-cyan) ${8 + ((i * 13) % 80)}%, transparent)`,
              }}
            />
          ))}
        </div>
      </div>

      <h2 className="mt-10 text-xl font-semibold">Settings</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {[
          { label: "Language", value: "English (UK)", icon: Globe },
          { label: "Measurement Units", value: "Metric · °C, m, kn", icon: Ruler },
          { label: "Location Settings", value: "Auto-detect coordinates", icon: Globe },
          { label: "API Keys", value: "2 active keys", icon: KeyRound },
        ].map((s) => (
          <div key={s.label} className="glass flex items-center gap-4 rounded-2xl p-5">
            <s.icon className="size-4 shrink-0 text-ocean-cyan" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{s.label}</p>
              <p className="truncate text-xs text-muted-foreground">{s.value}</p>
            </div>
            <Button variant="ghost" size="sm">
              <Settings className="size-4" /> Edit
            </Button>
          </div>
        ))}
        <div className="glass flex items-center gap-4 rounded-2xl p-5">
          <Bell className="size-4 shrink-0 text-ocean-cyan" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Notifications</p>
            <p className="text-xs text-muted-foreground">Storm & conservation alerts</p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>
    </div>
  );
}

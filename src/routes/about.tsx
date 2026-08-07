import { createFileRoute } from "@tanstack/react-router";
import { Leaf, Radar, ShieldAlert, Sparkles } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About AquaIntel AI — Marine Intelligence for Everyone" },
      {
        name: "description",
        content:
          "AquaIntel AI combines species recognition, ocean forecasting and conservation intelligence for researchers, fishers and students.",
      },
      { property: "og:title", content: "About AquaIntel AI" },
      {
        property: "og:description",
        content: "Our mission, AI capabilities and conservation commitments.",
      },
    ],
  }),
  component: About,
});

const pillars = [
  {
    icon: Sparkles,
    title: "AI Recommendation Engine",
    body: "Best fishing locations, similar species, marine articles and live ocean alerts tailored to your coordinates.",
  },
  {
    icon: Radar,
    title: "Ocean Forecast",
    body: "Wave conditions, temperature, currents and fishing suitability up to 30 days ahead.",
  },
  {
    icon: ShieldAlert,
    title: "Conservation Guardrails",
    body: "Protected species alerts, illegal fishing warnings and endangered fish information at the point of catch.",
  },
  {
    icon: Leaf,
    title: "Sustainability Scoring",
    body: "Every identification carries a sustainability score combining stock health, gear impact and season.",
  },
];

function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-12">
      <h1 className="text-3xl font-bold sm:text-4xl">
        Marine intelligence, <span className="text-gradient-ocean">open to everyone</span>
      </h1>
      <p className="mt-5 max-w-2xl text-muted-foreground">
        AquaIntel AI was built with marine biologists, small-scale fishers and classroom educators.
        The same models that support peer-reviewed research power a one-tap species check on a boat
        with patchy signal.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {pillars.map((p) => (
          <div key={p.title} className="glass glass-hover rounded-2xl p-6">
            <span className="grid size-11 place-items-center rounded-xl bg-[image:var(--gradient-ocean)] text-primary-foreground">
              <p.icon className="size-5" />
            </span>
            <h2 className="mt-5 text-lg font-semibold">{p.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
          </div>
        ))}
      </div>

      <div className="glass mt-8 rounded-[2rem] p-8">
        <h2 className="text-xl font-semibold">Data & accuracy</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Species models are trained on 4.8 million labelled images across 4,820 taxa and validated
          against museum vouchers. Ocean conditions blend satellite retrievals with reanalysis
          products. All figures in this demo are illustrative sample data.
        </p>
      </div>
    </div>
  );
}

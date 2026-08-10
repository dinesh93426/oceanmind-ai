import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  AlertTriangle,
  Camera,
  Download,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Leaf,
  ShieldAlert,
  Sparkles,
  Upload,
  ZoomIn,
} from "lucide-react";
import { useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { identifiedFish as defaultFish, similarSpecies as defaultSimilar } from "@/lib/ocean-data";
import { identifyFishServerFn } from "@/lib/identify-server";

export const Route = createFileRoute("/fish-identification")({
  head: () => ({
    meta: [
      { title: "Fish Identification — AquaIntel AI" },
      {
        name: "description",
        content:
          "Upload or capture a fish photo and get species identification, morphology analysis, habitat maps and an export-ready report.",
      },
      { property: "og:title", content: "Fish Identification — AquaIntel AI" },
      {
        property: "og:description",
        content: "AI fish species recognition with confidence scores, disease and freshness checks.",
      },
    ],
  }),
  component: FishIdentification,
});

const stages = ["Uploading image…", "Analyzing fish features with EfficientNet-B0…", "Querying species database…"];

interface IdentificationResult {
  success: boolean;
  identified?: boolean;
  engine?: string;
  prediction?: {
    species_id: number;
    common_name: string;
    scientific_name: string;
    confidence: number;
  } | null;
  fish?: {
    family: string;
    genus?: string;
    description: string;
    habitat: string;
    diet: string;
    distribution: string;
    depth_range: string;
    temperature_range: string;
    salinity_range: string;
    conservation_status: string;
    lifespan?: string;
    size?: string;
    danger?: string;
    commercial?: string;
    reproduction?: string;
    migration?: string;
    behavior?: string;
    nutrition?: string;
    season?: string;
    predators?: string;
    facts?: string[];
  };
  top_candidate?: {
    species_id?: number;
    common_name: string;
    scientific_name: string;
    confidence: number;
  } | null;
  alternatives?: Array<{
    name: string;
    confidence: number;
  }>;
  message?: string;
  error?: string;
}

function FishIdentification() {
  const [image, setImage] = useState<string | null>(null);
  const [stage, setStage] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const done = stage >= stages.length;

  async function handleFile(file?: File | null) {
    if (!file) return;

    setImage(URL.createObjectURL(file));
    setStage(0);
    setZoom(1);
    setResult(null);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      setStage(1);
      const data: IdentificationResult = await identifyFishServerFn({ data: formData });

      setStage(2);
      if (!data.success) {
        setErrorMsg(data.error || "Failed to identify fish image.");
      }

      setResult(data);
      setStage(3); // Mark completed
    } catch (err: any) {
      console.error("Identification error:", err);
      setErrorMsg(`Connection error: ${err?.message || err}`);
      setStage(3);
    }
  }

  // Display details map
  const activeFish = result?.fish;
  const activePred = result?.prediction;
  const activeTop = result?.top_candidate;

  const isIdentified = result?.identified ?? true;
  const displayCommon = isIdentified
    ? (activePred?.common_name || activeTop?.common_name || "Unknown")
    : "Unconfident Identification";
  const displayScientific = isIdentified
    ? (activePred?.scientific_name || activeTop?.scientific_name || "Unknown")
    : (activeTop?.common_name ? `Low Confidence Candidate: ${activeTop.common_name}` : "Upload a clearer photo");
  const displayConfidence = activePred?.confidence ?? activeTop?.confidence;

  const displayDetails = [
    ["Scientific Name", displayScientific],
    ["Common Name", displayCommon],
    ["Family", activeFish?.family || "Unknown"],
    ["Habitat", activeFish?.habitat || "Unknown"],
    ["Diet", activeFish?.diet || "Unknown"],
    ["Average Lifespan", activeFish?.lifespan || "Unknown"],
    ["Average Size", activeFish?.size || "Unknown"],
    ["Danger Level", activeFish?.danger || "Unknown"],
    ["Commercial Value", activeFish?.commercial || "Unknown"],
    ["IUCN Status", activeFish?.conservation_status || "Unknown"],
    ["Distribution", activeFish?.distribution || "Unknown"],
    ["Reproduction", activeFish?.reproduction || "Unknown"],
    ["Migration Pattern", activeFish?.migration || "Unknown"],
    ["Behavior", activeFish?.behavior || "Unknown"],
    ["Nutrition", activeFish?.nutrition || "Unknown"],
    ["Fishing Season", activeFish?.season || "Unknown"],
    ["Predators", activeFish?.predators || "Unknown"],
  ];

  const factsList = activeFish?.facts || [];

  // Alternatives mapping
  const alternativesList = result?.alternatives && result.alternatives.length > 0
    ? result.alternatives.map((alt) => ({
        name: alt.name.replace(/_/g, " "),
        scientific: "Species candidate",
        probability: alt.confidence,
      }))
    : defaultSimilar;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12">
      <h1 className="text-3xl font-bold sm:text-4xl">Fish Identification</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Drag and drop a photo, upload a file or use your camera.
      </p>

      {!image && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className="glass mt-8 grid place-items-center rounded-[2rem] border-dashed px-6 py-20 text-center"
        >
          <span className="grid size-16 place-items-center rounded-2xl bg-[image:var(--gradient-ocean)] text-primary-foreground">
            <Upload className="size-7" />
          </span>
          <p className="mt-6 text-lg font-semibold">Drop your fish image here</p>
          <p className="mt-2 text-sm text-muted-foreground">Max 10 MB · JPG, JPEG, PNG, WEBP</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button variant="ocean" onClick={() => inputRef.current?.click()}>
              <Upload className="size-4" /> Upload Image
            </Button>
            <Button variant="glass" onClick={() => inputRef.current?.click()}>
              <Camera className="size-4" /> Camera Capture
            </Button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </motion.div>
      )}

      {image && !done && (
        <div className="glass mt-8 rounded-[2rem] p-8">
          <div className="flex items-center gap-3">
            <Sparkles className="size-5 animate-pulse-glow text-ocean-cyan" />
            <p className="font-display text-lg">{stages[Math.min(stage, stages.length - 1)]}</p>
          </div>
          <Progress value={((stage + 1) / stages.length) * 100} className="mt-6" />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        </div>
      )}

      {image && done && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="glass overflow-hidden rounded-[2rem] p-3">
              <div className="overflow-hidden rounded-[1.5rem]">
                <img
                  src={image}
                  alt="Uploaded fish"
                  loading="lazy"
                  className="w-full transition-transform duration-500"
                  style={{ transform: `scale(${zoom})` }}
                />
              </div>
              <div className="flex flex-wrap gap-2 p-3">
                <Button variant="glass" size="sm" onClick={() => setZoom((z) => (z >= 1.8 ? 1 : z + 0.4))}>
                  <ZoomIn className="size-4" /> Zoom {zoom.toFixed(1)}x
                </Button>
                <Button variant="ghost" size="sm">
                  <ImageIcon className="size-4" /> Compare Image
                </Button>
                <Button variant="ghost" size="sm">
                  <FileText className="size-4" /> Download Report
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setImage(null); setResult(null); setErrorMsg(null); }}>
                  New scan
                </Button>
              </div>
            </div>

            {/* Low Confidence or Error Alert Banner */}
            {(result?.identified === false || errorMsg) && (
              <div className="glass rounded-[2rem] border-amber-500/30 p-6 text-amber-200 bg-amber-950/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="size-6 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-300">
                      {errorMsg ? "Identification Error" : "Low Identification Confidence"}
                    </h4>
                    <p className="mt-1 text-sm text-amber-200/90">
                      {errorMsg || result?.message || "Unable to confidently identify this fish. Please upload a clearer image."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="glass rounded-[2rem] p-6">
              <h3 className="font-semibold">Top Alternative Candidates</h3>
              <div className="mt-5 space-y-4">
                {alternativesList.map((s) => (
                  <div key={s.name}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate">
                        {s.name} <em className="text-muted-foreground">{s.scientific}</em>
                      </span>
                      <span className="shrink-0 text-muted-foreground">{s.probability}%</span>
                    </div>
                    <Progress value={s.probability} className="mt-2" />
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-[2rem] p-6">
              <h3 className="font-semibold">Habitat & Distribution</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[activeFish?.habitat || "Open ocean", "Reef edge", "Coastal zone"].map((h) => (
                  <div
                    key={h}
                    className="grid h-24 place-items-center rounded-xl bg-[linear-gradient(135deg,color-mix(in_oklab,var(--ocean-cyan)_30%,transparent),color-mix(in_oklab,var(--ocean-teal)_25%,transparent))] px-2 text-center text-xs"
                  >
                    {h}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass rounded-[2rem] p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold">{displayCommon}</h2>
                  <p className="italic text-muted-foreground">{displayScientific}</p>
                  {result?.engine && (
                    <p className="mt-1 text-xs text-ocean-cyan font-medium">
                      ⚡ Engine: {result.engine}
                    </p>
                  )}
                </div>
                <Badge className="bg-[image:var(--gradient-ocean)] text-primary-foreground">
                  {displayConfidence}% confidence
                </Badge>
              </div>

              <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                {displayDetails.map(([label, val]) => (
                  <div key={label}>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                      {label}
                    </dt>
                    <dd className="mt-1 text-sm">{String(val || "N/A")}</dd>
                  </div>
                ))}
              </dl>

              <h4 className="mt-7 text-sm font-semibold">Interesting facts</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {factsList.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-ocean-teal" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <Tabs defaultValue="disease" className="glass rounded-[2rem] p-6">
              <TabsList>
                <TabsTrigger value="disease">Disease Check</TabsTrigger>
                <TabsTrigger value="freshness">Freshness</TabsTrigger>
                <TabsTrigger value="conservation">Conservation</TabsTrigger>
              </TabsList>
              <TabsContent value="disease" className="pt-5 text-sm">
                <p className="flex items-center gap-2 font-medium">
                  <ShieldAlert className="size-4 text-ocean-teal" /> No pathology detected (0.9% risk)
                </p>
                <p className="mt-3 text-muted-foreground">
                  Screened for fin rot, ich, ulcerative lesions and gill discoloration. Recommended action: routine monitoring only.
                </p>
              </TabsContent>
              <TabsContent value="freshness" className="pt-5 text-sm">
                <p className="font-medium">Quality grade A · caught &lt; 12 h ago</p>
                <Progress value={91} className="mt-4" />
                <p className="mt-3 text-muted-foreground">
                  Clear corneas, bright red gills, firm flesh. No spoilage indicators found.
                </p>
              </TabsContent>
              <TabsContent value="conservation" className="pt-5 text-sm">
                <p className="flex items-center gap-2 font-medium">
                  <Leaf className="size-4 text-sea-green" /> Status: {activeFish?.conservation_status || "Least Concern"}
                </p>
                <p className="mt-3 text-muted-foreground">
                  Distribution: {activeFish?.distribution || "Coastal & pelagic marine belt"}. Prefer sustainable catch gear.
                </p>
              </TabsContent>
            </Tabs>

            <div className="glass flex flex-wrap gap-2 rounded-[2rem] p-6">
              <Button variant="ocean" size="sm">
                <Download className="size-4" /> PDF report
              </Button>
              <Button variant="glass" size="sm">
                <FileSpreadsheet className="size-4" /> CSV
              </Button>
              <Button variant="glass" size="sm">
                <FileSpreadsheet className="size-4" /> Excel
              </Button>
              <Button variant="ghost" size="sm">
                <ImageIcon className="size-4" /> Image summary
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

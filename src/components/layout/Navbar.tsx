import { Link } from "@tanstack/react-router";
import { Bell, Fish, Menu, Moon, Sun, User, Waves, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { NoaaKeyModal } from "@/components/ocean/NoaaKeyModal";
import { getNoaaApiKey } from "@/lib/noaa-api";

const links = [
  { to: "/", label: "Home" },
  { to: "/fish-identification", label: "Fish Identification" },
  { to: "/ocean-dashboard", label: "Ocean Dashboard" },
  { to: "/marine-ai", label: "Marine AI" },
  { to: "/research", label: "Research" },
  { to: "/about", label: "About" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [light, setLight] = useState(false);

  const [noaaModalOpen, setNoaaModalOpen] = useState(false);
  const [hasNoaaKey, setHasNoaaKey] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
  }, [light]);

  useEffect(() => {
    setHasNoaaKey(Boolean(getNoaaApiKey()));
    const handleKeyChange = () => setHasNoaaKey(Boolean(getNoaaApiKey()));
    window.addEventListener("noaa-key-changed", handleKeyChange);
    return () => window.removeEventListener("noaa-key-changed", handleKeyChange);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <div className="glass mx-auto mt-3 flex max-w-7xl items-center gap-3 rounded-2xl px-4 py-3 sm:mx-4 lg:mx-auto">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[image:var(--gradient-ocean)] text-primary-foreground">
            <Waves className="size-5" />
          </span>
          <span className="truncate font-display text-lg font-bold">OceanMind AI</span>
        </Link>

        <nav className="ml-4 hidden flex-1 items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "bg-secondary text-foreground" }}
              activeOptions={{ exact: l.to === "/" }}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNoaaModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 border-sea-green/30 bg-sea-green/10 text-sea-green text-xs rounded-xl h-8 px-2.5 hover:bg-sea-green/20 transition-all"
            title="Configure NOAA API Key for Ocean Conditions"
          >
            <Waves className="size-3.5" />
            <span className="font-medium">NOAA API</span>
            {hasNoaaKey ? (
              <span className="size-2 rounded-full bg-sea-green animate-pulse" />
            ) : (
              <span className="text-[10px] opacity-75">(Demo)</span>
            )}
          </Button>

          <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setLight((v) => !v)}>
            {light ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </Button>
          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
            <Bell className="size-4" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-sea-green" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Profile" asChild>
            <Link to="/dashboard">
              <User className="size-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      <NoaaKeyModal
        open={noaaModalOpen}
        onOpenChange={setNoaaModalOpen}
        onKeyUpdated={() => setHasNoaaKey(Boolean(getNoaaApiKey()))}
      />

      {open && (
        <div className="glass mx-3 mt-2 grid gap-1 rounded-2xl p-3 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

export function MobileTabBar() {
  const items = [
    { to: "/", label: "Home", icon: Waves },
    { to: "/fish-identification", label: "Identify", icon: Fish },
    { to: "/ocean-dashboard", label: "Ocean", icon: Waves },
    { to: "/marine-ai", label: "AI", icon: User },
  ] as const;

  return (
    <nav className="glass fixed inset-x-3 bottom-3 z-50 grid grid-cols-4 rounded-2xl p-1 sm:hidden">
      {items.map((i) => (
        <Link
          key={i.label}
          to={i.to}
          activeProps={{ className: "text-ocean-cyan" }}
          activeOptions={{ exact: i.to === "/" }}
          className="flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] text-muted-foreground"
        >
          <i.icon className="size-4" />
          {i.label}
        </Link>
      ))}
    </nav>
  );
}

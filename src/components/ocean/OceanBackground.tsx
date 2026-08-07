const bubbles = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 7.3 + 4) % 100}%`,
  size: 6 + ((i * 5) % 18),
  duration: 14 + ((i * 3) % 12),
  delay: (i * 1.7) % 14,
}));

const fishes = Array.from({ length: 5 }, (_, i) => ({
  top: `${12 + i * 17}%`,
  scale: 0.5 + (i % 3) * 0.28,
  duration: 34 + i * 9,
  delay: i * 6,
  opacity: 0.1 + (i % 3) * 0.05,
}));

function Fish({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 64 32" className={className} style={style} aria-hidden="true">
      <path
        d="M2 16c10-13 26-14 38-8l10-8v32l-10-8C28 30 12 29 2 16z"
        fill="currentColor"
        opacity="0.9"
      />
      <circle cx="16" cy="14" r="1.8" fill="var(--background)" />
    </svg>
  );
}

export function OceanBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {fishes.map((f, i) => (
        <Fish
          key={i}
          className="animate-swim absolute w-16 text-ocean-cyan"
          style={{
            top: f.top,
            transform: `scale(${f.scale})`,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
            opacity: f.opacity,
          }}
        />
      ))}

      {bubbles.map((b, i) => (
        <span
          key={i}
          className="animate-bubble absolute bottom-0 rounded-full border border-ocean-cyan/40 bg-ocean-cyan/10"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}

      <div className="absolute inset-x-0 bottom-0 h-40 overflow-hidden opacity-30">
        <svg
          className="animate-wave h-full w-[200%]"
          viewBox="0 0 1200 160"
          preserveAspectRatio="none"
        >
          <path
            d="M0 80c150-50 300 50 450 20s300-90 450-40 300 60 300 60v120H0z"
            fill="var(--ocean-cyan)"
            opacity="0.35"
          />
          <path
            d="M0 110c150-40 320 40 470 10s280-70 430-30 300 50 300 50v100H0z"
            fill="var(--ocean-teal)"
            opacity="0.3"
          />
        </svg>
      </div>
    </div>
  );
}

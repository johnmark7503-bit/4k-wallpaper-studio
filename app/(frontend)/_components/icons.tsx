export type IconName =
  | "arrow"
  | "check"
  | "chevron"
  | "download"
  | "heart"
  | "menu"
  | "monitor"
  | "laptop"
  | "tablet"
  | "phone"
  | "search"
  | "sparkles"
  | "shuffle"
  | "x";

export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "search") {
    return <svg {...common}><circle cx="11" cy="11" r="7.25" /><path d="m16.5 16.5 4 4" /></svg>;
  }
  if (name === "heart") {
    return <svg {...common}><path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6l1.2 1.2L12 21l7.6-7.6 1.2-1.2a5.4 5.4 0 0 0 0-7.6Z" /></svg>;
  }
  if (name === "arrow") {
    return <svg {...common}><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></svg>;
  }
  if (name === "chevron") {
    return <svg {...common}><path d="m9 6 6 6-6 6" /></svg>;
  }
  if (name === "download") {
    return <svg {...common}><path d="M12 3v12" /><path d="m7.5 10.5 4.5 4.5 4.5-4.5" /><path d="M5 21h14" /></svg>;
  }
  if (name === "monitor") {
    return <svg {...common}><rect x="3" y="4" width="18" height="12" rx="1.8" /><path d="M8 20h8M12 16v4" /></svg>;
  }
  if (name === "laptop") {
    return <svg {...common}><path d="M5 5.5h14v10H5z" /><path d="m3 18.5 2-3h14l2 3H3Z" /></svg>;
  }
  if (name === "tablet") {
    return <svg {...common}><rect x="5.5" y="2.5" width="13" height="19" rx="2" /><path d="M10.5 18.5h3" /></svg>;
  }
  if (name === "phone") {
    return <svg {...common}><rect x="7.5" y="2.5" width="9" height="19" rx="2" /><path d="M10.5 18.5h3" /></svg>;
  }
  if (name === "sparkles") {
    return <svg {...common}><path d="m12 3 1.1 3.4L16.5 7.5l-3.4 1.1L12 12l-1.1-3.4-3.4-1.1 3.4-1.1L12 3Z" /><path d="m18.5 13 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z" /></svg>;
  }
  if (name === "shuffle") {
    return <svg {...common}><path d="M3 7h3c4.5 0 7.5 10 12 10h3" /><path d="m18 14 3 3-3 3" /><path d="M3 17h3c1.7 0 3.1-1.4 4.4-3.2" /><path d="M14 8.5C15.3 7.5 16.5 7 18 7h3" /><path d="m18 4 3 3-3 3" /></svg>;
  }
  if (name === "check") {
    return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>;
  }
  if (name === "x") {
    return <svg {...common}><path d="M6 6l12 12M18 6 6 18" /></svg>;
  }
  return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
}

export type Wallpaper = {
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  collectionSlugs: string[];
  description: string;
  src: string;
  downloadSrc: string;
  downloadSources?: {
    phone: string;
    tablet: string;
    laptop: string;
    desktop: string;
  };
  alt: string;
  resolution: "4K";
  dimensions: "3840 × 2160";
  palette: string;
  published: string;
  popularity: number;
  featured: boolean;
  tags: string[];
};

export const wallpapers: Wallpaper[] = [
  {
    slug: "aurora-over-obsidian",
    title: "Aurora Over Obsidian",
    category: "Nature",
    categorySlug: "nature",
    collectionSlugs: ["obsidian-atmosphere", "earth-after-dark"],
    description:
      "A sweeping cyan aurora reflected across a silent black mountain lake, composed for clean desktop icon space.",
    src: "/wallpapers/aurora-obsidian.webp",
    downloadSrc: "/downloads/aurora-obsidian-4k.webp",
    alt: "Cyan aurora reflected in a dark alpine lake beneath jagged mountains",
    resolution: "4K",
    dimensions: "3840 × 2160",
    palette: "Cyan · Obsidian",
    published: "2026-08-02",
    popularity: 98,
    featured: true,
    tags: ["aurora", "mountains", "lake", "cyan", "dark", "desktop"],
  },
  {
    slug: "midnight-current",
    title: "Midnight Current",
    category: "AMOLED",
    categorySlug: "amoled",
    collectionSlugs: ["obsidian-atmosphere", "blue-hour"],
    description:
      "Bioluminescent currents cut through a near-black ocean for a high-contrast AMOLED-ready screen.",
    src: "/wallpapers/bioluminescent-ocean.webp",
    downloadSrc: "/downloads/bioluminescent-ocean-4k.webp",
    alt: "Dark ocean waves traced by electric cyan bioluminescence",
    resolution: "4K",
    dimensions: "3840 × 2160",
    palette: "Electric blue · Black",
    published: "2026-08-01",
    popularity: 96,
    featured: true,
    tags: ["amoled", "ocean", "waves", "blue", "black", "minimal"],
  },
  {
    slug: "fractured-light",
    title: "Fractured Light",
    category: "Abstract",
    categorySlug: "abstract",
    collectionSlugs: ["obsidian-atmosphere", "future-forms"],
    description:
      "Angular obsidian glass catches precise cyan light in an original geometric composition.",
    src: "/wallpapers/obsidian-glass.webp",
    downloadSrc: "/downloads/obsidian-glass-4k.webp",
    alt: "Angular black glass forms with narrow cyan reflections",
    resolution: "4K",
    dimensions: "3840 × 2160",
    palette: "Graphite · Cyan",
    published: "2026-07-31",
    popularity: 93,
    featured: true,
    tags: ["abstract", "glass", "geometric", "cyan", "black", "modern"],
  },
  {
    slug: "violet-orbit",
    title: "Violet Orbit",
    category: "Space",
    categorySlug: "space",
    collectionSlugs: ["blue-hour", "cosmic-silence"],
    description:
      "A vast violet ringed world rises above a mirror-still alien lake in deep nocturne tones.",
    src: "/wallpapers/violet-orbit.webp",
    downloadSrc: "/downloads/violet-orbit-4k.webp",
    alt: "Violet ringed planet above a still mountain lake at night",
    resolution: "4K",
    dimensions: "3840 × 2160",
    palette: "Violet · Midnight blue",
    published: "2026-07-30",
    popularity: 99,
    featured: true,
    tags: ["space", "planet", "violet", "lake", "stars", "cosmic"],
  },
  {
    slug: "ember-dunes",
    title: "Ember Dunes",
    category: "Nature",
    categorySlug: "nature",
    collectionSlugs: ["earth-after-dark"],
    description:
      "Wind-shaped charcoal dunes meet a razor-thin amber horizon at the quiet edge of night.",
    src: "/wallpapers/ember-dunes.webp",
    downloadSrc: "/downloads/ember-dunes-4k.webp",
    alt: "Black desert dunes beneath a narrow orange sunset horizon",
    resolution: "4K",
    dimensions: "3840 × 2160",
    palette: "Charcoal · Amber",
    published: "2026-07-29",
    popularity: 91,
    featured: false,
    tags: ["desert", "dunes", "sunset", "orange", "minimal", "landscape"],
  },
  {
    slug: "neon-monolith",
    title: "Neon Monolith",
    category: "Architecture",
    categorySlug: "architecture",
    collectionSlugs: ["future-forms", "blue-hour"],
    description:
      "A monumental concrete passage and mirror-black pool shaped by restrained cyan light.",
    src: "/wallpapers/neon-monolith.webp",
    downloadSrc: "/downloads/neon-monolith-4k.webp",
    alt: "Symmetrical brutalist concrete corridor reflected in a black pool",
    resolution: "4K",
    dimensions: "3840 × 2160",
    palette: "Concrete · Cyan",
    published: "2026-07-28",
    popularity: 95,
    featured: true,
    tags: ["architecture", "brutalist", "concrete", "cyan", "symmetry", "future"],
  },
  {
    slug: "polar-cathedral",
    title: "Polar Cathedral",
    category: "Nature",
    categorySlug: "nature",
    collectionSlugs: ["blue-hour", "earth-after-dark"],
    description:
      "A white shaft of daylight enters a vast blue ice cave and follows a frozen river inward.",
    src: "/wallpapers/polar-cathedral.webp",
    downloadSrc: "/downloads/polar-cathedral-4k.webp",
    alt: "Vast translucent blue ice cave with a white daylight shaft",
    resolution: "4K",
    dimensions: "3840 × 2160",
    palette: "Glacier blue · White",
    published: "2026-07-27",
    popularity: 89,
    featured: false,
    tags: ["ice", "cave", "glacier", "blue", "nature", "winter"],
  },
  {
    slug: "emerald-canopy",
    title: "Emerald Canopy",
    category: "Nature",
    categorySlug: "nature",
    collectionSlugs: ["earth-after-dark"],
    description:
      "Ancient rainforest trunks, dawn mist and subtle living light surround a quiet forest stream.",
    src: "/wallpapers/emerald-canopy.webp",
    downloadSrc: "/downloads/emerald-canopy-4k.webp",
    alt: "Mist-filled ancient rainforest with an emerald moss-lined stream",
    resolution: "4K",
    dimensions: "3840 × 2160",
    palette: "Emerald · Moss",
    published: "2026-07-26",
    popularity: 90,
    featured: false,
    tags: ["forest", "rainforest", "green", "stream", "mist", "nature"],
  },
  {
    slug: "liquid-titanium",
    title: "Liquid Titanium",
    category: "Abstract",
    categorySlug: "abstract",
    collectionSlugs: ["future-forms", "cosmic-silence"],
    description:
      "Polished titanium ribbons sweep across a deep black void with cool violet-blue reflections.",
    src: "/wallpapers/liquid-titanium.webp",
    downloadSrc: "/downloads/liquid-titanium-4k.webp",
    alt: "Flowing polished titanium ribbons with violet and blue reflections",
    resolution: "4K",
    dimensions: "3840 × 2160",
    palette: "Titanium · Violet",
    published: "2026-07-25",
    popularity: 94,
    featured: true,
    tags: ["abstract", "metal", "titanium", "silver", "violet", "3d"],
  },
];

export const categories = [
  {
    slug: "amoled",
    name: "AMOLED",
    description: "True blacks, focused highlights and minimal visual noise.",
    cover: "/wallpapers/bioluminescent-ocean.webp",
  },
  {
    slug: "nature",
    name: "Nature",
    description: "Original landscapes shaped around calm, depth and atmosphere.",
    cover: "/wallpapers/emerald-canopy.webp",
  },
  {
    slug: "abstract",
    name: "Abstract",
    description: "Glass, metal and fluid forms with crisp modern contrast.",
    cover: "/wallpapers/liquid-titanium.webp",
  },
  {
    slug: "space",
    name: "Space",
    description: "Quiet cosmic worlds and deep-sky scenes without familiar IP.",
    cover: "/wallpapers/violet-orbit.webp",
  },
  {
    slug: "architecture",
    name: "Architecture",
    description: "Original structures, symmetry and cinematic material studies.",
    cover: "/wallpapers/neon-monolith.webp",
  },
] as const;

export const collections = [
  {
    slug: "obsidian-atmosphere",
    name: "Obsidian Atmosphere",
    description: "Deep black surfaces cut by precise electric-blue light.",
    cover: "/wallpapers/aurora-obsidian.webp",
    wallpaperSlugs: ["aurora-over-obsidian", "midnight-current", "fractured-light"],
  },
  {
    slug: "blue-hour",
    name: "Blue Hour",
    description: "Cool nocturne scenes designed for focused workspaces.",
    cover: "/wallpapers/polar-cathedral.webp",
    wallpaperSlugs: ["midnight-current", "violet-orbit", "neon-monolith", "polar-cathedral"],
  },
  {
    slug: "future-forms",
    name: "Future Forms",
    description: "Original architectural and abstract studies with a premium edge.",
    cover: "/wallpapers/neon-monolith.webp",
    wallpaperSlugs: ["fractured-light", "neon-monolith", "liquid-titanium"],
  },
  {
    slug: "earth-after-dark",
    name: "Earth After Dark",
    description: "Landscapes that begin where daylight fades.",
    cover: "/wallpapers/ember-dunes.webp",
    wallpaperSlugs: ["aurora-over-obsidian", "ember-dunes", "polar-cathedral", "emerald-canopy"],
  },
] as const;

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  coverAlt: string;
  category: string;
  readTime: string;
  published: string;
  sections: { heading: string; paragraphs: string[] }[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "choose-wallpaper-for-clear-icons",
    title: "How to choose a wallpaper that keeps every icon clear",
    excerpt:
      "Use contrast, negative space and a deliberate crop to make your desktop calmer and easier to scan.",
    cover: "/wallpapers/ember-dunes.webp",
    coverAlt: "Dark dunes with a clean blue sky and amber horizon",
    category: "Screen Guide",
    readTime: "4 min read",
    published: "August 2, 2026",
    sections: [
      {
        heading: "Start with the busy part of your screen",
        paragraphs: [
          "Most desktop layouts keep icons near an edge. Choose an image with simpler texture in that area instead of placing detailed branches, stars or highlights behind every label.",
          "On a phone, check both the lock-screen clock and the home-screen icon grid. The same image can work beautifully in one position and feel crowded in another.",
        ],
      },
      {
        heading: "Contrast matters more than brightness",
        paragraphs: [
          "A dark wallpaper is not automatically readable. What matters is the difference between the local background and the icon or text placed on top of it.",
          "Broad gradients, open sky and soft water usually create reliable zones for interface elements without making the image feel empty.",
        ],
      },
      {
        heading: "Preview before you commit",
        paragraphs: [
          "Download the correct aspect ratio, set the crop to fill and check the result at normal viewing distance. Small adjustments to alignment often improve readability more than changing the whole wallpaper.",
        ],
      },
    ],
  },
  {
    slug: "amoled-wallpaper-battery-guide",
    title: "AMOLED wallpapers: what true black changes on your screen",
    excerpt:
      "A practical explanation of true black, perceived contrast and when an AMOLED wallpaper makes sense.",
    cover: "/wallpapers/bioluminescent-ocean.webp",
    coverAlt: "Electric blue detail across a nearly black ocean",
    category: "Display Basics",
    readTime: "5 min read",
    published: "July 30, 2026",
    sections: [
      {
        heading: "What true black means",
        paragraphs: [
          "On an OLED or AMOLED display, individual pixels can switch off when they show pure black. That produces deeper contrast than a backlit panel and can reduce power use in heavily black interfaces.",
          "The effect depends on brightness, image content and how long the screen is active, so treat battery savings as a useful side benefit rather than a guaranteed number.",
        ],
      },
      {
        heading: "Choose controlled highlights",
        paragraphs: [
          "The strongest AMOLED wallpapers reserve bright color for a few deliberate lines or subjects. This keeps icons readable while letting the screen's contrast do the visual work.",
        ],
      },
    ],
  },
  {
    slug: "best-wallpaper-resolution-for-your-screen",
    title: "The right wallpaper resolution for desktop, laptop and phone",
    excerpt:
      "Match pixels, aspect ratio and crop so your wallpaper stays sharp without unnecessary file size.",
    cover: "/wallpapers/polar-cathedral.webp",
    coverAlt: "Detailed blue ice cave used to demonstrate high-resolution imagery",
    category: "How To",
    readTime: "6 min read",
    published: "July 27, 2026",
    sections: [
      {
        heading: "Resolution and aspect ratio solve different problems",
        paragraphs: [
          "Resolution describes pixel dimensions. Aspect ratio describes the shape. A large image can still crop poorly when its shape does not match the display.",
          "For a 16:9 monitor, 3840 × 2160 gives enough detail for a 4K display and scales cleanly to common Full HD screens.",
        ],
      },
      {
        heading: "Phones need a different crop",
        paragraphs: [
          "Phone wallpapers are usually portrait. A desktop landscape can still work if the main subject remains visible inside a narrow center crop, but a dedicated mobile version gives more control.",
        ],
      },
      {
        heading: "Use the free screen checker",
        paragraphs: [
          "Our screen-resolution tool reads the current browser viewport and pixel ratio, then suggests a sensible wallpaper size without uploading any device data.",
        ],
      },
    ],
  },
];

export const tools = [
  {
    slug: "name-wallpaper",
    title: "AI Name Wallpaper Studio",
    description: "Type your name and let AI create one original premium design for every screen.",
    label: "Generate now",
  },
  {
    slug: "gradient-wallpaper",
    title: "Gradient Wallpaper Maker",
    description: "Mix two colors, choose an angle and export a clean 4K gradient wallpaper.",
    label: "Open maker",
  },
  {
    slug: "screen-resolution",
    title: "Screen Resolution Checker",
    description: "Detect your viewport and pixel ratio, then get a recommended wallpaper size.",
    label: "Check screen",
  },
] as const;

export function getWallpaper(slug: string) {
  return wallpapers.find((wallpaper) => wallpaper.slug === slug);
}

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getCollection(slug: string) {
  return collections.find((collection) => collection.slug === slug);
}

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

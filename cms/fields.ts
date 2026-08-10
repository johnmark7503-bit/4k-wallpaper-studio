import type { Field, FieldHook } from "payload";

const formatSlugValue = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const formatSlug: FieldHook = ({ data, operation, originalDoc, value }) => {
  if (typeof value === "string" && value.trim()) return formatSlugValue(value);
  if (operation === "update" && originalDoc?.slug) return originalDoc.slug;
  return typeof data?.title === "string" ? formatSlugValue(data.title) : value;
};

export const slugField: Field = {
  name: "slug",
  type: "text",
  required: true,
  unique: true,
  index: true,
  hooks: { beforeValidate: [formatSlug] },
  admin: {
    position: "sidebar",
    description: "URL-friendly name. Leave blank on first save to generate it from the title.",
  },
};

export const seoFields: Field = {
  name: "seo",
  type: "group",
  label: "Search engine optimization",
  fields: [
    { name: "metaTitle", type: "text", maxLength: 60 },
    { name: "metaDescription", type: "textarea", maxLength: 160 },
    { name: "focusKeyword", type: "text" },
    { name: "canonicalUrl", type: "text" },
    { name: "ogImage", type: "upload", relationTo: "media" },
    { name: "noIndex", type: "checkbox", defaultValue: false },
  ],
};

export const pinterestFields: Field = {
  name: "pinterest",
  type: "group",
  label: "Pinterest",
  fields: [
    { name: "title", type: "text", maxLength: 100 },
    { name: "description", type: "textarea", maxLength: 500 },
    { name: "board", type: "text" },
    { name: "destinationUrl", type: "text" },
  ],
};

export const versioning = {
  drafts: {
    autosave: { interval: 30_000 },
    schedulePublish: true,
  },
  maxPerDoc: 50,
} as const;

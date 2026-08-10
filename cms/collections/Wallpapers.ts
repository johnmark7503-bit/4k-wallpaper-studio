import type { CollectionConfig } from "payload";
import { adminsAndEditors, publishedOrLoggedIn } from "../access";
import { pinterestFields, seoFields, slugField, versioning } from "../fields";

export const Wallpapers: CollectionConfig = {
  slug: "wallpapers",
  trash: true,
  versions: versioning,
  orderable: true,
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "featured", "_status", "updatedAt"],
    group: "Wallpapers",
    description: "Add, rename, edit, publish, schedule or move wallpapers to trash.",
  },
  access: {
    create: adminsAndEditors,
    delete: adminsAndEditors,
    read: publishedOrLoggedIn,
    update: adminsAndEditors,
  },
  fields: [
    { name: "title", type: "text", required: true },
    slugField,
    { name: "description", type: "textarea", required: true, maxLength: 600 },
    { name: "previewImage", type: "upload", relationTo: "media", required: true },
    {
      name: "downloads",
      type: "group",
      label: "Device downloads",
      fields: [
        { name: "phone", type: "upload", relationTo: "media", required: true },
        { name: "tablet", type: "upload", relationTo: "media", required: true },
        { name: "laptop", type: "upload", relationTo: "media", required: true },
        { name: "desktop4K", type: "upload", relationTo: "media", required: true },
      ],
    },
    { name: "category", type: "relationship", relationTo: "categories", required: true },
    { name: "collections", type: "relationship", relationTo: "collections", hasMany: true },
    {
      name: "tags",
      type: "array",
      fields: [{ name: "tag", type: "text", required: true }],
    },
    {
      type: "row",
      fields: [
        { name: "palette", type: "text" },
        { name: "resolutionLabel", type: "text", defaultValue: "4K" },
        { name: "dimensions", type: "text", defaultValue: "3840 × 2160" },
      ],
    },
    { name: "featured", type: "checkbox", defaultValue: false, admin: { position: "sidebar" } },
    { name: "popularity", type: "number", min: 0, max: 100, defaultValue: 0, admin: { position: "sidebar" } },
    {
      name: "license",
      type: "select",
      defaultValue: "personal",
      options: [
        { label: "Personal use", value: "personal" },
        { label: "Commercial pack", value: "commercial" },
        { label: "Premium members", value: "premium" },
      ],
      admin: { position: "sidebar" },
    },
    pinterestFields,
    seoFields,
  ],
};

import type { GlobalConfig } from "payload";
import { adminsAndEditors, anyone } from "../access";

export const Homepage: GlobalConfig = {
  slug: "homepage",
  label: "Homepage",
  versions: { drafts: true, max: 30 },
  access: { read: anyone, update: adminsAndEditors },
  admin: { group: "Website settings" },
  fields: [
    { name: "eyebrow", type: "text", defaultValue: "Original. Curated. Screen-ready." },
    { name: "heading", type: "text", defaultValue: "Find your next screen obsession." },
    { name: "description", type: "textarea" },
    { name: "heroWallpapers", type: "relationship", relationTo: "wallpapers", hasMany: true, maxRows: 5 },
    { name: "featuredCollections", type: "relationship", relationTo: "collections", hasMany: true },
    { name: "featuredCategories", type: "relationship", relationTo: "categories", hasMany: true },
  ],
};

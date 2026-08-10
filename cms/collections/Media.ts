import type { CollectionConfig } from "payload";
import { adminsAndEditors, anyone, contentTeam } from "../access";

export const Media: CollectionConfig = {
  slug: "media",
  trash: true,
  admin: {
    useAsTitle: "filename",
    defaultColumns: ["filename", "alt", "kind", "updatedAt"],
    group: "Media",
  },
  access: {
    create: contentTeam,
    delete: adminsAndEditors,
    read: anyone,
    update: contentTeam,
  },
  upload: {
    mimeTypes: ["image/*"],
    imageSizes: [
      { name: "card", width: 960, height: 640, position: "centre", withoutEnlargement: true },
      { name: "pinterest", width: 1000, height: 1500, position: "centre", withoutEnlargement: true },
      { name: "social", width: 1200, height: 630, position: "centre", withoutEnlargement: true },
    ],
    adminThumbnail: "card",
  },
  fields: [
    { name: "alt", type: "text", required: true },
    {
      name: "kind",
      type: "select",
      defaultValue: "wallpaper",
      required: true,
      options: ["wallpaper", "blog", "download", "brand", "other"],
    },
    { name: "caption", type: "textarea" },
    {
      name: "copyrightSafe",
      type: "checkbox",
      defaultValue: false,
      required: true,
      admin: { description: "Confirm that this asset is original or properly licensed." },
    },
    { name: "sourceNote", type: "text" },
  ],
};

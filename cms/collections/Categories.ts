import type { CollectionConfig } from "payload";
import { adminsAndEditors, publishedOrLoggedIn } from "../access";
import { seoFields, slugField, versioning } from "../fields";

export const Categories: CollectionConfig = {
  slug: "categories",
  trash: true,
  versions: versioning,
  orderable: true,
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "featured", "updatedAt"],
    group: "Wallpapers",
  },
  access: {
    create: adminsAndEditors,
    delete: adminsAndEditors,
    read: publishedOrLoggedIn,
    update: adminsAndEditors,
  },
  fields: [
    { name: "name", type: "text", required: true },
    slugField,
    { name: "description", type: "textarea", required: true },
    { name: "cover", type: "upload", relationTo: "media", required: true },
    { name: "featured", type: "checkbox", defaultValue: false, admin: { position: "sidebar" } },
    seoFields,
  ],
};

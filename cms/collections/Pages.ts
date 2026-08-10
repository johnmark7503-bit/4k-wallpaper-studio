import type { CollectionConfig } from "payload";
import { adminsAndEditors, publishedOrLoggedIn } from "../access";
import { seoFields, slugField, versioning } from "../fields";

export const Pages: CollectionConfig = {
  slug: "pages",
  trash: true,
  versions: versioning,
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "_status", "updatedAt"],
    group: "Publishing",
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
    { name: "intro", type: "textarea" },
    { name: "content", type: "richText", required: true },
    seoFields,
  ],
};

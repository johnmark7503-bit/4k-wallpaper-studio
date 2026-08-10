import type { CollectionConfig } from "payload";
import { contentTeam, publishedOrLoggedIn } from "../access";
import { pinterestFields, seoFields, slugField, versioning } from "../fields";

export const BlogPosts: CollectionConfig = {
  slug: "blog-posts",
  trash: true,
  versions: versioning,
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishedAt", "_status", "updatedAt"],
    group: "Publishing",
  },
  access: {
    create: contentTeam,
    delete: contentTeam,
    read: publishedOrLoggedIn,
    update: contentTeam,
  },
  fields: [
    { name: "title", type: "text", required: true },
    slugField,
    { name: "excerpt", type: "textarea", required: true, maxLength: 260 },
    { name: "cover", type: "upload", relationTo: "media", required: true },
    { name: "category", type: "text", required: true },
    { name: "body", type: "richText", required: true },
    { name: "author", type: "relationship", relationTo: "users" },
    { name: "publishedAt", type: "date", admin: { position: "sidebar", date: { pickerAppearance: "dayAndTime" } } },
    { name: "readTime", type: "number", min: 1, defaultValue: 5, admin: { position: "sidebar" } },
    pinterestFields,
    seoFields,
  ],
};

import type { CollectionConfig } from "payload";
import { adminsAndEditors, anyone } from "../access";

export const NewsletterSubscribers: CollectionConfig = {
  slug: "newsletter-subscribers",
  trash: true,
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "status", "createdAt"],
    group: "Marketing",
  },
  access: {
    create: anyone,
    delete: adminsAndEditors,
    read: adminsAndEditors,
    update: adminsAndEditors,
  },
  fields: [
    { name: "email", type: "email", required: true, unique: true, index: true },
    {
      name: "status",
      type: "select",
      defaultValue: "active",
      options: ["active", "unsubscribed"],
    },
    { name: "source", type: "text", defaultValue: "website" },
    { name: "consentedAt", type: "date" },
  ],
};

import type { GlobalConfig } from "payload";
import { adminsOnly, anyone } from "../access";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Website settings",
  access: { read: anyone, update: adminsOnly },
  admin: { group: "Website settings" },
  fields: [
    { name: "siteName", type: "text", required: true, defaultValue: "4K Wallpaper Studio" },
    { name: "siteDescription", type: "textarea" },
    { name: "logo", type: "upload", relationTo: "media" },
    { name: "favicon", type: "upload", relationTo: "media" },
    { name: "contactEmail", type: "email" },
    { name: "pinterestUrl", type: "text" },
    { name: "instagramUrl", type: "text" },
    { name: "newsletterEnabled", type: "checkbox", defaultValue: true },
  ],
};

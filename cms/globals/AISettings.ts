import type { GlobalConfig } from "payload";
import { adminsOnly } from "../access";

export const AISettings: GlobalConfig = {
  slug: "ai-settings",
  label: "AI wallpaper settings",
  access: { read: adminsOnly, update: adminsOnly },
  admin: { group: "Tools" },
  fields: [
    { name: "enabled", type: "checkbox", defaultValue: false },
    { name: "provider", type: "select", defaultValue: "gemini", options: ["gemini"] },
    { name: "model", type: "text", defaultValue: "gemini-3.1-flash-image" },
    { name: "imageSize", type: "select", defaultValue: "2K", options: ["1K", "2K", "4K"] },
    { name: "dailyLimit", type: "number", min: 1, max: 10, defaultValue: 3 },
    {
      name: "credentialStatus",
      type: "text",
      virtual: true,
      defaultValue: "Configured securely through the server environment",
      admin: {
        readOnly: true,
        description: "Gemini API key remains a server environment variable and is never stored as plain text in CMS content.",
      },
    },
  ],
};

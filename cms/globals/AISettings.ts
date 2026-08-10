import type { GlobalConfig } from "payload";
import { adminsOnly } from "../access";
import { encryptAPIKey, isEncryptedAPIKey, MASKED_API_KEY } from "../ai/credentials";

export const AISettings: GlobalConfig = {
  slug: "ai-settings",
  label: "AI wallpaper settings",
  access: { read: adminsOnly, update: adminsOnly },
  admin: {
    group: "Tools",
    description: "Connect Google AI Studio once, then use AI for wallpaper generation, batch SEO, blog drafts and newsletters.",
  },
  fields: [
    { name: "enabled", type: "checkbox", defaultValue: true, label: "Enable AI tools" },
    { name: "provider", type: "select", defaultValue: "gemini", options: ["gemini"] },
    {
      // Keep the existing database field name to avoid a destructive production
      // schema migration. In the Admin UI this field is presented only as the key.
      name: "model",
      type: "text",
      label: "Google AI Studio API key",
      admin: {
        description: "Paste a key from Google AI Studio. It is encrypted before database storage and is never returned to the browser. Leave the masked value unchanged to keep the current key.",
      },
      hooks: {
        beforeValidate: [({ originalDoc, value }) => {
          const current = originalDoc?.model;
          if (value === MASKED_API_KEY || value === "" || value == null) {
            return isEncryptedAPIKey(current) ? current : "";
          }
          if (isEncryptedAPIKey(value)) return value;
          return encryptAPIKey(String(value));
        }],
        afterRead: [({ context, value }) => {
          if (context?.revealAISecret) return value;
          return isEncryptedAPIKey(value) ? MASKED_API_KEY : "";
        }],
      },
    },
    { name: "imageSize", type: "select", defaultValue: "2K", options: ["1K", "2K", "4K"], label: "Generated wallpaper size" },
    { name: "dailyLimit", type: "number", min: 1, max: 100, defaultValue: 25, label: "Daily image generation limit" },
    {
      name: "credentialStatus",
      type: "text",
      virtual: true,
      defaultValue: "Paste the API key above and save. One connection powers every AI tool.",
      admin: {
        readOnly: true,
        description: "AI image analysis uses Gemini 3.6 Flash. Wallpaper generation uses Gemini 3.1 Flash Image.",
      },
    },
  ],
};

import type { GlobalConfig } from "payload";
import { adminsOnly } from "../access";

export const AdvertisementSettings: GlobalConfig = {
  slug: "advertisement-settings",
  label: "Advertisement settings",
  access: { read: adminsOnly, update: adminsOnly },
  admin: { group: "Monetization" },
  fields: [
    { name: "enabled", type: "checkbox", defaultValue: false },
    {
      name: "provider",
      type: "select",
      defaultValue: "adsense",
      options: ["adsense", "adsterra", "custom"],
    },
    { name: "publisherId", type: "text", admin: { description: "Public publisher ID only. Never store account passwords here." } },
    {
      name: "placements",
      type: "array",
      fields: [
        { name: "key", type: "text", required: true },
        { name: "label", type: "text", required: true },
        { name: "slotId", type: "text" },
        { name: "enabled", type: "checkbox", defaultValue: false },
      ],
    },
    { name: "affiliateDisclosure", type: "textarea" },
  ],
};

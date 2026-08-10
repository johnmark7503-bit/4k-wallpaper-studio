import type { CollectionConfig } from "payload";
import { adminsOnly } from "../access";

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    tokenExpiration: 8 * 60 * 60,
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
  },
  trash: true,
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "name", "role", "updatedAt"],
    group: "Administration",
  },
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: adminsOnly,
    update: ({ req, id }) => {
      const user = req.user as { id?: string | number; role?: string } | null;
      return user?.role === "admin" || String(user?.id) === String(id);
    },
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "author",
      saveToJWT: true,
      options: [
        { label: "Administrator", value: "admin" },
        { label: "Editor", value: "editor" },
        { label: "Author", value: "author" },
      ],
    },
  ],
};

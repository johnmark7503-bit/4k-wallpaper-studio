import type { Access } from "payload";

type StudioRole = "admin" | "editor" | "author";

function hasRole(user: unknown, roles: StudioRole[]) {
  if (!user || typeof user !== "object") return false;
  const candidate = user as { collection?: string; role?: StudioRole };
  return Boolean(
    candidate.collection === "users" &&
      candidate.role &&
      roles.includes(candidate.role),
  );
}

export const adminsOnly: Access = ({ req }) => hasRole(req.user, ["admin"]);

export const adminsAndEditors: Access = ({ req }) =>
  hasRole(req.user, ["admin", "editor"]);

export const contentTeam: Access = ({ req }) =>
  hasRole(req.user, ["admin", "editor", "author"]);

export const publishedOrLoggedIn: Access = ({ req }) => {
  if (hasRole(req.user, ["admin", "editor", "author"])) return true;
  return { _status: { equals: "published" } };
};

export const anyone: Access = () => true;

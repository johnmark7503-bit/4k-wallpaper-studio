import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const action = process.argv[2];
const projectRoot = process.cwd();
const source = path.join(projectRoot, "cms", "next-app");
const destination = path.join(projectRoot, "app", "(payload)");

if (action === "enable") {
  await rm(destination, { force: true, recursive: true });
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true });
} else if (action === "disable") {
  await rm(destination, { force: true, recursive: true });
} else {
  throw new Error("Usage: node scripts/prepare-payload-routes.mjs <enable|disable>");
}

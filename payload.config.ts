import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import sharp from "sharp";
import { AISettings } from "./cms/globals/AISettings";
import { AdvertisementSettings } from "./cms/globals/AdvertisementSettings";
import { Homepage } from "./cms/globals/Homepage";
import { SiteSettings } from "./cms/globals/SiteSettings";
import { BlogPosts } from "./cms/collections/BlogPosts";
import { Categories } from "./cms/collections/Categories";
import { Collections } from "./cms/collections/Collections";
import { Media } from "./cms/collections/Media";
import { NewsletterSubscribers } from "./cms/collections/NewsletterSubscribers";
import { Pages } from "./cms/collections/Pages";
import { Users } from "./cms/collections/Users";
import { Wallpapers } from "./cms/collections/Wallpapers";
import { batchUploadEndpoint, batchUploadOptionsEndpoint } from "./cms/endpoints/batchUpload";
import { aiEndpoints } from "./cms/endpoints/ai";
import { seedDemoEndpoint } from "./cms/endpoints/seedDemo";
import {
  getMediaStorageProvider,
  getR2PublicFileUrl,
  getR2StorageConfig,
  MEDIA_PREFIX,
} from "./cms/storage/r2";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
const mediaStorageProvider = getMediaStorageProvider();

const mediaStoragePlugin = mediaStorageProvider === "r2"
  ? (() => {
      const r2 = getR2StorageConfig();
      return s3Storage({
        alwaysInsertFields: true,
        bucket: r2.bucket,
        clientUploads: true,
        collections: {
          media: {
            prefix: MEDIA_PREFIX,
            disablePayloadAccessControl: true,
            generateFileURL: ({ filename: mediaFilename, prefix }) =>
              getR2PublicFileUrl(r2.publicBaseUrl, mediaFilename, prefix),
          },
        },
        config: {
          credentials: {
            accessKeyId: r2.accessKeyId,
            secretAccessKey: r2.secretAccessKey,
          },
          endpoint: r2.endpoint,
          forcePathStyle: true,
          region: "auto",
        },
      });
    })()
  : vercelBlobStorage({
      collections: { media: { prefix: MEDIA_PREFIX } },
      token: blobToken,
      enabled: Boolean(blobToken),
      addRandomSuffix: true,
      alwaysInsertFields: true,
    });

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: "— 4K Wallpaper Studio",
      description: "Manage wallpapers, editorial content, media, SEO and monetization.",
    },
    importMap: {
      baseDir: dirname,
      importMapFile: path.resolve(dirname, "cms/next-app/studio/importMap.js"),
    },
  },
  routes: {
    admin: "/studio",
    api: "/cms-api",
    graphQL: "/cms-api/graphql",
    graphQLPlayground: "/cms-api/graphql-playground",
  },
  collections: [
    Users,
    Media,
    Wallpapers,
    Categories,
    Collections,
    BlogPosts,
    Pages,
    NewsletterSubscribers,
  ],
  globals: [Homepage, SiteSettings, AdvertisementSettings, AISettings],
  endpoints: [seedDemoEndpoint, batchUploadOptionsEndpoint, batchUploadEndpoint, ...aiEndpoints],
  editor: lexicalEditor(),
  db: postgresAdapter({
    push: process.env.PAYLOAD_SCHEMA_PUSH === "true",
    pool: {
      connectionString:
        process.env.DATABASE_URL ?? "postgres://payload:payload@127.0.0.1:5432/wallpaper_studio",
      max: 10,
    },
  }),
  secret: process.env.PAYLOAD_SECRET ?? randomBytes(32).toString("hex"),
  sharp,
  plugins: [mediaStoragePlugin],
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});

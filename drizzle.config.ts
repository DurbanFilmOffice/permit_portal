import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema/*.ts",
  out: "./db/migrations",
  dbCredentials: {
    url: process.env.DIRECT_DATABASE_URL!,  // ← direct connection for migrations
  },
  verbose: true,
  strict: true,
});

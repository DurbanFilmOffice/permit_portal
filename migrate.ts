import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = postgres(process.env.DATABASE_URL!, { ssl: "require", max: 1 });
const db = drizzle(client);

try {
  await migrate(db, { migrationsFolder: "./db/migrations" });
  console.log("✅ Migrations applied successfully");
} catch (err) {
  console.error("❌ Migration failed:", err);
} finally {
  await client.end();
}

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

// const client = postgres(process.env.DATABASE_URL!);
const client = postgres(process.env.DATABASE_URL!, {
  max: 10, // max connections in pool
  idle_timeout: 20, // close idle connections after 20s
  connect_timeout: 10, // fail fast if can't connect
  prepare: false, // required for Supabase transaction mode pooler
});
export const db = drizzle(client, { schema });

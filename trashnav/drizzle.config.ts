import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/utils/db/schema.ts",
  out: "./src/utils/db/migrations",
  dbCredentials: {
    url : 'postgresql://neondb_owner:npg_bUzwpf3yaR8S@ep-black-recipe-a8blu9oy.eastus2.azure.neon.tech/neondb?sslmode=require',
  },
});

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// const sql = neon(process.env.DATABASE_URL!);
const sql = neon('postgresql://neondb_owner:npg_bUzwpf3yaR8S@ep-fancy-tooth-a8c1ht2x.eastus2.azure.neon.tech/neondb?sslmode=require');
const db = drizzle(sql);

export { db };

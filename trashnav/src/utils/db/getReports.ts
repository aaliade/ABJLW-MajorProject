import { db } from './index'; // adjust path to your db instance
import { Reports } from './schema'; // adjust path to your schema

export async function getReports() {
  try {
    const reports = await db.select().from(Reports);
    //console.log("📋 Reports:", reports);
    return reports;
  } catch (err) {
    console.error("❌ Failed to fetch reports:", err);
  }
}



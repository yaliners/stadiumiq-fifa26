process.env.SEEDING = "true";
import { getWritableDb, saveDb } from "./server/db";
import { seedDatabase } from "./server/seed";

async function seed() {
  console.log("Seeding database via CLI wrapper...");
  let db: any;
  try {
    db = await getWritableDb();
    await seedDatabase(db);
    saveDb(db);
    console.log("Database seeded successfully and stadium_ops.db saved to disk!");
  } catch (error) {
    console.error("Failed to seed database:", error);
  } finally {
    if (db) {
      db.close();
    }
  }
}

seed();

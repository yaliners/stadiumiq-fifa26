import initSqlJs from "sql.js";
import fs from "fs";
import path from "path";
import { seedDatabase } from "./seed";

const dbPath = path.resolve(process.cwd(), "stadium_ops.db");

let SQLInstance: any = null;

export async function getSQL(): Promise<any> {
  if (!SQLInstance) {
    // Note: Node environment loads the wasm file automatically or we can initialize
    SQLInstance = await initSqlJs();
  }
  return SQLInstance;
}

/**
 * Returns a SQLite Database instance loaded from the binary file on disk.
 */
export async function getReadOnlyDb(): Promise<any> {
  const SQL = await getSQL();
  let fileBuffer: Buffer;
  let isNewOrCorrupt = false;
  if (fs.existsSync(dbPath)) {
    try {
      fileBuffer = fs.readFileSync(dbPath);
      const testDb = new SQL.Database(fileBuffer);
      // Run a simple test statement to verify health
      testDb.run("SELECT 1;");
      
      // Verify if required tables are present
      const tableCheck = testDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='stadiums';");
      const hasStadiums = tableCheck.step();
      tableCheck.free();
      if (!hasStadiums) {
        throw new Error("Missing 'stadiums' table, database requires seeding.");
      }
      return testDb;
    } catch (e) {
      console.error("Database file exists but is malformed/corrupt or unseeded. Resetting it.", e);
      try {
        fs.unlinkSync(dbPath);
      } catch (err) {}
      fileBuffer = Buffer.alloc(0);
      isNewOrCorrupt = true;
    }
  } else {
    fileBuffer = Buffer.alloc(0);
    isNewOrCorrupt = true;
  }

  if (isNewOrCorrupt && process.env.SEEDING !== "true") {
    try {
      console.log("[db] Database is empty, missing tables, or corrupt. Seeding programmatically...");
      const db = new SQL.Database();
      await seedDatabase(db);
      saveDb(db);
      return db;
    } catch (seedErr) {
      console.error("[db] Failed to seed database dynamically:", seedErr);
    }
  }
  return new SQL.Database(fileBuffer);
}

/**
 * Same as read-only, but returned for writable/seeding operations.
 */
export async function getWritableDb(): Promise<any> {
  return getReadOnlyDb();
}

/**
 * Saves a SQLite Database instance back to the binary file on disk.
 */
export function saveDb(db: any): void {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

/**
 * Helper to query all rows from a statement.
 */
export function dbAll(db: any, sql: string, params: any[] = []): any[] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: any[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Helper to query a single row from a statement.
 */
export function dbGet(db: any, sql: string, params: any[] = []): any {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  let row: any = null;
  if (stmt.step()) {
    row = stmt.getAsObject();
  }
  stmt.free();
  return row;
}

/**
 * Helper to execute a query statement (inserts/updates/tables).
 */
export function dbRun(db: any, sql: string, params: any[] = []): void {
  db.run(sql, params);
}

/**
 * safeDbQuery helper wraps DB access, catching any sqlite errors and returning null.
 * It loads the database from disk, executes the query function, and closes the database.
 */
export async function safeDbQuery<T>(
  queryFn: (db: any) => T
): Promise<T | null> {
  let db: any = null;
  try {
    db = await getReadOnlyDb();
    const result = queryFn(db);
    return result;
  } catch (error) {
    console.error("Database query failed (safeDbQuery caught error):", error);
    return null;
  } finally {
    if (db) {
      try {
        db.close();
      } catch (err) {
        console.error("Error closing DB:", err);
      }
    }
  }
}

import initSqlJs from "sql.js";
import fs from "fs";
import path from "path";
import { seedDatabase } from "./seed";

const dbPath = path.resolve(process.cwd(), "stadium_ops.db");

let masterBuffer: Buffer | null = null;
let SQLInstance: initSqlJs.SqlJsStatic | null = null;

export async function getSQL(): Promise<initSqlJs.SqlJsStatic> {
  if (!SQLInstance) {
    // Note: Node environment loads the wasm file automatically or we can initialize
    SQLInstance = await initSqlJs();
  }
  return SQLInstance;
}

/**
 * Returns a SQLite Database instance loaded from the binary file on disk.
 */
export async function getReadOnlyDb(): Promise<initSqlJs.Database> {
  const SQL = await getSQL();
  
  if (masterBuffer === null) {
    let fileBuffer: Buffer = Buffer.alloc(0);
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
        testDb.close();
        
        if (!hasStadiums) {
          throw new Error("Missing 'stadiums' table, database requires seeding.");
        }
        masterBuffer = fileBuffer;
      } catch (e) {
        console.error("Database file exists but is malformed/corrupt or unseeded. Resetting it.", e);
        try {
          fs.unlinkSync(dbPath);
        } catch (err) {}
        masterBuffer = Buffer.alloc(0);
        isNewOrCorrupt = true;
      }
    } else {
      masterBuffer = Buffer.alloc(0);
      isNewOrCorrupt = true;
    }

    if (isNewOrCorrupt && process.env.SEEDING !== "true") {
      try {
        console.log("[db] Database is empty, missing tables, or corrupt. Seeding programmatically...");
        const db = new SQL.Database();
        await seedDatabase(db);
        const data = db.export();
        masterBuffer = Buffer.from(data);
        fs.writeFileSync(dbPath, masterBuffer);
        db.close();
      } catch (seedErr) {
        console.error("[db] Failed to seed database dynamically:", seedErr);
      }
    }
  }

  return new SQL.Database(masterBuffer);
}

/**
 * Same as read-only, but returned for writable/seeding operations.
 */
export async function getWritableDb(): Promise<initSqlJs.Database> {
  return getReadOnlyDb();
}

/**
 * Saves a SQLite Database instance back to the binary file on disk.
 */
export function saveDb(db: initSqlJs.Database): void {
  const data = db.export();
  const buffer = Buffer.from(data);
  masterBuffer = buffer;
  try {
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.error("Failed to write database back to disk:", err);
  }
}

/**
 * Helper to query all rows from a statement.
 */
export function dbAll(db: initSqlJs.Database, sql: string, params: (string | number | boolean | null)[] = []): any[] {
  const stmt = db.prepare(sql);
  stmt.bind(params as any);
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
export function dbGet(db: initSqlJs.Database, sql: string, params: (string | number | boolean | null)[] = []): any {
  const stmt = db.prepare(sql);
  stmt.bind(params as any);
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
export function dbRun(db: initSqlJs.Database, sql: string, params: (string | number | boolean | null)[] = []): void {
  db.run(sql, params as any);
}

/**
 * safeDbQuery helper wraps DB access, catching any sqlite errors and returning null.
 * It loads the database from disk, executes the query function, and closes the database.
 */
export async function safeDbQuery<T>(
  queryFn: (db: initSqlJs.Database) => T
): Promise<T | null> {
  let db: initSqlJs.Database | null = null;
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

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

// Resolve database path
const DB_DIR = path.resolve(__dirname, '../data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
const DB_PATH = path.join(DB_DIR, 'tasks.sqlite');

// Initialize database
console.log(`Connecting to SQLite database at: ${DB_PATH}`);
const db = new Database(DB_PATH);

// Optimize database performance
db.pragma('journal_mode = WAL');

// Helper functions wrapping better-sqlite3 in Promises for async-compatible routing
export const dbRun = (sql: string, params: any[] = []): Promise<{ id: string | number; changes: number }> => {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(sql);
      const info = stmt.run(params);
      const insertId = typeof info.lastInsertRowid === 'bigint' ? info.lastInsertRowid.toString() : info.lastInsertRowid;
      resolve({ id: insertId, changes: info.changes });
    } catch (err) {
      reject(err);
    }
  });
};

export const dbGet = <T>(sql: string, params: any[] = []): Promise<T | undefined> => {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(sql);
      const row = stmt.get(params);
      resolve(row as T | undefined);
    } catch (err) {
      reject(err);
    }
  });
};

export const dbAll = <T>(sql: string, params: any[] = []): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(sql);
      const rows = stmt.all(params);
      resolve(rows as T[]);
    } catch (err) {
      reject(err);
    }
  });
};

export const initDB = (): void => {
  console.log('Initializing database schema with better-sqlite3...');

  // Check if tasks table exists and has 'created_at' column (legacy schema detection)
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='tasks'").get();
  if (tableCheck) {
    const columns = db.prepare("PRAGMA table_info(tasks)").all() as any[];
    const hasCreatedAt = columns.some(col => col.name === 'created_at');
    if (!hasCreatedAt) {
      console.log('Detected legacy tasks table. Dropping it to apply new schema migration...');
      db.exec('DROP TABLE IF EXISTS tasks');
    }
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      due_date TEXT DEFAULT NULL,
      completed INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Check if seeding is needed
  const countRow = db.prepare('SELECT COUNT(*) as total FROM tasks').get() as { total: number };
  
  if (countRow && countRow.total === 0) {
    console.log('Seeding initial placeholder tasks...');
    const now = new Date().toISOString();
    
    // Seed default tasks matching the new task schema
    const seedTasks = [
      {
        id: randomUUID(),
        title: 'Learn Zod validation',
        description: 'Practice schema-driven validation in Express routers with Zod.',
        due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
        completed: 0
      },
      {
        id: randomUUID(),
        title: 'Explore better-sqlite3 performance',
        description: 'Benchmark query execution speed using better-sqlite3 driver library.',
        due_date: new Date(Date.now() + 172800000).toISOString().split('T')[0], // in 2 days
        completed: 0
      },
      {
        id: randomUUID(),
        title: 'Initialise monorepo structure',
        description: 'Successfully scaffolded monorepo using React + Vite client and Node + Express server.',
        due_date: new Date().toISOString().split('T')[0], // today
        completed: 1
      }
    ];

    const insertStmt = db.prepare(`
      INSERT INTO tasks (id, title, description, due_date, completed, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // Run seeding inside a transaction
    const seedTransaction = db.transaction((tasks) => {
      for (const t of tasks) {
        insertStmt.run(t.id, t.title, t.description, t.due_date, t.completed, now, now);
      }
    });

    seedTransaction(seedTasks);
    console.log('Database seeded successfully with new tasks schema!');
  }
};

export default db;

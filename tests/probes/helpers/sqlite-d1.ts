import { DatabaseSync, type StatementSync, type SQLInputValue } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export interface D1Result<T = Record<string, unknown>> {
  results?: T[];
  success: boolean;
  meta: { changes: number };
}

export interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  run(): Promise<D1Result>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  first<T = Record<string, unknown>>(columnName?: string): Promise<T | null>;
}

export interface LocalD1 {
  prepare(sql: string): D1Statement;
  batch(statements: D1Statement[]): Promise<D1Result[]>;
  exec(sql: string): void;
  close(): void;
}

export function createSqliteD1(): LocalD1 {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('PRAGMA foreign_keys = ON');
  const migration = fileURLToPath(new URL('../../../probes/migrations/0001_probe.sql', import.meta.url));
  sqlite.exec(readFileSync(migration, 'utf8'));

  function statement(sql: string, values: SQLInputValue[] = []): D1Statement {
    let prepared: StatementSync | undefined;
    const getPrepared = () => (prepared ??= sqlite.prepare(sql));
    return {
      bind(...bound) { return statement(sql, bound as SQLInputValue[]); },
      async run() {
        const result = getPrepared().run(...values);
        return { success: true, meta: { changes: Number(result.changes) } };
      },
      async all<T>() {
        const results = getPrepared().all(...values) as T[];
        return { success: true, results, meta: { changes: results.length } };
      },
      async first<T>(columnName?: string) {
        const row = getPrepared().get(...values) as Record<string, unknown> | undefined;
        return (row ? (columnName ? row[columnName] : row) : null) as T | null;
      },
    };
  }

  return {
    prepare: (sql) => statement(sql),
    batch: async (statements) => {
      sqlite.exec('BEGIN');
      try {
        const results: D1Result[] = [];
        for (const item of statements) results.push(await item.run());
        sqlite.exec('COMMIT');
        return results;
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    },
    exec: (sql) => sqlite.exec(sql),
    close: () => sqlite.close(),
  };
}

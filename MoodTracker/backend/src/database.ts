import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '../data/mood_tracker.db');

export class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Erro ao conectar ao banco:', err);
      } else {
        console.info('Conectado ao banco SQLite');
        this.initializeTables();
      }
    });
  }

  private initializeTables() {
    this.db.serialize(() => {
      // Tabela de usuários
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          nome TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          senhaHash TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          criadoEm TEXT NOT NULL,
          atualizadoEm TEXT NOT NULL
        )
      `);

      // Tabela de registros de humor
      this.db.run(`
        CREATE TABLE IF NOT EXISTS mood_entries (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          humor TEXT NOT NULL,
          comentario TEXT,
          dataHora TEXT NOT NULL,
          FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Tabela de dados ambientais
      this.db.run(`
        CREATE TABLE IF NOT EXISTS environment_data (
          id TEXT PRIMARY KEY,
          temperatura REAL NOT NULL,
          luminosidade REAL NOT NULL,
          ruido REAL NOT NULL,
          dataHora TEXT NOT NULL
        )
      `);

      // Tabela de alertas
      this.db.run(`
        CREATE TABLE IF NOT EXISTS alerts (
          id TEXT PRIMARY KEY,
          tipo TEXT NOT NULL,
          mensagem TEXT NOT NULL,
          dataHora TEXT NOT NULL,
          userId TEXT,
          lido INTEGER DEFAULT 0,
          FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
    });
  }

  run(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export const db = new Database();

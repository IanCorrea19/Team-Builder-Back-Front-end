import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'pokemon.db');

export const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS perfis (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    avatar TEXT NOT NULL,
    salt TEXT NOT NULL,
    senhaHash TEXT NOT NULL,
    criadoEm INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS equipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    perfilId TEXT NOT NULL,
    pokemonId INTEGER NOT NULL,
    nome TEXT NOT NULL,
    imagem TEXT NOT NULL,
    tipos TEXT NOT NULL,

    FOREIGN KEY (perfilId)
      REFERENCES perfis(id)
      ON DELETE CASCADE
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_perfis_nome_avatar
  ON perfis(nome, avatar);
`);
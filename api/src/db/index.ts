import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema.js'; // Importa tudo do seu schema (tabelas e relações)

const sqlite = new Database('sqlite.db');

// Passamos o schema no segundo argumento para habilitar o db.query
export const db = drizzle(sqlite, { schema });
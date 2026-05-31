import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema.js'; // importa todas as tabelas do schema de uma vez

// abre (ou cria) o arquivo sqlite.db no disco
const sqlite = new Database('sqlite.db');

// cria a instância do Drizzle passando:
// sqlite -> a conexão com o banco
// { schema } -> as tabelas, para o Drizzle saber a estrutura do banco
export const db = drizzle(sqlite, { schema });

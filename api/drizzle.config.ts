import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    // onde estão definidas as tabelas do banco (estrutura/colunas)
    schema: './src/db/schema.ts',
    
    out: './drizzle',

    // qual banco de dados está sendo usado
    dialect: 'sqlite',
    dbCredentials: {
        // onde vai ficar salvo o arquivo .db
        url: 'sqlite.db'
    },
});

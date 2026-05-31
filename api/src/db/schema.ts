import {
  integer,
  sqliteTable,
  text,
  primaryKey
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const bookmarks = sqliteTable("bookmarks", {
  // chave primária, incrementa automaticamente
  id: integer("id").primaryKey({ autoIncrement: true }),

  title: text("title").notNull(), // texto obrigatório
  url: text("url").notNull(),     // texto obrigatório

  // salva como inteiro no banco (unix timestamp)
  // mode: "timestamp" -> Drizzle converte automaticamente para Date no TypeScript
  // $defaultFn -> data/hora atual da inserção
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // .unique() -> não permite tags duplicadas no banco
  name: text("name").notNull().unique(),
});

// === TABELA DE JUNÇÃO ===
// tabela de relacionamento N:N entre bookmarks e tags
// um bookmark pode ter muitas tags, uma tag pode estar em muitos bookmarks

// tabela de relacionamento N:N entre bookmarks e tags
export const bookmarkTags = sqliteTable( "bookmark_tags", {

    // chave estrangeira -> aponta para bookmarks.id
    // onDelete: "cascade" -> se o bookmark for deletado, os vínculos são deletados junto
    bookmarkId: integer("bookmark_id")
      .notNull()
      .references(() => bookmarks.id, { onDelete: "cascade" }),

    // mesma coisa que o de cima
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  }, 
  // chave primária composta -> a combinação bookmarkId + tagId deve ser única
  // impede que o mesmo bookmark seja vinculado à mesma tag duas vezes
  (table) => [primaryKey({ columns: [table.bookmarkId, table.tagId] })],
);

// === RELACIONAMENTOS ===
// os relations dizem ao Drizzle como navegar entre as tabelas nas queries

// um bookmark pode ter muitos vínculos de tags
export const bookmarksRelations = relations(bookmarks, ({ many }) => ({
  bookmarkTags: many(bookmarkTags),
}));

// uma tag pode estar em muitos vínculos de bookmarks
export const tagsRelations = relations(tags, ({ many }) => ({
  bookmarkTags: many(bookmarkTags),
}));

// define o relacionamento inverso da tabela de junção
// necessário para o Drizzle conseguir navegar de bookmarkTags até bookmark e tag
export const bookmarkTagsRelations = relations(bookmarkTags, ({ one }) => ({
  bookmark: one(bookmarks, {
    fields: [bookmarkTags.bookmarkId], // coluna desta tabela (bookmarkTags)
    references: [bookmarks.id],        // coluna da tabela de destino (bookmarks)
  }),
  
  // Mesma coisa que o de cima, só troca tabela de destino
  tag: one(tags, {
    fields: [bookmarkTags.tagId],
    references: [tags.id],
  })
}));
import express from 'express';
import type { Request, Response } from 'express';
import { db } from './db/index.js';
import { bookmarks, tags, bookmarkTags } from './db/schema.js';
import { eq } from 'drizzle-orm';

const app = express();
app.use(express.json());

// 1. POST /bookmarks -> Criar bookmark e associar tags
app.post('/bookmarks', async (req: Request, res: Response): Promise<any> => {
  const { title, url, tags: tagNames } = req.body;

  if (!title || !url) {
    return res.status(400).json({ error: 'Title and URL are required' });
  }

  try {
    // Inserir o bookmark
    const [insertedBookmark] = await db.insert(bookmarks)
      .values({ title, url })
      .returning();

    if (tagNames && Array.isArray(tagNames)) {
      for (const name of tagNames) {
        const cleanName = name.trim().toLowerCase();
        if (!cleanName) continue;

        // Inserir tag se não existir, ou buscar a existente
        const [insertedTag] = await db.insert(tags)
          .values({ name: cleanName })
          .onConflictDoUpdate({ target: tags.name, set: { name: cleanName } })
          .returning();

        // Vincular na tabela pivô
        await db.insert(bookmarkTags)
          .values({
            bookmarkId: insertedBookmark.id,
            tagId: insertedTag.id,
          })
          .onConflictDoNothing();
      }
    }

    return res.status(201).json({ message: 'Bookmark created successfully', id: insertedBookmark.id });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. GET /bookmarks -> Listar tudo com suas respectivas tags
app.get('/bookmarks', async (_req: Request, res: Response) => {
  try {
    const results = await db.query.bookmarks.findMany({
      with: {
        bookmarkTags: {
          with: {
            tag: true,
          },
        },
      },
    });

    // Formatar a resposta para achatar a estrutura relacional do Drizzle
    const formatted = results.map((b) => ({
      id: b.id,
      title: b.title,
      url: b.url,
      createdAt: b.createdAt,
      tags: b.bookmarkTags.map((bt) => bt.tag.name),
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. DELETE /bookmarks/:id -> Deletar bookmark (Cascata limpa a tabela pivô)
app.delete('/bookmarks/:id', async (req: Request, res: Response): Promise<any> => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  try {
    const result = await db.delete(bookmarks).where(eq(bookmarks.id, id)).returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    return res.json({ message: 'Bookmark deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server executing on http://localhost:${PORT}`);
});
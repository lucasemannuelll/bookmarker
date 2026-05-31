import express from 'express';
import cors from 'cors';
import type { Request, Response } from 'express';
import { db } from './db/index.js'; // importa o db configurada com Drizzle
import { bookmarks, tags, bookmarkTags } from './db/schema.js'; // importa as tabelas do db
import { eq } from 'drizzle-orm';

// cria o servidor Express
const app = express();

// permite requisições do frontend
app.use(cors());

// lê o body das requisições como JSON
app.use(express.json());

// rota POST /bookmarks -> cria um novo bookmark com suas tags
app.post('/bookmarks', async (req: Request, res: Response): Promise<void> => {
  // desconstroi a requisição 
  const { title, url, tags: tagNames } = req.body;

  if (!title || !url) {
    // retorna erro se título ou url estiverem faltando
    res.status(400).json({ error: 'Title and URL are required' });
    return;
  }

  try {
    // Inseri os valores no db
    const [insertedBookmark] = await db.insert(bookmarks)
      .values({ title, url }) // oq é inserido
      .returning();           // pega o id do valor inserido

    // verifica se vieram tags E se são um array
    if (tagNames && Array.isArray(tagNames)) {

      // percorre cada tag enviada
      for (const name of tagNames) {

        // remove espaços e deixa tudo minúsculo
        const cleanName = name.trim().toLowerCase();

        // se a tag ficou vazia depois de limpar, pula para a próxima
        if (!cleanName) continue;

        // Inserir tag se não existir, ou atualiza se ja existe
        const [insertedTag] = await db.insert(tags)
          .values({ name: cleanName })
          // se a tag já existe no banco, apenas atualiza (não cria duplicata)
          .onConflictDoUpdate({ target: tags.name, set: { name: cleanName } })
          .returning(); // pega o id da tag inserida/atualiza

        // Adiciona na tabela de junção
        await db.insert(bookmarkTags)
           // Os IDs que a gente pegou com .returning()
          .values({ bookmarkId: insertedBookmark.id, tagId: insertedTag.id })
          // se ja existir, ignora
          .onConflictDoNothing();
      }
    }
    // retorna sucesso com o id do bookmark criado
    res.status(201).json({ message: 'Bookmark created successfully', id: insertedBookmark.id });

  } catch (error) {
    // retorna erro genérico se algo falhar no db
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Listar tudo com suas respectivas tags
// // _req -> underscore indica que o parâmetro não é usado nessa rota
app.get('/bookmarks', async (_req: Request, res: Response) => {
  try {
    // busca todos os bookmarks do banco
    const results = await db.query.bookmarks.findMany({
      with: {
        // inclui a tabela pivô (bookmarkTags) no resultado
        bookmarkTags: {
          with: {
            tag: true, // inclui os dados da tag de cada vínculo
          },
        },
      },
    });
    // results -> array com cada bookmark e suas tags
    // ex: { id: 1, title: "github", bookmarkTags: [{ tag: { id: 1, name: "programaçao" } }]

    // transforma cada bookmark em um formato mais limpo para o frontend
    const formatted = results.map((b) => ({
      id: b.id,
      title: b.title,
      url: b.url,
      createdAt: b.createdAt,
      tags: b.bookmarkTags.map((bt) => bt.tag.name), // extrai só o nome de cada tag → ["js", "react"]
    }));

    // retorna o array formatado como JSON
    res.json(formatted);

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// deleta um bookmark pelo id
// :id → parâmetro dinâmico na URL, ex: /bookmarks/5
app.delete('/bookmarks/:id', async (req: Request, res: Response): Promise<any> => {

  // req.params.id -> pega o :id da URL como string (ex: "5")
  // parseInt(..., 10) -> converte para número inteiro na base 10 (ex: "5" → 5)
  const id = parseInt(req.params.id, 10);

  // se o id não for um número válido retorna erro
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  try {
    const result = await db.delete(bookmarks)
        .where(eq(bookmarks.id, id))
        .returning(); // retorna o ID deletado

    // nenhum bookmark foi deletado, ou seja, o id não existia
    if (result.length === 0) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    return res.json({ message: 'Bookmark deleted successfully' });

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// porta onde o servidor vai rodar
const PORT = 3000;

// inicia o servidor e fica "escutando" requisições na porta 3000
app.listen(PORT, () => {
  console.log(`Server executing on http://localhost:${PORT}`);
});

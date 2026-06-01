import React, { useState, useEffect } from "react";

// Interface: descreve o formato que um objeto deve ter.
// Toda vez que você criar um "Bookmark", 
// ele precisa ter exatamente esses campos
interface Bookmark {
  id: number;
  title: string;
  url: string;
  createdAt: string;
  tags: string[];
}

export default function App() {
  // useState armazena dados que mudam na tela (estado)
  // [bookmarks, setBookmarks] -> valor atual e função pra atualizar
  // Garante que Bookmark[] garante que objeto === interface
  // ([]) -> começa como array vazio, os dados vêm da API depois
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  // Estados dos campos do formulário — todos começam como string vazia
  // TypeScript já infere o tipo string pelo valor inicial (""), sem precisar de <string>
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [search, setSearch] = useState("");

  const API_URL = "http://localhost:3000/bookmarks";

  // Busca todos os bookmarks da API e atualiza o estado
  const fetchBookmarks = async () => {
    try {
      const res = await fetch(API_URL); // Pedi todos os bookmarks para a API
      const data = await res.json();    // Converte a resposta de JSON para objeto JS e espera
      setBookmarks(data);               // atualiza o estado com os bookmarks recebidos

    } catch (err) { // captura qualquer erro de rede ou parsing
      console.error(`Erro ao buscar bookmark: ${err}`);
    }
  };

  // busca os bookmarks assim que a página carrega
  // apena uma vez
  useEffect(() => {
    fetchBookmarks();
  }, []);

  // É aqui que cria novos bookmarks
  // Manda o bookmark pra API quando o formulario é submetido
  // o 'e' é um evento que acontece quando o salva um novo bookmark
  const handleSubmit = async (e: React.SubmitEvent) => {
    // impede a página de recarregar quando o user salva um novo bookmark
    e.preventDefault();

    // caso title e url estejam vazios permite que a operaçao conclua
    if (!title || !url) return;

    // converte a string de tags em array limpo
    // ex: "react, hooks, ts" -> ["react", "hooks", "ts"]
    const tagsArray = tagsInput
      .split(",")                   // separa por vírgula
      .map((t) => t.trim())         // remove espaços extra de cada item
      .filter((t) => t.length > 0); // remove itens vazios

    try {
      const res = await fetch(API_URL, {
        method: "POST", // define o método HTTP como POST, ou seja eu vou tó adicionando coisa
        headers: { "Content-Type": "application/json" }, // avisa a API que estamos enviando JSON
        body: JSON.stringify({ title, url, tags: tagsArray }), // converte o objeto JS para string JSON
      });

      if (res.ok) {       // se der certo:
        setTitle("");     // limpa o campo título
        setUrl("");       // limpa o campo url
        setTagsInput(""); // limpa o campo tags
        fetchBookmarks(); // e recarrega a lista com o novo bookmark incluído
      }
    } catch (err) {
      console.error(`Error ao salvar: ${err}`);
    }
  };

  // Deleta um bookmark da API pelo id e atualiza a lista
  const handleDelete = async (id: number) => { // recebe o id do bookmark a ser deletado
    try {
      // monta a URL com o id → ex: http://localhost:3000/bookmarks/5
      // envia uma requisição DELETE para a API
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (res.ok) fetchBookmarks(); // se der certo atualiza a lista

    } catch (err) {
      console.error(`Error ao deletar ${err}`);
    }
  };

  // filtra os bookmarks em tempo real conforme o usuário digita na busca
  const filteredBookmarks = bookmarks.filter((b) => { // percorre cada bookmark do array
    const matchText =
      b.title.toLowerCase().includes(search.toLowerCase()) || // busca no título
      b.url.toLowerCase().includes(search.toLowerCase());     // ou na url
      // .toLowerCase() em ambos os lados pra ser case-insensitive

    const matchTag = b.tags.some((t) =>               // percorre as tags do bookmark
      t.toLowerCase().includes(search.toLowerCase()), // verifica se alguma tag bate com a busca
    ); 
    // .some() -> retorna true se PELO MENOS UMA tag corresponder

    return matchText || matchTag; // inclui o bookmark se bater no texto OU em alguma tag
  });

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "0 20px",
        fontFamily: "sans-serif",
        color: "#333",
      }}
    >
      <h1>Personal Bookmarks</h1>

      {/* Formulário de Adicionar */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginBottom: "30px",
          padding: "20px",
          background: "#f4f4f5",
          borderRadius: "8px",
        }}
      >
        <h3>Adicionar Novo Link</h3>
        <input
          type="text"
          placeholder="Título (ex: Neovim)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <input
          type="url"
          placeholder="URL (ex: https://neovim.io)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <input
          type="text"
          placeholder="Tags separadas por vírgula (ex: terminal, editor)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px",
            background: "#000",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Salvar Bookmark
        </button>
      </form>

      {/* Barra de Busca */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="🔍 Buscar por título, URL ou tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            borderRadius: "6px",
            border: "1px solid #ddd",
          }}
        />
      </div>

      {/* Lista de Links */}
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {filteredBookmarks.map((b) => (
          <div
            key={b.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "15px",
              border: "1px solid #e4e4e7",
              borderRadius: "8px",
              background: "#fff",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "5px",
                }}
              >
                {/* Feature: Favicon automático usando serviço do Google */}
                <img
                  src={`https://www.google.com/s2/favicons?sz=32&domain=${new URL(b.url).hostname}`}
                  alt="icon"
                  style={{ width: "16px", height: "16px" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "🔖";
                  }}
                />
                <a
                  href={b.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontWeight: "bold",
                    color: "#2563eb",
                    textDecoration: "none",
                  }}
                >
                  {b.title}
                </a>
              </div>
              <small
                style={{ color: "#666", display: "block", marginBottom: "8px" }}
              >
                {b.url}
              </small>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {b.tags.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => setSearch(tag)}
                    style={{
                      background: "#e4e4e7",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontWeight: 500,
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => handleDelete(b.id)}
              style={{
                background: "#ef4444",
                color: "#fff",
                border: "none",
                padding: "6px 12px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Deletar
            </button>
          </div>
        ))}
        {filteredBookmarks.length === 0 && (
          <p style={{ textAlign: "center", color: "#666" }}>
            Nenhum bookmark encontrado.
          </p>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";

interface Bookmark {
  id: number;
  title: string;
  url: string;
  createdAt: string;
  tags: string[];
}

export default function App() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [search, setSearch] = useState("");

  const API_URL = "http://localhost:3000/bookmarks";

  const fetchBookmarks = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setBookmarks(data);
    } catch (err) {
      console.error(`Erro ao buscar bookmark: ${err}`);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!title || !url) return;

    const tagsArray = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url, tags: tagsArray }),
      });

      if (res.ok) {
        setTitle("");
        setUrl("");
        setTagsInput("");
        fetchBookmarks();
      }
    } catch (err) {
      console.error(`Error ao salvar: ${err}`);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (res.ok) fetchBookmarks();
    } catch (err) {
      console.error(`Error ao deletar ${err}`);
    }
  };

  const filteredBookmarks = bookmarks.filter((b) => {
    const matchText =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.url.toLowerCase().includes(search.toLowerCase());
    const matchTag = b.tags.some((t) =>
      t.toLowerCase().includes(search.toLowerCase()),
    );
    return matchText || matchTag;
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

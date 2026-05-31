#  Personal Bookmark Manager

Um gerenciador de favoritos minimalista construído como um Monorepo, utilizando **React (Vite)** no frontend e **Express + Drizzle ORM + SQLite** no backend.

---

## Estrutura do Projeto

- `/api`: Backend em Node.js com TypeScript, Express e banco SQLite local.
- `/web`: Frontend em React com TypeScript e Vite.

---

## Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (Versão 18 ou superior recomendada)
- `npm` (Já vem instalado com o Node)

---

## Como Rodar a Aplicação

Como o projeto é dividido entre API e Web, você precisará de **dois terminais** abertos para rodar o projeto localmente.

### Passo 1: Configurar e Rodar o Backend (`api`)

Abra o seu primeiro terminal e navegue até a pasta da API:

``` bash
cd api

```

#### No Linux

```bash
# 1. Instalar as dependências
npm install

# 2. Criar e sincronizar o banco de dados SQLite local
npx drizzle-kit push

# 3. Iniciar o servidor de desenvolvimento
npx tsx watch src/index.ts

```

#### No Windows

```powershell
# 1. Instalar as dependências
npm install

# 2. Criar e sincronizar o banco de dados SQLite local
npx drizzle-kit push

# 3. Iniciar o servidor de desenvolvimento
npx tsx watch src/index.ts

```

> **Nota:** O servidor do backend estará rodando em `http://localhost:3000`.

---

### Passo 2: Configurar e Rodar o Frontend (`web`)

Abra um **segundo terminal** e navegue até a pasta do frontend:

```bash
cd web

```

#### No Linux ou Windows (Comandos Idênticos)

```bash
# 1. Instalar as dependências do React
npm install

# 2. Iniciar o servidor de desenvolvimento do Vite
npm run dev

```

> **Nota:** O Vite abrirá a aplicação em `http://localhost:5173`. Acesse esse endereço no seu navegador.

---

## 📝 Tecnologias Utilizadas

* **Frontend:** React, TypeScript, Vite.
* **Backend:** Node.js, Express, TypeScript, `tsx`.
* **Banco de Dados & ORM:** SQLite (`better-sqlite3`), Drizzle ORM, Drizzle Kit.

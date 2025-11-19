# EM MANUTENÇÃO!
# 📦 Inventory Management — Aplicação Full Stack de Gestão de Stock

Bem-vindo ao **Inventory Management**, uma solução Full Stack robusta para gestão de inventário pessoal! Esta aplicação permite que qualquer utilizador registe-se, faça login de forma segura e administre o seu stock com uma experiência visual moderna e poderosa.

> 🔒 Organize os seus produtos, edite quantidades, visualize e remova itens com total controlo — diretamente do browser!

---

## 🚀 Resumo

O **Inventory Management** oferece um painel intuitivo para gestão de inventário, combinando tecnologias web de ponta no Front-end e um Back-end escalável e seguro, pronto para produção.

---

## 🛠️ Tech Stack

### Front-end

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://www.javascript.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)  
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge)](https://ui.shadcn.com/)
[![Lucide React](https://img.shields.io/badge/Lucide-React-blue?style=for-the-badge)](https://lucide.dev/)

### Back-end

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)](https://jwt.io/)  

Arquitetura: **Service Layer Pattern**

---

## ✨ Funcionalidades Principais

- 🔐 **Autenticação segura** (Registo & Login com JWT)
- 📊 **Dashboard de Produtos** com UI moderna (componentes shadcn/ui)
- 📝 **CRUD completo**: Criar, Listar, Editar e Remover produtos do inventário
- ⚡ **Feedback visual**: Toasts, loaders e respostas dinâmicas às ações do utilizador

---

## 🖼️ Screenshots


# Tela Login:
> ![Login Screenshot](Stock-Front/screenshots/login.png)  
> ![Cadastro Screenshot](path/to/register.png)  
> ![Dashboard Screenshot](path/to/login.png)  

---

## 🚩 Pré-requisitos

- [Node.js ≥ 18.x](https://nodejs.org/)
- [MySQL ≥ 8.0](https://www.mysql.com/)

---

## 🛠️ Guia de Instalação

### 1. **Clonar o projeto**

```bash
git clone https://github.com/VINICIUS0098876/inventory_management.git
cd inventory_management
```

---

### 2. **Configuração do Back-end**

```bash
cd backend
cp .env.example .env  # Crie seu arquivo de variáveis de ambiente
```

Edite o ficheiro `.env` com suas credenciais:

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/nome_do_banco"
JWT_SECRET="um-segredo-superseguro"
```

**Instale as dependências:**

```bash
npm install
```

**Execute as migrations Prisma:**

```bash
npx prisma migrate dev
```

**Inicie o servidor:**

```bash
npm run dev
```

O Back-end estará disponível (ex: `http://localhost:3333`).

---

### 3. **Configuração do Front-end**

```bash
cd ../frontend
cp .env.example .env  # Configure a URL do Back-end
```

Edite o `.env`:

```env
VITE_API_URL="http://localhost:3333"
```

**Instale as dependências:**

```bash
npm install
```

**Inicie o Front-end:**

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

---

## 🤝 Como Contribuir

1. Faça um fork do projeto
2. Crie um branch para sua feature ou correção:  
   `git checkout -b feature/nome-sua-feature`
3. Commit suas alterações:  
   `git commit -m 'feat: Minha nova feature'`
4. Faça push do branch:  
   `git push origin feature/nome-sua-feature`
5. Abra um Pull Request neste repositório e aguarde a revisão! 🙌

---

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---
Feito com 💙 por VINICIUS0098876

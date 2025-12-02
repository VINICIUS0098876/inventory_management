# 📦 Inventory Management — Dashboard Full Stack de Controle de Estoque

Bem-vindo ao **Inventory Management**, uma solução Full Stack completa para gestão de inventário! Esta aplicação vai além do básico, oferecendo um **Dashboard Analítico** com métricas em tempo real, permitindo que o usuário administre seu estoque com inteligência e uma experiência visual moderna.

> 🔒 Organize seus produtos, acompanhe métricas financeiras, visualize gráficos e gere relatórios — tudo em uma interface segura e responsiva.

---

## 🚀 Evolução e Funcionalidades

O **Inventory Management** oferece um painel intuitivo combinando tecnologias web de ponta.

### ✨ Novas Implementações (v2.0):
- 📈 **Dashboard Visual:** Gráficos interativos (via Recharts) para análise de distribuição de produtos.
- 🔢 **KPIs em Tempo Real:** Cards de resumo que mostram o Valor Total do Estoque e Quantidade de Itens instantaneamente.
- ⚠️ **Alertas Inteligentes:** Indicadores visuais automáticos para produtos com **estoque baixo**.
- 🔍 **Busca Instantânea:** Barra de pesquisa com filtragem em tempo real.
- 📄 **Exportação de Dados:** Funcionalidade para gerar relatórios em **Excel/PDF**.

### ⚙️ Funcionalidades Core:
- 🔐 **Autenticação Robusta:** Login e Cadastro seguros com JWT e bcrypt.
- 📝 **CRUD Completo:** Criação, Leitura, Atualização e Exclusão de produtos.
- ⚡ **UX Aprimorada:** Feedback visual com Toasts, Loaders e validações de formulário com **Zod**.

---

## 🛠️ Tech Stack

### Front-end

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![Recharts](https://img.shields.io/badge/Recharts-22b5bf?style=for-the-badge)](https://recharts.org/)
[![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)](https://zod.dev/)

### Back-end

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)](https://jwt.io/)

Arquitetura: **Service Layer Pattern**

---

## 🖼️ Galeria do Projeto

### 🔐 Autenticação
| Tela de Login | Tela de Cadastro |
|:---:|:---:|
| ![Login Screenshot](Stock-Front/screenshots/login.png) | ![Cadastro Screenshot](Stock-Front/screenshots/cadastro.png) |

### 📊 Dashboard e Analytics
| Visão Geral do Estoque | Gráficos e Métricas |
|:---:|:---:|
| ![Dashboard Screenshot](Stock-Front/screenshots/dashboard.png) | ![Gráfico Screenshot](Stock-Front/screenshots/grafico.png) |

### 👤 Área do Usuário
| Perfil |
|:---:|
| ![Profile Screenshot](Stock-Front/screenshots/profile.png) |

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

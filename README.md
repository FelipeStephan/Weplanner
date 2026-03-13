# 🚀 Loopera-base-template

Uma base premium e altamente estruturada para criação de sites vitrine, hubs de conteúdo e ativos de mídia, otimizada para o fluxo de **Vibe Coding** e desenvolvimento assistido por IA.

---

## 🛠️ Guia de Início Rápido

Este template foi projetado para ser intuitivo e seguro. Siga os passos abaixo para preparar seu ambiente de desenvolvimento:

### 1. Configuração do Cofre Digital (`.env`)
O arquivo `.env` é onde guardamos os **segredos** (chaves de API, senhas) do projeto. Ele nunca é enviado para a internet.

1.  Localize o arquivo `.env.example` na raiz.
2.  Crie uma cópia dele e renomeie a cópia para `.env`.
3.  Abra o novo arquivo `.env` e insira suas chaves reais.

### 2. Capa de Invisibilidade (`.gitignore`)
Já configuramos o arquivo `.gitignore` para você. Ele garante que seus arquivos sensíveis (como o `.env` e pastas de dependências) permaneçam invisíveis para o GitHub, protegendo sua conta e seu bolso.

---

## 🛡️ Práticas de Segurança (Vibe Coding Safety)

Para manter sua "vibe" tranquila e seu projeto seguro, siga estas boas práticas:

- **Nunca cole chaves reais no código**: Use sempre referências como `process.env.SUA_CHAVE`.
- **Revogação Imediata**: Se por erro você enviar uma chave para o GitHub, apague a chave no site do provedor (OpenAI, Stripe, etc.) e crie uma nova imediatamente.
- **Exemplo Didático**: Use o `.env.example` para documentar quais chaves o projeto precisa, mas sem colocar os valores reais nele.

---

## 🤖 Desenvolvimento com IA (Agentic Context)

Este projeto possui um "cérebro" documentado para orientar IAs e agentes (como Cursor, Claude, GPT).

Toda a inteligência de padrões de design, regras de backend e protocolos de agentes está centralizada na pasta:
👉 **[`ai-contex_pattern/`](./ai-contex_pattern/INDEX.md)**

Se você for adicionar novos padrões ou agentes, lembre-se de seguir a **Regra de Auto-Documentação** descrita no índice.

---

## 📂 Estrutura do Projeto

- **[`projects/`](./projects/)**: Aplicações completas, servidores (Vite/Next.js), integrações com Backend e Banco de Dados.
- **[`design-system/`](./design-system/)**: Explorações de UI/UX em HTML Estático, CSS puro e assets visuais.
- **[`ai-contex_pattern/`](./ai-contex_pattern/INDEX.md)**: Contexto rico e regras de ouro para IAs e Agentes.
- `.env.example`: Modelo de configuração segura.
- `README.md`: Este guia para humanos.

---

> [!TIP]
> **Vibe Pro:** Mantenha seus agents configurados no terminal com os servidores MCP listados em `identity/MCP_SETUP.md` para uma experiência de desenvolvimento sem fricção.

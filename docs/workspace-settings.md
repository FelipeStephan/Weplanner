# Workspace Settings — Arquitetura

> Documento de referência para futura integração com backend.
> Criado em: 2026-03-27

## Visão Geral

As configurações do workspace permitem que gestores personalizem identidade, comportamento operacional e políticas de acesso de toda a plataforma.

Rota: `/settings` — visível **apenas para gestores** (`role === 'manager'`).

## Arquivos principais

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/context/WorkspaceSettingsContext.tsx` | Provider, estado global, persistência em localStorage |
| `src/app/components/settings/WorkspaceSettingsPage.tsx` | Página de configurações com todas as seções |

## Estrutura de dados (`WorkspaceSettings`)

```ts
interface WorkspaceSettings {
  workspaceName: string;         // Nome exibido no sidebar e títulos
  logoUrl: string;               // URL da logo (vazio = logo padrão WePlanner)
  accentColor: string;           // Cor de destaque (hex) — substitui #ff5623
  creditsEnabled: boolean;       // Master switch do sistema de créditos
  workDays: WorkDay[];           // Dias de trabalho (para calcular alertas de prazo)
  inviteExpiryDays: number;      // Expiração de convites em dias (3, 7, 14, 30)
  clientLibraryAccess: boolean;  // Clientes podem visualizar biblioteca de assets
}

type WorkDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
```

## Seções da página de configurações

### 1. Identidade do workspace
- **Nome do workspace** — exibido no sidebar e títulos de página
- **Logo (URL)** — URL pública de imagem PNG/SVG/JPEG; preview em tempo real
- **Cor de destaque** — paleta de 8 cores predefinidas + input hex customizado

### 2. Configurações operacionais
- **Sistema de créditos** (toggle) — master switch global; quando desligado, oculta todos os campos de crédito sem apagar os valores
- **Dias de trabalho** — define quais dias são considerados úteis para calcular alertas de prazo (próximo / atrasado)

### 3. Acesso & Equipe
- **Expiração do convite** — quantos dias o link de convite fica válido (3, 7, 14, 30)
- **Acesso de clientes à biblioteca** — clientes podem visualizar a biblioteca de assets sem permissão de edição

### 4. Integrações (em breve)
- Slack, Discord, Google Calendar, Zapier — placeholders visuais para futuras integrações

## Cor de destaque — como funciona

A `accentColor` é aplicada como CSS custom property em tempo real:

```ts
document.documentElement.style.setProperty('--accent-color', color);
```

Toda a UI deve usar `var(--accent-color)` como referência primária em vez de `#ff5623` hardcoded.

**No backend:** a cor deve ser armazenada e devolvida junto com as configurações do workspace na inicialização da sessão.

## Persistência atual (frontend)

- Chave localStorage: `weplanner:workspace-settings:v1`
- Estrutura: JSON completo das `WorkspaceSettings`
- O valor padrão é carregado se a chave não existir

## Paleta de cores predefinidas

| ID | Label | Hex |
|----|-------|-----|
| `brand` | WePlanner | `#ff5623` |
| `indigo` | Índigo | `#4f46e5` |
| `sky` | Azul | `#0284c7` |
| `emerald` | Verde | `#059669` |
| `violet` | Violeta | `#7c3aed` |
| `rose` | Rosa | `#e11d48` |
| `amber` | Âmbar | `#d97706` |
| `slate` | Grafite | `#475569` |

## Esquema de banco sugerido

```sql
CREATE TABLE workspace_settings (
  workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
  workspace_name TEXT NOT NULL DEFAULT 'WePlanner',
  logo_url TEXT,
  accent_color TEXT NOT NULL DEFAULT '#ff5623',
  credits_enabled BOOLEAN NOT NULL DEFAULT true,
  work_days TEXT[] NOT NULL DEFAULT '{mon,tue,wed,thu,fri}',
  invite_expiry_days INTEGER NOT NULL DEFAULT 7,
  client_library_access BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Endpoint de API sugerido

```http
GET  /api/workspace/settings
     → WorkspaceSettings (chamado na inicialização da sessão)

PATCH /api/workspace/settings
Content-Type: application/json
Body: Partial<WorkspaceSettings>
     → WorkspaceSettings (atualizado)

# Política: apenas managers podem PATCH. Outros roles recebem 403.
```

## Dias úteis — como é usado

O campo `workDays` é usado para calcular alertas de prazo nos cards de tarefa:

```ts
function isWorkDay(date: Date, workDays: WorkDay[]): boolean {
  const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return workDays.includes(dayMap[date.getDay()] as WorkDay);
}

function workDaysUntil(target: Date, workDays: WorkDay[]): number {
  let count = 0;
  const cursor = new Date();
  while (cursor < target) {
    cursor.setDate(cursor.getDate() + 1);
    if (isWorkDay(cursor, workDays)) count++;
  }
  return count;
}
```

- **0 dias úteis restantes (ou atrasado)** → alerta `overdue`
- **1–3 dias úteis** → alerta `approaching`
- **> 3 dias úteis** → sem alerta

## Controle de acesso

- A página `/settings` só é acessível a usuários com `role === 'manager'`
- No sidebar, o item "Configurações" só aparece para managers
- No backend, todos os endpoints de PATCH devem validar `role === 'manager'` no middleware de autorização

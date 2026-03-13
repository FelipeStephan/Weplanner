# Meu Ambiente de Test — Contexto do Projeto

## O que é este projeto
Plataforma de **gestão de workflow** para agências de marketing, freelancers e equipes. Desenvolvido originalmente no Figma Maker, sendo replicado e expandido aqui com código.

## Objetivo principal
Construir um **design system** completo e reutilizável baseado no design criado no Figma.

## Stack técnica
- **React** 18 + **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** + **Radix UI**
- **Lucide React** (ícones)
- **Sonner** (toasts)
- **Motion** (animações)

## Papéis de usuário
- **Client** — visualiza projetos, tarefas e saldo de créditos
- **Manager** — acesso total: dashboard, time, relatórios, créditos
- **Collaborator** — tarefas atribuídas, updates, time tracking

## Design System — Referência rápida

### Cor primária (brand)
`#ff5623` — laranja

### Paleta semântica
| Papel | Cor | Hex |
|-------|-----|-----|
| Primary | Laranja | `#ff5623` |
| Success | Verde | `#019364` |
| Info | Roxo | `#987dfe` |
| Secondary | Amarelo | `#feba31` |
| Danger | Vermelho | `#f32c2c` |
| Accent | Rosa | `#ffbee9` |

### Neutros
| Papel | Hex |
|-------|-----|
| Background | `#fafafa` |
| Border | `#e5e5e5` |
| Text primário | `#171717` |
| Text secundário | `#525252` |
| Text terciário | `#737373` |
| Dark | `#101010` |

### Tipografia
- Fonte: **SF Pro** (system fallback)
- Base: `14px`, linha `1.5`
- Pesos: 300, 400, 500, 600, 700

### Espaçamento
Base 8px: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px`

### Border radius
`4px, 6px, 8px, 10px, 12px, 16px, 9999px`

## Princípios de design
- Mobile-first, responsivo
- WCAG 2.1 AA (contraste mínimo 4.5:1)
- Inspiração: Linear, Notion, Vercel, Stripe
- Flexbox e Grid por padrão — evitar position absolute
- Arquivos pequenos — componentes em arquivos separados

## Estrutura da pasta
```
ai-contex_pattern/     # Documentação completa do design system
  DESIGN_SYSTEM.md     # Tokens detalhados (cores, tipografia, sombras)
  COMPONENT_LIBRARY.md # Guia de implementação dos componentes
  QUICK_START.md       # Exemplos de uso
  guidelines/          # Diretrizes gerais
  src/                 # Código fonte de referência
ui/                    # Biblioteca de componentes reutilizáveis
tutoriais-de-ambiente/ # Tutoriais de infraestrutura (Hostinger, etc)
```

## Documentação detalhada
Para detalhes completos consulte `ai-contex_pattern/DESIGN_SYSTEM.md` e `ai-contex_pattern/COMPONENT_LIBRARY.md`.

# Component Guidelines — Loopera UI

Padrões e convenções para construção de componentes neste pacote de UI compartilhado.

---

## 1. Stack

- **React 19** + **Next.js** (App Router)
- **Tailwind CSS v4** (utility-first)
- **Radix UI** — primitivos acessíveis
- **class-variance-authority (CVA)** — variantes tipadas
- **clsx + tailwind-merge** via `cn()` em `lib/utils.ts`
- **Framer Motion** — animações de entrada/saída

---

## 2. Utilitário `cn()`

Sempre usar `cn()` para combinar classes. Nunca concatenar strings diretamente.

```ts
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

```tsx
// Uso correto
className={cn('base-classes', condition && 'conditional-class', className)}

// Evitar
className={'base-classes ' + (condition ? 'extra' : '')}
```

---

## 3. Variantes com CVA

Usar CVA quando um componente tiver mais de uma aparência. Expor sempre `className` como prop para extensão.

```tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:     'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:     'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:   'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost:       'hover:bg-accent hover:text-accent-foreground',
        link:        'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm:      'h-8 rounded-md px-3 text-xs',
        lg:      'h-10 rounded-md px-8',
        icon:    'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)
```

---

## 4. Radix UI + `asChild`

Usar `Slot` do Radix para o padrão `asChild`, permitindo polimorfismo sem perder tipagem:

```tsx
import { Slot } from '@radix-ui/react-slot'

const Comp = asChild ? Slot : 'button'
return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
```

---

## 5. Estrutura de Componente (Logic → Style → Structure)

```tsx
'use client' // Apenas quando necessário

interface ComponentProps {
  className?: string
}

const ComponentName = ({ className, ...props }: ComponentProps) => {
  // 1. Lógica (hooks, handlers)
  const handleClick = () => { ... }

  // 2. Render (estrutura + estilo)
  return (
    <div className={cn('base-classes', className)}>
      {props.children}
    </div>
  )
}

ComponentName.displayName = 'ComponentName'

export { ComponentName }
```

---

## 6. Padrões de Layout

### Container
- `max-w-7xl` — layouts principais
- `max-w-4xl` — conteúdo de texto/artigos

### Glass Card
```tsx
className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl"
```

### Bento Grid
- Sistema de 12 colunas com `col-span` e `row-span` variáveis para hierarquia visual

---

## 7. Design Tokens

Usar variáveis CSS. Nunca hardcodar valores de cor ou espaçamento.

| Token                     | Uso                        |
|---------------------------|----------------------------|
| `hsl(var(--primary))`     | Cor principal da marca     |
| `hsl(var(--secondary))`   | Cor secundária             |
| `hsl(var(--background))`  | Fundo da página            |
| `hsl(var(--foreground))`  | Texto principal            |
| `hsl(var(--muted))`       | Elementos sutis            |
| `hsl(var(--destructive))` | Erros / ações destrutivas  |
| `hsl(var(--accent))`      | Destaques / hover          |

**Escala de espaçamento**: base `4px` — escala: `2, 4, 8, 12, 16, 24, 32, 48, 64`

---

## 8. Tailwind — Regras de Estilo

- **Utility-first**: classes Tailwind exclusivamente. Evitar `@apply` em produção.
- **Mobile-first**: sempre `base` → `sm` → `md` → `lg`.
- **Sem estilos inline** exceto para valores dinâmicos computados.
- **Micro-animações**: `transition-colors`, `transition-transform`, `transition-opacity` para hover/active.

---

## 9. React & Next.js

- **Server Components por padrão**. Adicionar `'use client'` apenas para interatividade.
- **APIs do browser** (`window`, `localStorage`): somente dentro de `useEffect`.
- **Imports dinâmicos** para libs client-only pesadas: `dynamic(() => import('...'), { ssr: false })`.
- **Nunca definir componentes dentro de render functions**.

---

## 10. Acessibilidade

- HTML semântico: `<button>` para ações, `<a>` para navegação.
- `aria-label` em todos os elementos interativos sem texto visível.
- `tabIndex={0}` + `onKeyDown` para elementos não-nativos interativos.
- Estados de foco visíveis (`focus-visible:ring-*`).

---

## 11. Convenções de Código

- **Event handlers**: prefixo `handle` — `handleClick`, `handleKeyDown`.
- **Controle de fluxo**: retornos antecipados e guard clauses.
- **`const`** para componentes e helpers internos.
- **Sem ponto-e-vírgula** (ESLint enforça).
- **Sem `any`** — usar interfaces descritivas.

---

## 12. Assets

Substituir os assets do projeto original pelos assets do Loopera em `src/assets/`:

```ts
// src/assets/index.ts
import Logo from './logo.png'

export const Assets = {
  Logo,
  LogoWhite: Logo, // versão alternativa
}
```

---

## 13. Exportação

Todos os componentes exportados via `src/index.tsx`:

```tsx
export { Button, buttonVariants } from './button'
export type { ButtonProps } from './button'
```

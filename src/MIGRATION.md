# AutoStore — Migração para Tailwind CSS

## 📋 Auditoria & Mudanças

### O que foi migrado

| Antes (CSS-in-JS) | Depois (Tailwind) |
|---|---|
| `const styles = \`...\`` com 400+ linhas de CSS inline | Classes Tailwind direto no JSX |
| `<style>` injetado via `useEffect` | `index.css` com `@tailwind` directives |
| Classes manuais (`.btn`, `.card`, `.badge`) | Componentes React reutilizáveis (`<Btn>`, `<Badge>`, `<Input>`) |
| Grid inline com `style={{display:"grid"}}` | `grid grid-cols-2 gap-3` |
| Flex inline com `style={{display:"flex"}}` | `flex items-center gap-2` |

---

## 🗂 Arquivos Novos/Modificados

```
App.jsx              → Migrado para Tailwind (substitui src/App.jsx)
index.css            → @tailwind base/components/utilities
tailwind.config.js   → Configuração com tema AutoStore
postcss.config.js    → PostCSS com Tailwind + Autoprefixer
package.json         → Dependências atualizadas (frontend only)
main.jsx             → Importa index.css
```

---

## 📦 Instalação

```bash
npm install
npm run dev
```

---

## 🎨 Sistema de Design (Tailwind)

### Cores principais
```
bg-[#0A0F1E]    → Background primário
bg-[#0F172A]    → Background secundário  
bg-[#111827]    → Cards
bg-[#1E293B]    → Cards nível 2
border-[#1E2D45] → Bordas padrão
border-[#2D3F55] → Bordas hover
text-blue-500   → Azul primário
text-green-400  → Accent/preços
```

### Componentes Reutilizáveis

```jsx
// Botão
<Btn variant="primary|secondary|danger|ghost|accent" size="md|sm">
  Texto
</Btn>

// Input
<Input label="Nome" placeholder="..." value={v} onChange={fn} />

// Select
<Select label="Tipo" value={v} onChange={fn}>
  <option>...</option>
</Select>

// Badge
<Badge type="new|used|seller|pending|shipped|delivered|cancelled">
  Texto
</Badge>

// Chip de filtro
<Chip active={bool} onClick={fn}>Texto</Chip>

// Estado vazio
<EmptyState icon="🔧" title="Título" sub="Subtítulo" />
```

### Layout Mobile-First

```jsx
// Grid de 2 colunas
<div className="grid grid-cols-2 gap-3 px-4">

// Scroll horizontal sem scrollbar
<div className="flex overflow-x-auto scrollbar-none gap-3 px-4">

// Card com hover
<div className="bg-[#111827] border border-[#1E2D45] rounded-2xl 
                p-4 hover:border-blue-500 hover:-translate-y-0.5 
                transition-all cursor-pointer">
```

---

## ✅ Checklist de Migração

- [x] Todos os componentes migrados para Tailwind
- [x] CSS-in-JS removido (const styles `...`)
- [x] useEffect de injeção de styles removido
- [x] Componentes reutilizáveis criados (Btn, Input, Badge, Chip...)
- [x] Grid e Flexbox via Tailwind
- [x] Animações customizadas em tailwind.config.js
- [x] Tema de cores do AutoStore configurado
- [x] Scroll sem scrollbar via `scrollbar-none` utility
- [x] Dark theme nativo (sem media query)
- [x] Responsivo com max-w-[480px] (mobile-first)
- [x] Toda lógica Firebase preservada
- [x] Todas as rotas/telas preservadas

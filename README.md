# aiStudio — Bun.js PWA Showcase

> **Aplicativo conceitual de referência demonstrando como arquitetar, empacotar e executar Progressive Web Apps com Bun.js, Preact, Signals e BeerCSS no ambiente Google AI Studio.**

Desenvolvido por **Vanaware**.

---

## 💡 Visão Geral e Conceito

O **aiStudio** é um projeto modelo concebido para comprovar que é possível desenvolver aplicações web modernas, reativas e com suporte offline completo (PWA) utilizando o ecossistema nativo do **Bun.js**, com inicialização ultrarrápida, bundler nativo de alta performance e sem frameworks invasivos de CSS.

### Pilares da Arquitetura

1. **Bun.js Nativo**:
   - Execução e gerenciamento de dependências através do runtime ultra-veloz do Bun.
   - Integração com o container do AI Studio através de uma ponte padronizada (`package.json` + `install-script.sh`), mapeando os comandos `npm run dev`, `npm run build`, `npm run lint` e `npm run test` diretamente para os executáveis do Bun.

2. **Reatividade Fina com Preact + Signals**:
   - Compilador configurado com `"jsx": "react-jsx"` e `"jsxImportSource": "preact"` no `tsconfig.json`.
   - Gerenciamento de estado 100% reativo utilizando exclusivamente `@preact/signals` (`signal`, `computed`) em `src/store.ts`, sem hooks (`useState`, `useEffect`).
   - Persistência durável automática com `idb-keyval` sincronizando as tarefas no IndexedDB do navegador.
   - Renderizações pontuais em nível de nó do DOM, sem re-renderizar árvores inteiras de componentes.

3. **Interface com BeerCSS (Material Design 3)**:
   - Interface construída com **BeerCSS 5.0.3** via CDN, utilizando HTML semântico (`<article>`, `<nav>`, `<button>`) e classes utilitárias do Material You.
   - Zero CSS customizado e sem overhead de pré-processadores ou utilitários pesados como Tailwind.
   - Ícones dinâmicos via Google Material Symbols Outlined e alternância nativa de temas (claro, escuro e automático).

4. **Orquestração de Build Nativo com Bun (`Bun.build`)**:
   - Bundling de alta velocidade diretamente pela API nativa `Bun.build` (`scripts/build.ts`), gerando a aplicação (`main.js`) e o Service Worker (`sw.js`) em poucos milissegundos.
   - Versionamento semântico automático sincronizado em tempo de compilação nos arquivos de distribuição, no `manifest.json`, no `version.ts` e no Service Worker.

5. **PWA Offline-First**:
   - Registro de Service Worker (`sw.ts`) com estratégia de cache para ativos estáticos e páginas HTML.
   - Nome de cache dinâmico atrelado à versão (`aistudio-pwa-${APP_VERSION}`).
   - Caminhos relativos (`./`) em todos os assets para compatibilidade nativa com GitHub Pages e subpastas.

---

## 📁 Estrutura do Repositório

```text
├── AGENTS.md                   # Diretrizes arquiteturais e regras para agentes de IA
├── install-script.sh           # Script de provisionamento e verificação do Bun no AI Studio
├── metadata.json               # Metadados e permissões da aplicação no AI Studio
├── package.json                # Dependências do projeto e scripts padronizados
├── tsconfig.json               # Configurações de compilação TypeScript para Bun + Preact
│
├── packages/
│   ├── server/                 # Servidor HTTP estático em Bun.js
│   │   ├── src/main.ts         # Ponto de entrada do servidor Bun.serve (porta 3000, 0.0.0.0)
│   │   └── build/dist/         # Artefatos compilados servidos pelo servidor
│   │
│   └── ui/                     # Aplicação Frontend Preact + Signals
│       ├── public/             # Arquivos públicos (index.html, manifest.json, icon.svg)
│       ├── src/
│       │   ├── components/     # Componentes modulares Preact (App, Header, TaskCard, Footnote)
│       │   ├── store.ts        # Sinais reativos globais e ações da aplicação
│       │   ├── version.ts      # Versão da aplicação injetada no build
│       │   ├── sw.ts           # Service Worker da PWA com ciclo de vida e cache
│       │   └── main.tsx        # Bootstrap e montagem da aplicação Preact
│       └── tests/
│           └── app_test.ts     # Suíte de testes unitários BDD (bun:test)
│
└── scripts/
    ├── build.ts                # Orquestrador de build baseado em Bun.build
    └── lint.ts                 # Validador de tipagem TypeScript via tsc --noEmit
```

---

## 🚀 Executando o Projeto

### Pré-requisitos
- [Bun](https://bun.sh/) (v1.x instalado).

### Comandos Principais

| Tarefa | Comando | Descrição |
|---|---|---|
| **Build** | `bun run build` / `npm run build` | Compila o frontend e o Service Worker com Bun.build para `packages/server/build/dist` |
| **Dev Server** | `bun run dev` / `npm run dev` | Compila os assets e inicia o servidor HTTP em `http://0.0.0.0:3000` |
| **Lint / Type Check**| `bun run lint` / `npm run lint` | Valida tipagem TypeScript em todo o projeto |
| **Testes** | `bun test` / `npm test` | Executa a suíte de testes BDD ultra-rápida do Bun |

---

## 🧪 Padrão de Testes

Os testes utilizam a biblioteca nativa do Bun:
- `bun:test` (`describe`, `it`, `expect`)

Para rodar os testes:
```bash
bun test
```

---

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais detalhes.

Copyright (c) 2026 **Vanaware**.

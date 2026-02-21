

# Atualizacao completa: app-original.jsx -> app.jsx

Comparacao linha a linha entre os dois arquivos. Total de **30 alteracoes** organizadas por area.

---

## A. Dados e Tipos (`src/lib/types.ts`, `src/lib/data.ts`)

### A1. Tipo Project - novos campos
- Adicionar `type?: "normal" | "multiprojeto"` ao `Project`
- Adicionar `children?: ChildProject[]` ao `Project`
- Criar interface `ChildProject { id: string; name: string; objectives: Objective[] }`

### A2. Tipo Summit - campo date
- Summit ja tem `date?: string | null` (OK, ja existe)

### A3. Novas interfaces
- `GroupLabels { summits: string; esquentas: string }`
- `GroupParents { summits: GroupParentItem; esquentas: GroupParentItem }`
- `GroupParentItem { id: string; name: string; objectives: Objective[] }`

### A4. Novos defaults
- `DEFAULT_GROUP_LABELS = { summits: "Summits Internacionais", esquentas: "Esquenta 26" }`
- `DEFAULT_GROUP_PARENTS = { summits: { id:"gp-summits", name:"Projeto-mae Summits", objectives:[] }, esquentas: { id:"gp-esquentas", name:"Projeto-mae Esquenta", objectives:[] } }`

### A5. Funcoes auxiliares novas/alteradas
- Criar `getProjectObjectives(proj)` - retorna objetivos do projeto + filhos
- Criar `getProjectKRCount(proj)` - retorna total de KRs incluindo filhos
- Alterar `calcProj` para usar `getProjectObjectives` em vez de `proj.objectives`
- Criar `normalizeProject(p)` - garante campos `type` e `children` existam

### A6. Dados default dos projetos
- Cada projeto passa a ter `type: "normal"` e `children: []`

---

## B. Persistencia (`src/lib/storage.ts`)

### B1. Novas chaves
- `ab2-groups-v1` para `GroupLabels`
- `ab2-group-parents-v1` para `GroupParents`

### B2. Novas funcoes
- `loadGroupLabels()` / `saveGroupLabels()`
- `loadGroupParents()` / `saveGroupParents()`

### B3. loadProjects atualizado
- Aplicar `normalizeProject` ao carregar projetos do localStorage

---

## C. Componentes

### C1. KRRow - mudancas significativas
**Props renomeadas e novas:**
- `onEdit` -> `onUpdate` (renomeado)
- Nova prop: `onConfig` (funcao)
- Nova prop: `canConfigKR` (boolean)

**Visual alterado:**
- Botao "editar" (texto) removido
- Novo botao de atualizacao (icone ↻) ao lado do titulo do KR (visivel quando `canEdit`)
- Novo botao de engrenagem (⚙) para configuracao do KR (visivel quando `canConfigKR`)
- Botao de editar link: muda de ✏️ para ⚙ com tooltip

### C2. ObjectiveBlock - mudancas
**Props renomeadas e novas:**
- `onEditKR` -> `onUpdateKR`
- Nova prop: `onConfigKR`
- Nova prop: `canConfigKR`

**Visual alterado:**
- Icone de edicao do titulo do objetivo: muda de ✏️ para ⚙ (engrenagem)
- Tooltip e aria-label adicionados

### C3. ProjectCard - mudancas
**Props removidas:**
- `onOpenSettings` removido (engrenagem sai do card, vai para o header do detalhe)

**Novas features:**
- Badge "Multiprojeto" (span cyan) quando `proj.type === "multiprojeto"`
- Usa `getProjectObjectives(proj).length` e `getProjectKRCount(proj)` para contagens

### C4. GroupCard - mudancas
**Novas props:**
- `canEdit` (boolean) - mostra badge "Voce edita"
- `canConfig` (boolean) - mostra botao ⚙
- `onConfig` (funcao) - callback da engrenagem
- `configTitle` (string) - tooltip da engrenagem

---

## D. Dashboard - Novos estados

### D1. Estados novos
- `editingKRConfig` / `krConfigVals` (titulo, meta, unidade)
- `groupLabels` / `groupParents`
- `settingsGroup` (null | "summits" | "esquentas")
- `groupLabelInput`
- `settingsGroupItem` ({type, id} | null)
- `groupItemName` / `groupItemDate`
- `addingChildProject` / `newChildProjectName`
- `newProjType` (tipo do projeto na criacao)
- `newSummitDate` (campo de data no modal de summit)

---

## E. Dashboard - Funcoes novas

### E1. saveKRConfig
- Admin pode editar titulo, meta e unidade de qualquer KR

### E2. deleteKR
- Admin pode deletar um KR (com confirmacao via `window.confirm`)

### E3. deleteObjective
- Admin pode deletar um objetivo inteiro (com confirmacao)

### E4. saveNewChildProject
- Cria subprojeto dentro de um multiprojeto

### E5. openGroupSettings / saveGroupSettings / deleteGroupItems
- Renomear grupo (Summits / Esquenta)
- Deletar todos os itens de um grupo

### E6. openGroupItemSettings / saveGroupItemSettings / deleteGroupItem
- Editar nome e data de um summit/esquenta individual
- Deletar um summit/esquenta individual

---

## F. Dashboard - Funcoes alteradas

### F1. persist()
- Agora aceita 2 parametros extras: `g` (groupLabels) e `gp` (groupParents)

### F2. applyKRs()
- Agora inclui `children` dos projetos
- Agora inclui `groupParents` (summits e esquentas)
- Retorna `updGP` alem de `updP`, `updS`, `updE`

### F3. saveKR / saveLink
- Passam a atualizar e persistir `groupParents`

### F4. saveObjective
- Agora atualiza `children` e `groupParents`

### F5. saveNewObjective
- Antes: so funcionava para projetos
- Agora: funciona para projetos, summits, esquentas e groupParents

### F6. saveNewKR
- Antes: so funcionava para projetos
- Agora: funciona para projetos, summits, esquentas, groupParents e children

### F7. saveSummit
- Agora inclui campo `date` (opcional)

### F8. saveNewProject
- Agora requer selecao de `type` ("normal" ou "multiprojeto")
- Inclui `children: []` no novo projeto
- Validacao: nao cria se `newProjType` estiver vazio

### F9. Calculo global (allPcts, totalKRs)
- `allPcts`: agora inclui objetivos dos `groupParents` no calculo
- `totalKRs`: agora inclui KRs dos `groupParents` e `children`

---

## G. Dashboard - UI/Render

### G1. Header
- Titulo usa `groupLabels.summits` e `groupLabels.esquentas` em vez de texto fixo
- Botao ⚙ no header quando admin esta vendo um summit individual
- Botao ⚙ no header quando admin esta vendo uma esquenta individual
- Botao ⚙ no header quando admin esta na view de summits (grupo)
- Botao ⚙ no header quando admin esta na view de esquentas (grupo)

### G2. Home - ProjectCard
- Remove `onOpenSettings` do card (engrenagem removida do card)

### G3. Home - GroupCard
- Passa `canEdit={user.isAdmin}` para GroupCard
- Usa `groupLabels.summits` / `groupLabels.esquentas` como nome

### G4. Detalhe do Projeto
- Engrenagem ⚙ adicionada no header (ao lado da barra de progresso)
- Usa `getProjectObjectives(proj).length` e `getProjectKRCount(proj)`
- Texto "Multiprojeto . soma mae + subprojetos" quando `type === "multiprojeto"`
- Secao "SUBPROJETOS" com blocos de ObjectiveBlock para cada child
- Botao "+ Novo Subprojeto" (admin)
- Passa `canConfigKR={user.isAdmin}` para ObjectiveBlock

### G5. renderGroupView - mudancas
- Novo parametro `type` ("summit" | "esquenta")
- Secao "OBJETIVOS DO MULTIPROJETO (PROJETO-MAE)" com objetivos do groupParent
- Calculo de progresso geral inclui groupParents
- Botao "+ Novo Objetivo" dentro da secao projeto-mae

### G6. Detalhe de Summit/Esquenta
- Botao "+ Novo Objetivo" (admin) adicionado abaixo dos objetivos
- Passa `canConfigKR={user.isAdmin}` para ObjectiveBlock
- Passa `onAddKR` para permitir adicionar KRs

### G7. Summits showDate
- Muda de `false` para `true` na chamada de `renderGroupView`

---

## H. Modais novos e alterados

### H1. Modal "Atualizar Key Result" (renomeado de "Editar Key Result")
- Titulo muda de "Editar Key Result" para "Atualizar Key Result"

### H2. Novo modal: "Configuracao KR"
- Campos: titulo, meta, unidade
- Botao "Deletar KR" (zona de perigo, admin)

### H3. Modal "Editar Objetivo" - alterado
- Novo botao "Deletar Objetivo" (zona de perigo, admin)

### H4. Novo modal: "Configuracao Summits/Esquenta"
- Campo: nome do card
- Botao "Deletar todos os itens"

### H5. Novo modal: "Configuracao Summit/Esquenta" (item individual)
- Campos: nome, data
- Botao "Deletar Summit" / "Deletar Esquenta"

### H6. Modal "Novo Projeto" - alterado
- Novo campo: selecao de tipo (grid 2 colunas: "Projeto normal" / "Multiprojeto")
- Label do objetivo muda conforme tipo: "Objetivo do projeto-mae" vs "Primeiro objetivo"

### H7. Modal "Novo Summit" - alterado
- Novo campo: "Data (opcional)" (input type date)

### H8. Novo modal: "Novo Subprojeto"
- Campo: nome do subprojeto
- Cria child com um objetivo padrao

---

## I. Login

### I1. Email padrao
- Muda de vazio ("") para pre-preenchido ("admin@ab2.com.br")

---

## Resumo da implementacao

Total: 30 alteracoes cobrindo:
- 6 alteracoes em tipos/dados
- 3 alteracoes em persistencia
- 4 componentes alterados
- 9 estados novos no Dashboard
- 6 funcoes novas no Dashboard
- 9 funcoes alteradas no Dashboard
- 7 alteracoes de UI/render
- 8 modais novos/alterados
- 1 alteracao no login

Todas serao implementadas mantendo a arquitetura React/TypeScript/Tailwind existente do projeto.


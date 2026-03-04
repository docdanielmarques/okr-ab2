

# Ajustes nos Esquentas

Alterações no arquivo `src/lib/data.ts`, array `DEFAULT_ESQUENTAS`:

1. **Renomear** `e1` de `"São Paulo, SP"` para `"Consolação, SP"` (data 2026-03-11 mantida)
2. **Adicionar** `e9`: `"Itaim, SP"` com data `"2026-03-26"`
3. **Alterar** `e2` (Salvador, BA) para data diferente de 26/03 — manter como está, pois Salvador já ocupa 26/03. Na verdade, o Itaim substitui ou coexiste? Vou inserir como novo item e manter Salvador.
4. **Adicionar** `e10`: `"Recife, PE"` com data `"2026-04-28"`

Resumo das edições em `src/lib/data.ts` linhas 151-159:
- Linha 152: `name: "São Paulo, SP"` → `name: "Consolação, SP"`
- Inserir após linha 153: novo item `e9` (Itaim, SP, 2026-03-26)
- Inserir após linha 159: novo item `e10` (Recife, PE, 2026-04-28)

**Nota importante**: Como os dados são persistidos em localStorage, usuários que já acessaram o app verão os dados antigos. Apenas novas sessões (ou limpeza do localStorage) carregarão os defaults atualizados.


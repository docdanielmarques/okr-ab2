import type { User, Project, Summit, Esquenta, KeyResult, Objective, KRTemplate, Status, GroupLabels, GroupParents } from "./types";

export const USERS: User[] = [
  { email: "ana@ab2l.com.br", name: "Ana Lima", isAdmin: false },
  { email: "bruno@ab2l.com.br", name: "Bruno Melo", isAdmin: false },
  { email: "carla@ab2l.com.br", name: "Carla Nunes", isAdmin: false },
  { email: "diego@ab2l.com.br", name: "Diego Ramos", isAdmin: false },
  { email: "admin@ab2l.com.br", name: "Admin", isAdmin: true },
];

export const NON_ADMIN_USERS = USERS.filter((u) => !u.isAdmin);

export const PALETTE = [
  "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444",
  "#F97316", "#06B6D4", "#EC4899", "#84CC16", "#6366F1",
];

export const SUMMIT_COLOR = "#06B6D4";
export const ESQUENTA_COLOR = "#EF4444";

// ─── Helpers ─────────────────────────────────────────────────────

export const getToolName = (url = "") => {
  if (url.includes("docs.google.com/spreadsheets")) return "Google Sheets";
  if (url.includes("trello.com")) return "Trello";
  if (url.includes("notion.so")) return "Notion";
  if (url.includes("drive.google.com")) return "Google Drive";
  return "Link externo";
};

export const getToolIcon = (url = "") => {
  if (url.includes("docs.google.com/spreadsheets")) return "📊";
  if (url.includes("trello.com")) return "📋";
  if (url.includes("notion.so")) return "📝";
  if (url.includes("drive.google.com")) return "📁";
  return "🔗";
};

export const fmtDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return iso;
  }
};

export const fmtShort = (iso: string) => {
  try {
    return new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  } catch {
    return iso;
  }
};

export const todayStr = () => new Date().toISOString().split("T")[0];

export const getStatus = (p: number): Status => {
  if (p >= 70) return { label: "On Track", color: "#10B981", bg: "#064E3B" };
  if (p >= 40) return { label: "At Risk", color: "#F59E0B", bg: "#451A03" };
  return { label: "Off Track", color: "#EF4444", bg: "#450A0A" };
};

export const pct = (c: number, t: number) => (t === 0 ? 0 : Math.min(100, Math.round((c / t) * 100)));
export const avgPct = (arr: number[]) => (arr.length === 0 ? 0 : Math.round(arr.reduce((a, v) => a + v, 0) / arr.length));
export const calcObj = (obj: Objective) => avgPct(obj.krs.map((kr) => pct(kr.current, kr.target)));

export const getProjectObjectives = (proj: Project): Objective[] => [
  ...(proj.objectives || []),
  ...((proj.children || []).flatMap((c) => c.objectives || [])),
];

export const getProjectKRCount = (proj: Project): number =>
  getProjectObjectives(proj).reduce((a, o) => a + (o.krs || []).length, 0);

export const calcProj = (proj: { objectives: Objective[]; children?: { objectives: Objective[] }[] }) =>
  avgPct([
    ...(proj.objectives || []),
    ...((proj as any).children || []).flatMap((c: any) => c.objectives || []),
  ].map(calcObj));

export const normalizeProject = (p: any): Project => ({
  ...p,
  type: p.type || "normal",
  children: (p.children || []).map((c: any) => ({ ...c, objectives: c.objectives || [] })),
  objectives: p.objectives || [],
});

export const calcGroupAgg = (items: { objectives: Objective[] }[], templates: KRTemplate[]) =>
  templates.map((t) => {
    const m = items.flatMap((s) => s.objectives.flatMap((o) => o.krs)).filter((k) => k.title === t.title);
    return {
      title: t.title,
      unit: t.unit,
      current: m.reduce((a, k) => a + k.current, 0),
      target: m.reduce((a, k) => a + k.target, 0),
    };
  });

export const calcGroupPct = (items: { objectives: Objective[] }[], templates: KRTemplate[]) =>
  avgPct(calcGroupAgg(items, templates).map((kr) => pct(kr.current, kr.target)));

// ─── Defaults ────────────────────────────────────────────────────

export const DEFAULT_GROUP_LABELS: GroupLabels = {
  summits: "Summits Internacionais",
  esquentas: "Esquenta 26",
};

export const DEFAULT_GROUP_PARENTS: GroupParents = {
  summits: { id: "gp-summits", name: "Projeto-mãe Summits", objectives: [] },
  esquentas: { id: "gp-esquentas", name: "Projeto-mãe Esquenta", objectives: [] },
};

// ─── Templates ───────────────────────────────────────────────────

export const SUMMIT_OBJ_TITLE = "Consolidar presença internacional da AB2L";
export const SUMMIT_KR_TEMPLATES: KRTemplate[] = [
  { title: "Levar executivos brasileiros", unit: "executivos", target: 30 },
  { title: "Firmar parcerias internacionais", unit: "parcerias", target: 5 },
  { title: "Confirmar speakers internacionais", unit: "speakers", target: 10 },
];

export const ESQUENTA_OBJ_TITLE = "Gerar engajamento pré-evento LEX 26";
export const ESQUENTA_KR_TEMPLATES: KRTemplate[] = [
  { title: "Participantes no evento", unit: "participantes", target: 100 },
  { title: "Leads gerados para LEX 26", unit: "leads", target: 50 },
];

const makeSummitKRs = (currents: number[], base: number): KeyResult[] =>
  SUMMIT_KR_TEMPLATES.map((t, i) => ({
    id: base + i, title: t.title, current: currents[i] || 0, target: t.target, unit: t.unit, logs: [], linkLogs: [],
  }));

const makeEsquentaKRs = (currents: number[], base: number): KeyResult[] =>
  ESQUENTA_KR_TEMPLATES.map((t, i) => ({
    id: base + i, title: t.title, current: currents[i] || 0, target: t.target, unit: t.unit, logs: [], linkLogs: [],
  }));

export const makeSummitKRsPublic = makeSummitKRs;
export const makeEsquentaKRsPublic = makeEsquentaKRs;

// ─── Default Data ────────────────────────────────────────────────

export const DEFAULT_SUMMITS: Summit[] = [
  { id: "s1", name: "New York Summit", objectives: [{ id: "so1", title: SUMMIT_OBJ_TITLE, krs: makeSummitKRs([12, 1, 4], 1700) }] },
  { id: "s2", name: "Lisboa Summit", objectives: [{ id: "so2", title: SUMMIT_OBJ_TITLE, krs: makeSummitKRs([5, 0, 2], 1710) }] },
  { id: "s3", name: "London Summit", objectives: [{ id: "so3", title: SUMMIT_OBJ_TITLE, krs: makeSummitKRs([8, 1, 3], 1720) }] },
  { id: "s4", name: "Singapura Summit", objectives: [{ id: "so4", title: SUMMIT_OBJ_TITLE, krs: makeSummitKRs([3, 0, 1], 1730) }] },
];

export const DEFAULT_ESQUENTAS: Esquenta[] = [
  { id: "e1", name: "São Paulo, SP", date: "2026-03-11", objectives: [{ id: "eo1", title: ESQUENTA_OBJ_TITLE, krs: makeEsquentaKRs([0, 0], 2100) }] },
  { id: "e2", name: "Salvador, BA", date: "2026-03-26", objectives: [{ id: "eo2", title: ESQUENTA_OBJ_TITLE, krs: makeEsquentaKRs([0, 0], 2110) }] },
  { id: "e3", name: "Joinville, SC", date: "2026-04-08", objectives: [{ id: "eo3", title: ESQUENTA_OBJ_TITLE, krs: makeEsquentaKRs([0, 0], 2120) }] },
  { id: "e4", name: "Florianópolis, SC", date: "2026-04-09", objectives: [{ id: "eo4", title: ESQUENTA_OBJ_TITLE, krs: makeEsquentaKRs([0, 0], 2130) }] },
  { id: "e5", name: "Pinheiros, SP", date: "2026-04-10", objectives: [{ id: "eo5", title: ESQUENTA_OBJ_TITLE, krs: makeEsquentaKRs([0, 0], 2140) }] },
  { id: "e6", name: "Santos, SP", date: "2026-04-14", objectives: [{ id: "eo6", title: ESQUENTA_OBJ_TITLE, krs: makeEsquentaKRs([0, 0], 2150) }] },
  { id: "e7", name: "Belo Horizonte, MG", date: "2026-04-14", objectives: [{ id: "eo7", title: ESQUENTA_OBJ_TITLE, krs: makeEsquentaKRs([0, 0], 2160) }] },
  { id: "e8", name: "Rio de Janeiro, RJ", date: "2026-04-16", objectives: [{ id: "eo8", title: ESQUENTA_OBJ_TITLE, krs: makeEsquentaKRs([0, 0], 2170) }] },
];

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 1, type: "normal", name: "AB2L LEX 26", color: "#3B82F6", members: ["Ana Lima"], children: [],
    objectives: [
      { id: 1, title: "Consolidar o maior evento de legaltech do Brasil", krs: [
        { id: 1, title: "Confirmar 50 expositores", current: 18, target: 50, unit: "expositores", logs: [], linkLogs: [] },
        { id: 2, title: "Alcançar 3.000 inscritos", current: 850, target: 3000, unit: "inscritos", logs: [], linkLogs: [] },
        { id: 3, title: "Fechar 20 patrocinadores", current: 7, target: 20, unit: "patrocinadores", logs: [], linkLogs: [] },
      ]},
      { id: 2, title: "Garantir excelência na experiência", krs: [
        { id: 4, title: "NPS acima de 80", current: 0, target: 80, unit: "NPS", logs: [], linkLogs: [] },
        { id: 5, title: "Confirmar 30 palestrantes", current: 12, target: 30, unit: "palestrantes", logs: [], linkLogs: [] },
      ]},
    ],
  },
  {
    id: 2, type: "normal", name: "Captação de Mantenedores", color: "#10B981", members: ["Bruno Melo"], children: [],
    objectives: [
      { id: 3, title: "Expandir base de escritórios mantenedores", krs: [
        { id: 6, title: "Assinar 15 novos contratos R$100k+", current: 4, target: 15, unit: "contratos",
          logs: [
            { date: "2026-02-18", user: "Bruno Melo", from: 3, to: 4, note: "Fechamos Machado Meyer e Mattos Filho" },
            { date: "2026-02-13", user: "Bruno Melo", from: 2, to: 3, note: "" },
            { date: "2026-02-05", user: "Bruno Melo", from: 1, to: 2, note: "Primeiro contrato — Pinheiro Neto" },
          ],
          link: "https://docs.google.com/spreadsheets/example",
          linkLogs: [{ date: "2026-02-10", user: "Admin", oldLink: null, newLink: "https://docs.google.com/spreadsheets/example" }],
        },
        { id: 7, title: "Realizar 60 reuniões de prospecção", current: 22, target: 60, unit: "reuniões", logs: [],
          link: "https://trello.com/example",
          linkLogs: [{ date: "2026-02-12", user: "Bruno Melo", oldLink: null, newLink: "https://trello.com/example" }],
        },
        { id: 8, title: "Converter 30% dos leads qualificados", current: 18, target: 30, unit: "%", logs: [], linkLogs: [] },
      ]},
    ],
  },
  {
    id: 3, type: "normal", name: "Hub / Coworking", color: "#8B5CF6", members: ["Carla Nunes"], children: [],
    objectives: [
      { id: 4, title: "Atingir ocupação plena do hub", krs: [
        { id: 9, title: "Ocupar 80% das estações de trabalho", current: 45, target: 80, unit: "%", logs: [], linkLogs: [] },
        { id: 10, title: "Fechar 10 contratos mensais", current: 3, target: 10, unit: "contratos", logs: [], linkLogs: [] },
      ]},
    ],
  },
  {
    id: 4, type: "normal", name: "Certificações", color: "#F59E0B", members: ["Carla Nunes"], children: [],
    objectives: [
      { id: 5, title: "Lançar e escalar programa de certificações", krs: [
        { id: 11, title: "Certificar 200 profissionais", current: 60, target: 200, unit: "profissionais", logs: [], linkLogs: [] },
        { id: 12, title: "Lançar 3 trilhas de certificação", current: 1, target: 3, unit: "trilhas", logs: [], linkLogs: [] },
        { id: 13, title: "NPS do curso acima de 75", current: 0, target: 75, unit: "NPS", logs: [], linkLogs: [] },
      ]},
    ],
  },
  {
    id: 7, type: "normal", name: "Imersão China", color: "#F97316", members: ["Diego Ramos"], children: [],
    objectives: [
      { id: 8, title: "Estruturar missão de inovação à China", krs: [
        { id: 20, title: "Confirmar 20 participantes", current: 6, target: 20, unit: "participantes", logs: [], linkLogs: [] },
        { id: 21, title: "Agendar visitas em 8 empresas de tech", current: 2, target: 8, unit: "visitas", logs: [], linkLogs: [] },
        { id: 22, title: "Fechar parceria com 2 instituições chinesas", current: 0, target: 2, unit: "parcerias", logs: [], linkLogs: [] },
      ]},
    ],
  },
];

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import type { Project, Summit, Esquenta, Announcement, Objective, KeyResult, KRTemplate, GroupLabels, GroupParents } from "@/lib/types";
import {
  calcProj, calcGroupPct, calcGroupAgg, calcObj, avgPct, pct, getStatus, fmtDate, fmtShort, todayStr,
  getToolName, getToolIcon, PALETTE, getProjectObjectives, getProjectKRCount,
  SUMMIT_COLOR, ESQUENTA_COLOR,
  SUMMIT_OBJ_TITLE, SUMMIT_KR_TEMPLATES, ESQUENTA_OBJ_TITLE, ESQUENTA_KR_TEMPLATES,
  makeSummitKRsPublic, makeEsquentaKRsPublic, DEFAULT_GROUP_LABELS, DEFAULT_GROUP_PARENTS, normalizeProject,
} from "@/lib/data";
import {
  loadProjects, loadSummits, loadEsquentas, loadAnnouncements, loadGroupLabels, loadGroupParents,
  saveProjects, saveSummits, saveEsquentas, saveAnnouncements, saveGroupLabels, saveGroupParents,
} from "@/lib/storage";
import { ProgressBar } from "@/components/okr/ProgressBar";
import { ProjectCard } from "@/components/okr/ProjectCard";
import { GroupCard } from "@/components/okr/GroupCard";
import { ObjectiveBlock } from "@/components/okr/ObjectiveBlock";
import { Modal, Field, BtnRow, INPUT_STYLE } from "@/components/okr/Modal";
import { ProjectSettingsModal } from "@/components/okr/ProjectSettingsModal";

export default function Dashboard() {
  const { user, logout } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [summits, setSummits] = useState<Summit[]>([]);
  const [esquentas, setEsquentas] = useState<Esquenta[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [groupLabels, setGroupLabels] = useState<GroupLabels>(DEFAULT_GROUP_LABELS);
  const [groupParents, setGroupParents] = useState<GroupParents>(DEFAULT_GROUP_PARENTS);
  const [view, setView] = useState("home");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // modals
  const [editingKR, setEditingKR] = useState<number | null>(null);
  const [krVals, setKrVals] = useState<{ current: number | string; target: number | string; note: string }>({ current: 0, target: 0, note: "" });
  const [editingKRConfig, setEditingKRConfig] = useState<number | null>(null);
  const [krConfigVals, setKrConfigVals] = useState<{ title: string; target: number | string; unit: string }>({ title: "", target: "", unit: "" });
  const [editingLink, setEditingLink] = useState<number | null>(null);
  const [newLink, setNewLink] = useState("");
  const [editingObj, setEditingObj] = useState<number | string | null>(null);
  const [objTitle, setObjTitle] = useState("");
  const [showAnnounce, setShowAnnounce] = useState(false);
  const [announceText, setAnnounceText] = useState("");
  const [addingSummit, setAddingSummit] = useState(false);
  const [newSummitName, setNewSummitName] = useState("");
  const [newSummitDate, setNewSummitDate] = useState("");
  const [addingEsquenta, setAddingEsquenta] = useState(false);
  const [newEsquentaName, setNewEsquentaName] = useState("");
  const [newEsquentaDate, setNewEsquentaDate] = useState("");
  const [addingProject, setAddingProject] = useState(false);
  const [newProjName, setNewProjName] = useState("");
  const [newProjType, setNewProjType] = useState("");
  const [newProjColor, setNewProjColor] = useState("#3B82F6");
  const [newProjObjTitle, setNewProjObjTitle] = useState("");
  const [settingsProj, setSettingsProj] = useState<Project | null>(null);
  const [addingObj, setAddingObj] = useState(false);
  const [newObjTitle, setNewObjTitle] = useState("");
  const [addingKRToObj, setAddingKRToObj] = useState<number | string | null>(null);
  const [newKRVals, setNewKRVals] = useState({ title: "", target: "", unit: "" });
  const [settingsGroup, setSettingsGroup] = useState<string | null>(null);
  const [groupLabelInput, setGroupLabelInput] = useState("");
  const [settingsGroupItem, setSettingsGroupItem] = useState<{ type: string; id: string } | null>(null);
  const [groupItemName, setGroupItemName] = useState("");
  const [groupItemDate, setGroupItemDate] = useState("");
  const [addingChildProject, setAddingChildProject] = useState(false);
  const [newChildProjectName, setNewChildProjectName] = useState("");

  useEffect(() => {
    setProjects(loadProjects());
    setSummits(loadSummits());
    setEsquentas(loadEsquentas());
    setAnnouncements(loadAnnouncements());
    setGroupLabels(loadGroupLabels());
    setGroupParents(loadGroupParents());
  }, []);

  const persist = (p: Project[] | null, s: Summit[] | null, a: Announcement[] | null, e: Esquenta[] | null, g: GroupLabels | null = null, gp: GroupParents | null = null) => {
    setSaving(true);
    if (p !== null) saveProjects(p);
    if (s !== null) saveSummits(s);
    if (a !== null) saveAnnouncements(a);
    if (e !== null) saveEsquentas(e);
    if (g !== null) saveGroupLabels(g);
    if (gp !== null) saveGroupParents(gp);
    setLastSaved(new Date().toLocaleDateString("pt-BR"));
    setSaving(false);
  };

  if (!user) return null;

  const canEdit = (id: number) => {
    if (user.isAdmin) return true;
    const p = projects.find((p) => p.id === id);
    return p ? (p.members || []).includes(user.name) : false;
  };
  const canEditLink = (id: number) => user.isAdmin || canEdit(id);

  const applyKRs = (fn: (krs: KeyResult[]) => KeyResult[]) => ({
    updP: projects.map((pr) => ({
      ...pr,
      objectives: pr.objectives.map((o) => ({ ...o, krs: fn(o.krs) })),
      children: (pr.children || []).map((ch) => ({ ...ch, objectives: (ch.objectives || []).map((o) => ({ ...o, krs: fn(o.krs) })) })),
    })),
    updS: summits.map((s) => ({ ...s, objectives: s.objectives.map((o) => ({ ...o, krs: fn(o.krs) })) })),
    updE: esquentas.map((e) => ({ ...e, objectives: e.objectives.map((o) => ({ ...o, krs: fn(o.krs) })) })),
    updGP: {
      summits: { ...groupParents.summits, objectives: (groupParents.summits.objectives || []).map((o) => ({ ...o, krs: fn(o.krs) })) },
      esquentas: { ...groupParents.esquentas, objectives: (groupParents.esquentas.objectives || []).map((o) => ({ ...o, krs: fn(o.krs) })) },
    } as GroupParents,
  });

  const saveKR = () => {
    const newVal = Number(krVals.current);
    const log = { date: todayStr(), user: user.name, from: 0, to: newVal, note: krVals.note || "" };
    const { updP, updS, updE, updGP } = applyKRs((krs) =>
      krs.map((kr) => {
        if (kr.id !== editingKR) return kr;
        log.from = kr.current;
        return { ...kr, current: newVal, target: Number(krVals.target), logs: [{ ...log }, ...(kr.logs || [])] };
      })
    );
    setProjects(updP); setSummits(updS); setEsquentas(updE); setGroupParents(updGP); setEditingKR(null);
    persist(updP, updS, null, updE, null, updGP);
  };

  const saveLinkFn = () => {
    const entry = { date: todayStr(), user: user.name, oldLink: null as string | null, newLink };
    const { updP, updS, updE, updGP } = applyKRs((krs) =>
      krs.map((kr) => {
        if (kr.id !== editingLink) return kr;
        entry.oldLink = kr.link || null;
        return { ...kr, link: newLink, linkLogs: [{ ...entry }, ...(kr.linkLogs || [])] };
      })
    );
    setProjects(updP); setSummits(updS); setEsquentas(updE); setGroupParents(updGP); setEditingLink(null);
    persist(updP, updS, null, updE, null, updGP);
  };

  const saveObjective = () => {
    const upd = <T extends { objectives: Objective[]; children?: { objectives: Objective[] }[] }>(items: T[]): T[] =>
      items.map((x) => ({
        ...x,
        objectives: x.objectives.map((o) => (o.id === editingObj ? { ...o, title: objTitle } : o)),
        children: (x.children || []).map((ch) => ({ ...ch, objectives: (ch.objectives || []).map((o) => (o.id === editingObj ? { ...o, title: objTitle } : o)) })),
      }));
    const updP = upd(projects), updS = upd(summits as any), updE = upd(esquentas as any);
    const updGP: GroupParents = {
      summits: { ...groupParents.summits, objectives: (groupParents.summits.objectives || []).map((o) => (o.id === editingObj ? { ...o, title: objTitle } : o)) },
      esquentas: { ...groupParents.esquentas, objectives: (groupParents.esquentas.objectives || []).map((o) => (o.id === editingObj ? { ...o, title: objTitle } : o)) },
    };
    setProjects(updP); setSummits(updS as Summit[]); setEsquentas(updE as Esquenta[]); setGroupParents(updGP); setEditingObj(null);
    persist(updP, updS as Summit[], null, updE as Esquenta[], null, updGP);
  };

  const deleteObjective = () => {
    if (!user.isAdmin || editingObj === null) return;
    const ok = window.confirm("Tem certeza que deseja deletar este objetivo? Essa ação é irreversível.");
    if (!ok) return;
    const upd = <T extends { objectives: Objective[]; children?: { objectives: Objective[] }[] }>(items: T[]): T[] =>
      items.map((x) => ({
        ...x,
        objectives: x.objectives.filter((o) => o.id !== editingObj),
        children: (x.children || []).map((ch) => ({ ...ch, objectives: (ch.objectives || []).filter((o) => o.id !== editingObj) })),
      }));
    const updP = upd(projects), updS = upd(summits as any), updE = upd(esquentas as any);
    const updGP: GroupParents = {
      summits: { ...groupParents.summits, objectives: (groupParents.summits.objectives || []).filter((o) => o.id !== editingObj) },
      esquentas: { ...groupParents.esquentas, objectives: (groupParents.esquentas.objectives || []).filter((o) => o.id !== editingObj) },
    };
    setProjects(updP); setSummits(updS as Summit[]); setEsquentas(updE as Esquenta[]); setGroupParents(updGP); setEditingObj(null);
    persist(updP, updS as Summit[], null, updE as Esquenta[], null, updGP);
  };

  const saveKRConfig = () => {
    if (!user.isAdmin || editingKRConfig === null) return;
    const { updP, updS, updE, updGP } = applyKRs((krs) =>
      krs.map((kr) => kr.id === editingKRConfig
        ? { ...kr, title: krConfigVals.title.trim() || kr.title, target: Number(krConfigVals.target), unit: krConfigVals.unit.trim() }
        : kr
      )
    );
    setProjects(updP); setSummits(updS); setEsquentas(updE); setGroupParents(updGP); setEditingKRConfig(null);
    persist(updP, updS, null, updE, null, updGP);
  };

  const deleteKR = () => {
    if (!user.isAdmin || editingKRConfig === null) return;
    const ok = window.confirm("Tem certeza que deseja deletar este KR? Essa ação é irreversível.");
    if (!ok) return;
    const { updP, updS, updE, updGP } = applyKRs((krs) => krs.filter((kr) => kr.id !== editingKRConfig));
    setProjects(updP); setSummits(updS); setEsquentas(updE); setGroupParents(updGP); setEditingKRConfig(null);
    persist(updP, updS, null, updE, null, updGP);
  };

  const saveAnnouncementFn = () => {
    if (!announceText.trim()) return;
    const updated = [{ id: Date.now(), text: announceText.trim(), date: todayStr(), user: user.name }, ...announcements];
    setAnnouncements(updated); setAnnounceText(""); setShowAnnounce(false);
    persist(null, null, updated, null);
  };

  const deleteAnnouncement = (id: number) => {
    const updated = announcements.filter((a) => a.id !== id);
    setAnnouncements(updated); persist(null, null, updated, null);
  };

  const saveSummitFn = () => {
    if (!newSummitName.trim()) return;
    const base = Date.now();
    const updS = [...summits, { id: `s${base}`, name: newSummitName.trim(), date: newSummitDate || null, objectives: [{ id: `so${base}`, title: SUMMIT_OBJ_TITLE, krs: makeSummitKRsPublic([0, 0, 0], base + 100) }] }];
    setSummits(updS); setAddingSummit(false); setNewSummitName(""); setNewSummitDate("");
    persist(null, updS, null, null);
  };

  const saveEsquentaFn = () => {
    if (!newEsquentaName.trim()) return;
    const base = Date.now();
    const updE = [...esquentas, { id: `e${base}`, name: newEsquentaName.trim(), date: newEsquentaDate || null, objectives: [{ id: `eo${base}`, title: ESQUENTA_OBJ_TITLE, krs: makeEsquentaKRsPublic([0, 0], base + 100) }] }];
    setEsquentas(updE); setAddingEsquenta(false); setNewEsquentaName(""); setNewEsquentaDate("");
    persist(null, null, null, updE);
  };

  const saveNewProject = () => {
    if (!newProjName.trim() || !newProjType) return;
    const base = Date.now();
    const newProj: Project = { id: base, type: newProjType as "normal" | "multiprojeto", name: newProjName.trim(), color: newProjColor, members: [], children: [], objectives: [{ id: base + 1, title: newProjObjTitle.trim() || "Objetivo principal", krs: [] }] };
    const updP = [...projects, newProj];
    setProjects(updP); setAddingProject(false); setNewProjType(""); setNewProjName(""); setNewProjObjTitle(""); setNewProjColor("#3B82F6");
    persist(updP, null, null, null);
  };

  const saveProjectSettings = ({ name, color, members }: { name: string; color: string; members: string[] }) => {
    const updP = projects.map((p) => (p.id === settingsProj?.id ? { ...p, name, color, members } : p));
    setProjects(updP); setSettingsProj(null);
    persist(updP, null, null, null);
  };

  const deleteProject = (id: number) => {
    const updP = projects.filter((p) => p.id !== id);
    setProjects(updP); setSettingsProj(null);
    if (view === `project:${id}`) setView("home");
    persist(updP, null, null, null);
  };

  const saveNewChildProject = () => {
    if (!proj || proj.type !== "multiprojeto" || !newChildProjectName.trim()) return;
    const base = Date.now();
    const child = { id: `cp-${base}`, name: newChildProjectName.trim(), objectives: [{ id: base + 1, title: "Objetivo principal", krs: [] as KeyResult[] }] };
    const updP = projects.map((p) => (p.id === proj.id ? { ...p, children: [...(p.children || []), child] } : p));
    setProjects(updP); setAddingChildProject(false); setNewChildProjectName("");
    persist(updP, null, null, null);
  };

  const openGroupSettings = (type: string) => {
    setSettingsGroup(type);
    setGroupLabelInput((groupLabels as any)[type] || "");
  };

  const saveGroupSettings = () => {
    if (!settingsGroup || !groupLabelInput.trim()) return;
    const updG = { ...groupLabels, [settingsGroup]: groupLabelInput.trim() } as GroupLabels;
    setGroupLabels(updG); setSettingsGroup(null); setGroupLabelInput("");
    persist(null, null, null, null, updG);
  };

  const deleteGroupItems = () => {
    if (!user.isAdmin || !settingsGroup) return;
    const groupName = settingsGroup === "summits" ? "Summits" : "Esquenta";
    const ok = window.confirm(`Tem certeza que deseja deletar todos os itens de ${groupName}? Essa ação é irreversível.`);
    if (!ok) return;
    if (settingsGroup === "summits") {
      setSummits([]);
      if (view === "summits" || view.startsWith("summit:")) setView("home");
      persist(null, [], null, null);
    } else {
      setEsquentas([]);
      if (view === "esquentas" || view.startsWith("esquenta:")) setView("home");
      persist(null, null, null, []);
    }
    setSettingsGroup(null); setGroupLabelInput("");
  };

  const openGroupItemSettings = (type: string, item: { id: string; name: string; date?: string | null }) => {
    setSettingsGroupItem({ type, id: item.id });
    setGroupItemName(item.name || "");
    setGroupItemDate(item.date || "");
  };

  const saveGroupItemSettings = () => {
    if (!settingsGroupItem || !groupItemName.trim()) return;
    if (settingsGroupItem.type === "summit") {
      const updS = summits.map((s) => (s.id === settingsGroupItem.id ? { ...s, name: groupItemName.trim(), date: groupItemDate || null } : s));
      setSummits(updS);
      persist(null, updS, null, null);
    } else {
      const updE = esquentas.map((e) => (e.id === settingsGroupItem.id ? { ...e, name: groupItemName.trim(), date: groupItemDate || null } : e));
      setEsquentas(updE);
      persist(null, null, null, updE);
    }
    setSettingsGroupItem(null); setGroupItemName(""); setGroupItemDate("");
  };

  const deleteGroupItem = () => {
    if (!user.isAdmin || !settingsGroupItem) return;
    const label = settingsGroupItem.type === "summit" ? "Summit" : "Esquenta";
    const ok = window.confirm(`Tem certeza que deseja deletar este ${label}? Essa ação é irreversível.`);
    if (!ok) return;
    if (settingsGroupItem.type === "summit") {
      const updS = summits.filter((s) => s.id !== settingsGroupItem.id);
      setSummits(updS);
      if (view === `summit:${settingsGroupItem.id}`) setView("summits");
      persist(null, updS, null, null);
    } else {
      const updE = esquentas.filter((e) => e.id !== settingsGroupItem.id);
      setEsquentas(updE);
      if (view === `esquenta:${settingsGroupItem.id}`) setView("esquentas");
      persist(null, null, null, updE);
    }
    setSettingsGroupItem(null); setGroupItemName(""); setGroupItemDate("");
  };

  const isHome = view === "home";
  const isSummits = view === "summits";
  const isEsquentas = view === "esquentas";
  const proj = view.startsWith("project:") ? projects.find((p) => p.id === Number(view.split(":")[1])) : null;
  const summit = view.startsWith("summit:") ? summits.find((s) => s.id === view.split(":")[1]) : null;
  const esquenta = view.startsWith("esquenta:") ? esquentas.find((e) => e.id === view.split(":")[1]) : null;
  const goBack = () => { if (summit) { setView("summits"); return; } if (esquenta) { setView("esquentas"); return; } setView("home"); };

  const sumAllObjectives = [...summits.flatMap((s) => s.objectives || []), ...(groupParents.summits?.objectives || [])];
  const esquentaAllObjectives = [...esquentas.flatMap((e) => e.objectives || []), ...(groupParents.esquentas?.objectives || [])];
  const summitsTotalPct = avgPct(sumAllObjectives.map(calcObj));
  const esquentasTotalPct = avgPct(esquentaAllObjectives.map(calcObj));
  const allPcts = [...projects.map(calcProj), summitsTotalPct, esquentasTotalPct];
  const globalPct = avgPct(allPcts);
  const onTrack = allPcts.filter((p) => getStatus(p).label === "On Track").length;
  const atRisk = allPcts.filter((p) => getStatus(p).label === "At Risk").length;
  const offTrack = allPcts.filter((p) => getStatus(p).label === "Off Track").length;
  const totalKRs = projects.reduce((a, p) => a + getProjectKRCount(p), 0)
    + summits.reduce((a, s) => a + s.objectives.reduce((b, o) => b + o.krs.length, 0), 0)
    + esquentas.reduce((a, e) => a + e.objectives.reduce((b, o) => b + o.krs.length, 0), 0)
    + (groupParents.summits?.objectives || []).reduce((a, o) => a + o.krs.length, 0)
    + (groupParents.esquentas?.objectives || []).reduce((a, o) => a + o.krs.length, 0);

  const openKREdit = (kr: KeyResult) => { setEditingKR(kr.id); setKrVals({ current: kr.current, target: kr.target, note: "" }); };
  const openKRConfig = (kr: KeyResult) => { setEditingKRConfig(kr.id); setKrConfigVals({ title: kr.title, target: kr.target, unit: kr.unit || "" }); };
  const openLinkEdit = (kr: KeyResult) => { setEditingLink(kr.id); setNewLink(kr.link || ""); };
  const openObjEdit = (obj: Objective) => { setEditingObj(obj.id); setObjTitle(obj.title); };

  const saveNewObjective = () => {
    if (!newObjTitle.trim()) return;
    const base = Date.now();
    const newObj: Objective = { id: base, title: newObjTitle.trim(), krs: [] };
    if (proj) {
      const updP = projects.map((p) => (p.id === proj.id ? { ...p, objectives: [...p.objectives, newObj] } : p));
      setProjects(updP); setAddingObj(false); setNewObjTitle("");
      persist(updP, null, null, null); return;
    }
    if (summit) {
      const updS = summits.map((s) => (s.id === summit.id ? { ...s, objectives: [...s.objectives, newObj] } : s));
      setSummits(updS); setAddingObj(false); setNewObjTitle("");
      persist(null, updS, null, null); return;
    }
    if (esquenta) {
      const updE = esquentas.map((e) => (e.id === esquenta.id ? { ...e, objectives: [...e.objectives, newObj] } : e));
      setEsquentas(updE); setAddingObj(false); setNewObjTitle("");
      persist(null, null, null, updE); return;
    }
    if (isSummits && !summit) {
      const updGP = { ...groupParents, summits: { ...groupParents.summits, objectives: [...(groupParents.summits.objectives || []), newObj] } };
      setGroupParents(updGP); setAddingObj(false); setNewObjTitle("");
      persist(null, null, null, null, null, updGP); return;
    }
    if (isEsquentas && !esquenta) {
      const updGP = { ...groupParents, esquentas: { ...groupParents.esquentas, objectives: [...(groupParents.esquentas.objectives || []), newObj] } };
      setGroupParents(updGP); setAddingObj(false); setNewObjTitle("");
      persist(null, null, null, null, null, updGP);
    }
  };

  const saveNewKR = () => {
    if (!newKRVals.title.trim() || !newKRVals.target) return;
    const base = Date.now();
    const newKR: KeyResult = { id: base, title: newKRVals.title.trim(), current: 0, target: Number(newKRVals.target), unit: newKRVals.unit.trim() || "", logs: [], linkLogs: [] };
    if (proj) {
      const updP = projects.map((p) => (p.id === proj.id
        ? {
          ...p,
          objectives: p.objectives.map((o) => (o.id === addingKRToObj ? { ...o, krs: [...o.krs, newKR] } : o)),
          children: (p.children || []).map((ch) => ({ ...ch, objectives: (ch.objectives || []).map((o) => (o.id === addingKRToObj ? { ...o, krs: [...o.krs, newKR] } : o)) })),
        }
        : p));
      setProjects(updP); setAddingKRToObj(null); setNewKRVals({ title: "", target: "", unit: "" });
      persist(updP, null, null, null); return;
    }
    if (summit) {
      const updS = summits.map((s) => (s.id === summit.id ? { ...s, objectives: s.objectives.map((o) => (o.id === addingKRToObj ? { ...o, krs: [...o.krs, newKR] } : o)) } : s));
      setSummits(updS); setAddingKRToObj(null); setNewKRVals({ title: "", target: "", unit: "" });
      persist(null, updS, null, null); return;
    }
    if (esquenta) {
      const updE = esquentas.map((e) => (e.id === esquenta.id ? { ...e, objectives: e.objectives.map((o) => (o.id === addingKRToObj ? { ...o, krs: [...o.krs, newKR] } : o)) } : e));
      setEsquentas(updE); setAddingKRToObj(null); setNewKRVals({ title: "", target: "", unit: "" });
      persist(null, null, null, updE); return;
    }
    if (isSummits && !summit) {
      const updGP = { ...groupParents, summits: { ...groupParents.summits, objectives: (groupParents.summits.objectives || []).map((o) => (o.id === addingKRToObj ? { ...o, krs: [...o.krs, newKR] } : o)) } };
      setGroupParents(updGP); setAddingKRToObj(null); setNewKRVals({ title: "", target: "", unit: "" });
      persist(null, null, null, null, null, updGP); return;
    }
    if (isEsquentas && !esquenta) {
      const updGP = { ...groupParents, esquentas: { ...groupParents.esquentas, objectives: (groupParents.esquentas.objectives || []).map((o) => (o.id === addingKRToObj ? { ...o, krs: [...o.krs, newKR] } : o)) } };
      setGroupParents(updGP); setAddingKRToObj(null); setNewKRVals({ title: "", target: "", unit: "" });
      persist(null, null, null, null, null, updGP);
    }
  };

  const pageTitle = proj ? proj.name
    : summit ? summit.name
    : isSummits ? groupLabels.summits
    : esquenta ? `${esquenta.name}${esquenta.date ? `  ·  📅 ${fmtShort(esquenta.date)}` : ""}`
    : isEsquentas ? groupLabels.esquentas
    : "Dashboard OKR";

  const renderGroupView = (items: (Summit | Esquenta)[], templates: KRTemplate[], color: string, addLabel: string, onAdd: () => void, showDate: boolean, type: "summit" | "esquenta") => (
    <div>
      {(() => {
        const parentKey = type === "summit" ? "summits" : "esquentas";
        const parentObj = (groupParents[parentKey]?.objectives) || [];
        const allObjectives = [...items.flatMap((i) => i.objectives || []), ...parentObj];
        const totalPct = avgPct(allObjectives.map(calcObj));
        return (
          <div className="mb-6 rounded-[14px] border p-5" style={{ background: "#0F172A", borderColor: color + "44" }}>
            <div className="mb-4 flex items-center gap-6">
              <div>
                <div className="text-[42px] font-black" style={{ color }}>{totalPct}%</div>
                <div className="text-[13px]" style={{ color: "#64748B" }}>somatória geral</div>
              </div>
              <div className="flex-1">
                <ProgressBar value={totalPct} color={color} height={12} />
                <div className="mt-2 text-xs" style={{ color: "#64748B" }}>{items.length} itens · KRs consolidados</div>
              </div>
            </div>
            <div className="border-t pt-3.5" style={{ borderColor: "#1E293B" }}>
              <div className="mb-2.5 text-xs font-semibold tracking-wider" style={{ color: "#64748B" }}>SOMATÓRIA DOS KRs</div>
              {calcGroupAgg(items, templates).map((kr, i) => {
                const p = pct(kr.current, kr.target), st = getStatus(p);
                return (
                  <div key={i} className="mb-2.5 flex flex-wrap items-center gap-3">
                    <span className="min-w-[140px] flex-1 text-xs" style={{ color: "#94A3B8" }}>{kr.title}</span>
                    <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px]" style={{ color: st.color, background: st.bg }}>{st.label}</span>
                    <span className="min-w-[90px] text-right text-xs" style={{ color: "#64748B" }}>{kr.current}/{kr.target} {kr.unit}</span>
                    <div className="w-[120px] shrink-0"><ProgressBar value={p} color={color} height={6} /></div>
                    <span className="min-w-[32px] text-right text-xs font-bold" style={{ color }}>{p}%</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 border-t pt-3.5" style={{ borderColor: "#1E293B" }}>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-bold tracking-wider" style={{ color: "#64748B" }}>OBJETIVOS DO MULTIPROJETO (PROJETO-MÃE)</div>
                {user.isAdmin && (
                  <button onClick={() => setAddingObj(true)} className="cursor-pointer rounded-lg border border-dashed bg-transparent px-2.5 py-1 text-xs"
                    style={{ borderColor: "#334155", color: "#475569" }}>+ Novo Objetivo</button>
                )}
              </div>
              {parentObj.length === 0
                ? <div className="text-xs" style={{ color: "#475569" }}>Nenhum objetivo no projeto-mãe ainda.</div>
                : parentObj.map((obj) => <ObjectiveBlock key={String(obj.id)} obj={obj} color={color} canEdit={user.isAdmin} canEditLink={user.isAdmin} canConfigKR={user.isAdmin} onUpdateKR={openKREdit} onConfigKR={openKRConfig} onEditLink={openLinkEdit} onEditObjective={openObjEdit} onAddKR={user.isAdmin ? setAddingKRToObj : null} />)
              }
            </div>
          </div>
        );
      })()}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3.5">
        {items.map((item) => {
          const p = calcProj(item), st = getStatus(p);
          const viewKey = addLabel === "Novo Summit" ? "summit" : "esquenta";
          return (
            <div key={item.id} onClick={() => setView(`${viewKey}:${item.id}`)}
              className="relative cursor-pointer overflow-hidden rounded-xl border p-[18px] transition-transform duration-200 hover:-translate-y-0.5"
              style={{ background: "#0F172A", borderColor: color + "33" }}>
              <div className="absolute left-0 right-0 top-0 h-[3px] rounded-t-xl" style={{ background: color }} />
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <div className="text-sm font-bold" style={{ color: "#F1F5F9" }}>{item.name}</div>
                  {showDate && "date" in item && item.date && <div className="mt-0.5 text-[11px]" style={{ color: "#64748B" }}>📅 {fmtShort(item.date)}</div>}
                </div>
                <div className="text-right">
                  <div className="text-[22px] font-extrabold" style={{ color }}>{p}%</div>
                  <div className="text-[11px]" style={{ color: st.color }}>{st.label}</div>
                </div>
              </div>
              <ProgressBar value={p} color={color} height={5} />
            </div>
          );
        })}
        {user.isAdmin && (
          <div onClick={onAdd}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed p-[18px] transition-transform duration-200 hover:-translate-y-0.5"
            style={{ background: "#0F172A", borderColor: "#334155" }}>
            <span className="text-xl" style={{ color: "#334155" }}>+</span>
            <span className="text-[13px]" style={{ color: "#475569" }}>{addLabel}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderDetailHeader = (item: { objectives: Objective[] }, color: string) => (
    <div className="mb-6 flex items-center gap-6 rounded-[14px] border p-5" style={{ background: "#0F172A", borderColor: color + "44" }}>
      <div>
        <div className="text-[42px] font-black" style={{ color }}>{calcProj(item)}%</div>
        <div className="text-[13px]" style={{ color: "#64748B" }}>progresso geral</div>
      </div>
      <div className="flex-1"><ProgressBar value={calcProj(item)} color={color} height={12} /></div>
    </div>
  );

  return (
    <div className="min-h-screen p-6" style={{ background: "#020617", color: "#F1F5F9" }}>
      {/* HEADER */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {!isHome && <button onClick={goBack} className="cursor-pointer rounded-lg border-none px-3 py-1.5 text-[13px]" style={{ background: "#1E293B", color: "#94A3B8" }}>← Voltar</button>}
          <div>
            <div className="text-[11px] uppercase tracking-[2px]" style={{ color: "#64748B" }}>AB2L</div>
            <h1 className="m-0 text-[22px] font-extrabold" style={{ color: "#F1F5F9" }}>{pageTitle}</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {saving && <span className="text-[11px]" style={{ color: "#F59E0B" }}>● Salvando…</span>}
          {!saving && lastSaved && <span className="text-[11px]" style={{ color: "#10B981" }}>● Salvo {lastSaved}</span>}
          {user.isAdmin && summit && (
            <button onClick={() => openGroupItemSettings("summit", summit)} title="Editar configurações deste summit" aria-label="Editar configurações deste summit"
              className="cursor-pointer border-none bg-transparent text-base leading-none underline transition-colors hover:!text-[#64748B]" style={{ color: "#475569", padding: "2px 4px" }}>⚙</button>
          )}
          {user.isAdmin && esquenta && (
            <button onClick={() => openGroupItemSettings("esquenta", esquenta)} title="Editar configurações desta cidade de esquenta"
              className="cursor-pointer border-none bg-transparent text-base leading-none underline transition-colors hover:!text-[#64748B]" style={{ color: "#475569", padding: "2px 4px" }}>⚙</button>
          )}
          {user.isAdmin && isSummits && !summit && (
            <button onClick={() => openGroupSettings("summits")} title="Editar configurações da área de summits"
              className="cursor-pointer border-none bg-transparent text-base leading-none underline transition-colors hover:!text-[#64748B]" style={{ color: "#475569", padding: "2px 4px" }}>⚙</button>
          )}
          {user.isAdmin && isEsquentas && !esquenta && (
            <button onClick={() => openGroupSettings("esquentas")} title="Editar configurações da área de esquentas"
              className="cursor-pointer border-none bg-transparent text-base leading-none underline transition-colors hover:!text-[#64748B]" style={{ color: "#475569", padding: "2px 4px" }}>⚙</button>
          )}
          {user.isAdmin && (
            <button onClick={() => setShowAnnounce(true)} className="cursor-pointer rounded-lg border-none px-3.5 py-1.5 text-xs font-semibold text-white" style={{ background: "#7C3AED" }}>
              📢 Aviso
            </button>
          )}
          <div className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs" style={{ background: "#0F172A", borderColor: "#1E293B", color: "#94A3B8" }}>
            👤 {user.name}
            {user.isAdmin && <span className="rounded-full px-1.5 py-px text-[10px]" style={{ background: "#3B82F622", color: "#3B82F6" }}>Admin</span>}
          </div>
          <button onClick={logout} className="cursor-pointer rounded-lg border-none px-3 py-1.5 text-xs" style={{ background: "#1E293B", color: "#64748B" }}>Sair</button>
        </div>
      </div>

      {/* ANNOUNCEMENTS */}
      {isHome && announcements.length > 0 && (
        <div className="mb-5">
          {announcements.map((a) => (
            <div key={a.id} className="mb-2 flex items-center gap-3 rounded-[10px] border px-4 py-2.5" style={{ background: "#1E1040", borderColor: "#7C3AED55" }}>
              <span className="text-sm">📢</span>
              <div className="flex-1">
                <span className="text-[13px]" style={{ color: "#E2D9F3" }}>{a.text}</span>
                <span className="ml-2.5 text-[11px]" style={{ color: "#64748B" }}>{a.user} · {fmtDate(a.date)}</span>
              </div>
              {user.isAdmin && <button onClick={() => deleteAnnouncement(a.id)} className="cursor-pointer border-none bg-transparent text-[13px]" style={{ color: "#475569" }}>✕</button>}
            </div>
          ))}
        </div>
      )}

      {/* HOME */}
      {isHome && (
        <>
          <div className="mb-7 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
            {[
              { label: "Progresso Global", value: `${globalPct}%`, color: "#3B82F6" },
              { label: "Projetos", value: projects.length + 2, color: "#8B5CF6" },
              { label: "Total de KRs", value: totalKRs, color: "#06B6D4" },
              { label: "On Track", value: onTrack, color: "#10B981" },
              { label: "At Risk", value: atRisk, color: "#F59E0B" },
              { label: "Off Track", value: offTrack, color: "#EF4444" },
            ].map((c, i) => (
              <div key={i} className="rounded-xl border p-4" style={{ background: "#0F172A", borderColor: c.color + "33" }}>
                <div className="mb-1.5 text-[11px]" style={{ color: "#64748B" }}>{c.label}</div>
                <div className="text-2xl font-extrabold" style={{ color: c.color }}>{c.value}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {projects.map((p) => (
              <ProjectCard key={p.id} proj={p} onClick={() => setView(`project:${p.id}`)} canEdit={canEdit(p.id)} />
            ))}
            <GroupCard name={groupLabels.summits} items={summits} templates={SUMMIT_KR_TEMPLATES} color={SUMMIT_COLOR} onClick={() => setView("summits")} subtitle={`${summits.length} summits · KRs consolidados`} canEdit={user.isAdmin} />
            <GroupCard name={groupLabels.esquentas} items={esquentas} templates={ESQUENTA_KR_TEMPLATES} color={ESQUENTA_COLOR} onClick={() => setView("esquentas")} subtitle={`${esquentas.length} cidades · KRs consolidados`} canEdit={user.isAdmin} />
            {user.isAdmin && (
              <div onClick={() => { setNewProjType(""); setAddingProject(true); }}
                className="flex min-h-[100px] cursor-pointer items-center justify-center gap-2.5 rounded-[14px] border border-dashed p-5 transition-transform duration-200 hover:-translate-y-0.5"
                style={{ background: "#0F172A", borderColor: "#334155" }}>
                <span className="text-2xl" style={{ color: "#334155" }}>+</span>
                <span className="text-sm" style={{ color: "#475569" }}>Novo Projeto</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* PROJECT DETAIL */}
      {proj && (
        <div>
          <div className="mb-6 flex items-center gap-6 rounded-[14px] border p-5" style={{ background: "#0F172A", borderColor: proj.color + "44" }}>
            <div>
              <div className="text-[42px] font-black" style={{ color: proj.color }}>{calcProj(proj)}%</div>
              <div className="text-[13px]" style={{ color: "#64748B" }}>progresso geral</div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="flex-1"><ProgressBar value={calcProj(proj)} color={proj.color} height={12} /></div>
                {user.isAdmin && (
                  <button onClick={() => setSettingsProj(proj)} title="Editar configurações deste projeto" aria-label="Editar configurações deste projeto"
                    className="cursor-pointer border-none bg-transparent text-[19px] leading-none underline transition-colors hover:!text-[#64748B]" style={{ color: "#334155", padding: "4px 6px" }}>⚙</button>
                )}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-4">
                <span className="text-xs" style={{ color: "#64748B" }}>{getProjectObjectives(proj).length} objetivos</span>
                <span className="text-xs" style={{ color: "#64748B" }}>{getProjectKRCount(proj)} KRs</span>
                {canEdit(proj.id) ? (
                  <span className="text-xs" style={{ color: "#10B981" }}>✓ Você pode editar</span>
                ) : (
                  <span className="text-xs" style={{ color: "#EF4444" }}>🔒 Somente leitura</span>
                )}
                {(proj.members || []).length > 0 && <span className="text-xs" style={{ color: "#475569" }}>· Editores: {(proj.members || []).join(", ")}</span>}
                {proj.type === "multiprojeto" && <span className="text-xs" style={{ color: "#06B6D4" }}>Multiprojeto · soma mãe + subprojetos</span>}
              </div>
            </div>
          </div>
          {proj.objectives.map((obj) => (
            <ObjectiveBlock key={String(obj.id)} obj={obj} color={proj.color} canEdit={canEdit(proj.id)} canEditLink={canEditLink(proj.id)} canConfigKR={user.isAdmin}
              onUpdateKR={openKREdit} onConfigKR={openKRConfig} onEditLink={openLinkEdit} onEditObjective={openObjEdit} onAddKR={canEdit(proj.id) ? setAddingKRToObj : null} />
          ))}
          {proj.type === "multiprojeto" && (
            <div className="mt-3.5">
              <div className="mb-2 text-xs font-bold tracking-wider" style={{ color: "#64748B" }}>SUBPROJETOS</div>
              {(proj.children || []).map((child) => (
                <div key={child.id} className="mb-2.5 rounded-xl border p-3.5" style={{ background: "#0A1628", borderColor: "#1E293B" }}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-[13px] font-bold" style={{ color: "#CBD5E1" }}>{child.name}</div>
                    <div className="text-xs font-bold" style={{ color: proj.color }}>{avgPct((child.objectives || []).map(calcObj))}%</div>
                  </div>
                  {(child.objectives || []).map((obj) => (
                    <ObjectiveBlock key={String(obj.id)} obj={obj} color={proj.color} canEdit={canEdit(proj.id)} canEditLink={canEditLink(proj.id)} canConfigKR={user.isAdmin}
                      onUpdateKR={openKREdit} onConfigKR={openKRConfig} onEditLink={openLinkEdit} onEditObjective={openObjEdit} onAddKR={canEdit(proj.id) ? setAddingKRToObj : null} />
                  ))}
                </div>
              ))}
              {user.isAdmin && (
                <button onClick={() => setAddingChildProject(true)}
                  className="w-full cursor-pointer rounded-xl border border-dashed bg-transparent py-2.5 text-[13px] transition-colors hover:border-[#475569] hover:text-[#64748B]"
                  style={{ borderColor: "#334155", color: "#475569" }}>
                  + Novo Subprojeto
                </button>
              )}
            </div>
          )}
          {user.isAdmin && (
            <button onClick={() => setAddingObj(true)}
              className="mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed bg-transparent py-3 text-[13px] transition-colors hover:border-[#475569] hover:text-[#64748B]"
              style={{ borderColor: "#334155", color: "#475569" }}>
              <span className="text-lg leading-none">+</span> Novo Objetivo
            </button>
          )}
        </div>
      )}

      {/* SUMMITS */}
      {isSummits && !summit && renderGroupView(summits, SUMMIT_KR_TEMPLATES, SUMMIT_COLOR, "Novo Summit", () => setAddingSummit(true), true, "summit")}
      {summit && (
        <div>
          {renderDetailHeader(summit, SUMMIT_COLOR)}
          {summit.objectives.map((obj) => (
            <ObjectiveBlock key={String(obj.id)} obj={obj} color={SUMMIT_COLOR} canEdit={user.isAdmin} canEditLink={user.isAdmin} canConfigKR={user.isAdmin}
              onUpdateKR={openKREdit} onConfigKR={openKRConfig} onEditLink={openLinkEdit} onEditObjective={openObjEdit} onAddKR={user.isAdmin ? setAddingKRToObj : null} />
          ))}
          {user.isAdmin && (
            <button onClick={() => setAddingObj(true)}
              className="mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed bg-transparent py-3 text-[13px] transition-colors hover:border-[#475569] hover:text-[#64748B]"
              style={{ borderColor: "#334155", color: "#475569" }}>
              <span className="text-lg leading-none">+</span> Novo Objetivo
            </button>
          )}
        </div>
      )}

      {/* ESQUENTAS */}
      {isEsquentas && !esquenta && renderGroupView(esquentas, ESQUENTA_KR_TEMPLATES, ESQUENTA_COLOR, "Nova Cidade", () => setAddingEsquenta(true), true, "esquenta")}
      {esquenta && (
        <div>
          {renderDetailHeader(esquenta, ESQUENTA_COLOR)}
          {esquenta.objectives.map((obj) => (
            <ObjectiveBlock key={String(obj.id)} obj={obj} color={ESQUENTA_COLOR} canEdit={user.isAdmin} canEditLink={user.isAdmin} canConfigKR={user.isAdmin}
              onUpdateKR={openKREdit} onConfigKR={openKRConfig} onEditLink={openLinkEdit} onEditObjective={openObjEdit} onAddKR={user.isAdmin ? setAddingKRToObj : null} />
          ))}
          {user.isAdmin && (
            <button onClick={() => setAddingObj(true)}
              className="mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed bg-transparent py-3 text-[13px] transition-colors hover:border-[#475569] hover:text-[#64748B]"
              style={{ borderColor: "#334155", color: "#475569" }}>
              <span className="text-lg leading-none">+</span> Novo Objetivo
            </button>
          )}
        </div>
      )}

      {/* ── MODALS ── */}

      {editingKR !== null && (
        <Modal title="Atualizar Key Result" onClose={() => setEditingKR(null)}>
          {[["Valor atual", "current", "number"], ["Meta", "target", "number"], ["Observação (opcional)", "note", "text"]].map(([label, key, type]) => (
            <Field key={key} label={label as string}>
              <input type={type} value={(krVals as any)[key] || ""} onChange={(e) => setKrVals((v) => ({ ...v, [key]: e.target.value }))} style={INPUT_STYLE} />
            </Field>
          ))}
          <BtnRow onSave={saveKR} onCancel={() => setEditingKR(null)} />
        </Modal>
      )}

      {editingKRConfig !== null && (
        <Modal title="Configuração KR" onClose={() => setEditingKRConfig(null)}>
          <Field label="Título do KR">
            <input type="text" value={krConfigVals.title} onChange={(e) => setKrConfigVals((v) => ({ ...v, title: e.target.value }))} style={INPUT_STYLE} />
          </Field>
          <Field label="Meta">
            <input type="number" value={krConfigVals.target} onChange={(e) => setKrConfigVals((v) => ({ ...v, target: e.target.value }))} style={INPUT_STYLE} />
          </Field>
          <Field label="Unidade">
            <input type="text" value={krConfigVals.unit} onChange={(e) => setKrConfigVals((v) => ({ ...v, unit: e.target.value }))} style={INPUT_STYLE} />
          </Field>
          <BtnRow onSave={saveKRConfig} onCancel={() => setEditingKRConfig(null)} />
          {user.isAdmin && (
            <button onClick={deleteKR}
              className="mt-2.5 w-full cursor-pointer rounded-lg border bg-transparent px-2 py-2 text-xs transition-colors hover:!bg-[#450A0A] hover:!text-[#FCA5A5]"
              style={{ borderColor: "#450A0A", color: "#7F1D1D" }}>
              Deletar KR
            </button>
          )}
        </Modal>
      )}

      {editingLink !== null && (
        <Modal title="Link Operacional" onClose={() => setEditingLink(null)}>
          <p className="mb-4 text-xs" style={{ color: "#64748B" }}>Cole o link da planilha, Trello, Notion ou qualquer ferramenta deste KR.</p>
          <input type="url" placeholder="https://…" value={newLink} onChange={(e) => setNewLink(e.target.value)} style={{ ...INPUT_STYLE, marginBottom: 8 }} />
          {newLink && <div className="mb-2 text-xs" style={{ color: "#64748B" }}>{getToolIcon(newLink)} {getToolName(newLink)}</div>}
          <BtnRow onSave={saveLinkFn} onCancel={() => setEditingLink(null)} />
        </Modal>
      )}

      {editingObj !== null && (
        <Modal title="Editar Objetivo" onClose={() => setEditingObj(null)}>
          <input type="text" value={objTitle} onChange={(e) => setObjTitle(e.target.value)} style={{ ...INPUT_STYLE, marginBottom: 4 }} />
          <BtnRow onSave={saveObjective} onCancel={() => setEditingObj(null)} />
          {user.isAdmin && (
            <button onClick={deleteObjective}
              className="mt-2.5 w-full cursor-pointer rounded-lg border bg-transparent px-2 py-2 text-xs transition-colors hover:!bg-[#450A0A] hover:!text-[#FCA5A5]"
              style={{ borderColor: "#450A0A", color: "#7F1D1D" }}>
              Deletar Objetivo
            </button>
          )}
        </Modal>
      )}

      {settingsGroup !== null && (
        <Modal title={settingsGroup === "summits" ? "Configuração Summits" : "Configuração Esquenta"} onClose={() => setSettingsGroup(null)}>
          <Field label="Nome do card">
            <input type="text" value={groupLabelInput} onChange={(e) => setGroupLabelInput(e.target.value)} style={INPUT_STYLE} />
          </Field>
          <BtnRow onSave={saveGroupSettings} onCancel={() => setSettingsGroup(null)} />
          {user.isAdmin && (
            <button onClick={deleteGroupItems}
              className="mt-2.5 w-full cursor-pointer rounded-lg border bg-transparent px-2 py-2 text-xs transition-colors hover:!bg-[#450A0A] hover:!text-[#FCA5A5]"
              style={{ borderColor: "#450A0A", color: "#7F1D1D" }}>
              Deletar todos os itens
            </button>
          )}
        </Modal>
      )}

      {settingsGroupItem !== null && (
        <Modal title={settingsGroupItem.type === "summit" ? "Configuração Summit" : "Configuração Esquenta"} onClose={() => setSettingsGroupItem(null)}>
          <Field label="Nome">
            <input type="text" value={groupItemName} onChange={(e) => setGroupItemName(e.target.value)} style={INPUT_STYLE} />
          </Field>
          <Field label="Data">
            <input type="date" value={groupItemDate} onChange={(e) => setGroupItemDate(e.target.value)} style={INPUT_STYLE} />
          </Field>
          <BtnRow onSave={saveGroupItemSettings} onCancel={() => setSettingsGroupItem(null)} />
          {user.isAdmin && (
            <button onClick={deleteGroupItem}
              className="mt-2.5 w-full cursor-pointer rounded-lg border bg-transparent px-2 py-2 text-xs transition-colors hover:!bg-[#450A0A] hover:!text-[#FCA5A5]"
              style={{ borderColor: "#450A0A", color: "#7F1D1D" }}>
              {settingsGroupItem.type === "summit" ? "Deletar Summit" : "Deletar Esquenta"}
            </button>
          )}
        </Modal>
      )}

      {showAnnounce && (
        <Modal title="📢 Publicar Aviso Geral" borderColor="#7C3AED55" onClose={() => setShowAnnounce(false)}>
          <p className="mb-3 text-xs" style={{ color: "#64748B" }}>Aparece no topo do Dashboard para todos os usuários.</p>
          <textarea rows={3} value={announceText} onChange={(e) => setAnnounceText(e.target.value)}
            placeholder="Ex: Reunião de alinhamento OKR na sexta às 15h…"
            style={{ ...INPUT_STYLE, resize: "vertical" as const, marginBottom: 4 }} />
          <BtnRow onSave={saveAnnouncementFn} onCancel={() => setShowAnnounce(false)} saveLabel="Publicar" saveColor="#7C3AED" />
        </Modal>
      )}

      {addingProject && (
        <Modal title="Novo Projeto" onClose={() => { setAddingProject(false); setNewProjType(""); }}>
          <Field label="Tipo de projeto">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setNewProjType("normal")} className="cursor-pointer rounded-lg border px-2.5 py-2.5 text-sm"
                style={{ background: newProjType === "normal" ? "#0F2240" : "#1E293B", borderColor: "#334155", color: "#CBD5E1" }}>
                Projeto normal
              </button>
              <button onClick={() => setNewProjType("multiprojeto")} className="cursor-pointer rounded-lg border px-2.5 py-2.5 text-sm"
                style={{ background: newProjType === "multiprojeto" ? "#0F2240" : "#1E293B", borderColor: "#334155", color: "#CBD5E1" }}>
                Multiprojeto
              </button>
            </div>
          </Field>
          <Field label="Nome do projeto"><input type="text" placeholder="Ex: AB2L Awards" value={newProjName} onChange={(e) => setNewProjName(e.target.value)} style={INPUT_STYLE} /></Field>
          <Field label={newProjType === "multiprojeto" ? "Objetivo do projeto-mãe" : "Primeiro objetivo"}>
            <input type="text" placeholder="Ex: Consolidar o programa de premiações" value={newProjObjTitle} onChange={(e) => setNewProjObjTitle(e.target.value)} style={INPUT_STYLE} />
          </Field>
          <Field label="Cor do projeto">
            <div className="flex flex-wrap gap-2">
              {PALETTE.map((c) => <div key={c} onClick={() => setNewProjColor(c)} className="cursor-pointer rounded-full" style={{ width: 28, height: 28, background: c, border: newProjColor === c ? "3px solid #fff" : "3px solid transparent" }} />)}
            </div>
          </Field>
          <BtnRow onSave={saveNewProject} onCancel={() => { setAddingProject(false); setNewProjType(""); }} saveLabel="Criar" saveColor={newProjColor} />
        </Modal>
      )}

      {addingSummit && (
        <Modal title="Novo Summit" borderColor="#06B6D444" onClose={() => setAddingSummit(false)}>
          <Field label="Nome do Summit"><input type="text" placeholder="Ex: Tokyo Summit" value={newSummitName} onChange={(e) => setNewSummitName(e.target.value)} style={INPUT_STYLE} /></Field>
          <Field label="Data (opcional)"><input type="date" value={newSummitDate} onChange={(e) => setNewSummitDate(e.target.value)} style={INPUT_STYLE} /></Field>
          <BtnRow onSave={saveSummitFn} onCancel={() => setAddingSummit(false)} saveLabel="Criar" saveColor={SUMMIT_COLOR} />
        </Modal>
      )}

      {addingChildProject && (
        <Modal title="Novo Subprojeto" onClose={() => setAddingChildProject(false)}>
          <Field label="Nome do subprojeto">
            <input type="text" placeholder="Ex: Frente Europa" value={newChildProjectName} onChange={(e) => setNewChildProjectName(e.target.value)} style={INPUT_STYLE} />
          </Field>
          <BtnRow onSave={saveNewChildProject} onCancel={() => setAddingChildProject(false)} saveLabel="Criar" saveColor={proj?.color || "#3B82F6"} />
        </Modal>
      )}

      {addingEsquenta && (
        <Modal title="Nova Cidade" borderColor="#EF444444" onClose={() => setAddingEsquenta(false)}>
          <Field label="Cidade"><input type="text" placeholder="Ex: Curitiba, PR" value={newEsquentaName} onChange={(e) => setNewEsquentaName(e.target.value)} style={INPUT_STYLE} /></Field>
          <Field label="Data do evento"><input type="date" value={newEsquentaDate} onChange={(e) => setNewEsquentaDate(e.target.value)} style={INPUT_STYLE} /></Field>
          <BtnRow onSave={saveEsquentaFn} onCancel={() => setAddingEsquenta(false)} saveLabel="Criar" saveColor={ESQUENTA_COLOR} />
        </Modal>
      )}

      {settingsProj && (
        <ProjectSettingsModal proj={settingsProj} onSave={saveProjectSettings} onDelete={() => deleteProject(settingsProj.id)} onClose={() => setSettingsProj(null)} />
      )}

      {addingObj && (
        <Modal title="Novo Objetivo" onClose={() => { setAddingObj(false); setNewObjTitle(""); }}>
          <Field label="Título do objetivo">
            <input type="text" placeholder="Ex: Expandir presença nacional" value={newObjTitle} onChange={(e) => setNewObjTitle(e.target.value)} style={INPUT_STYLE} autoFocus />
          </Field>
          <BtnRow onSave={saveNewObjective} onCancel={() => { setAddingObj(false); setNewObjTitle(""); }} saveLabel="Criar" saveColor={proj?.color || "#3B82F6"} />
        </Modal>
      )}

      {addingKRToObj !== null && (
        <Modal title="Novo Key Result" onClose={() => { setAddingKRToObj(null); setNewKRVals({ title: "", target: "", unit: "" }); }}>
          <Field label="Título do KR">
            <input type="text" placeholder="Ex: Fechar 10 contratos" value={newKRVals.title} onChange={(e) => setNewKRVals((v) => ({ ...v, title: e.target.value }))} style={INPUT_STYLE} autoFocus />
          </Field>
          <Field label="Meta">
            <input type="number" placeholder="Ex: 10" value={newKRVals.target} onChange={(e) => setNewKRVals((v) => ({ ...v, target: e.target.value }))} style={INPUT_STYLE} />
          </Field>
          <Field label="Unidade">
            <input type="text" placeholder="Ex: contratos, inscritos, %" value={newKRVals.unit} onChange={(e) => setNewKRVals((v) => ({ ...v, unit: e.target.value }))} style={INPUT_STYLE} />
          </Field>
          <BtnRow onSave={saveNewKR} onCancel={() => { setAddingKRToObj(null); setNewKRVals({ title: "", target: "", unit: "" }); }} saveLabel="Criar" saveColor={proj?.color || "#3B82F6"} />
        </Modal>
      )}
    </div>
  );
}

import type { Project, Summit, Esquenta, Announcement, GroupLabels, GroupParents } from "./types";
import { DEFAULT_PROJECTS, DEFAULT_SUMMITS, DEFAULT_ESQUENTAS, DEFAULT_GROUP_LABELS, DEFAULT_GROUP_PARENTS, normalizeProject } from "./data";

const KEYS = {
  projects: "ab2l-okr-v2",
  summits: "ab2l-summits-v2",
  announcements: "ab2l-ann-v1",
  esquentas: "ab2l-esquentas-v1",
  groupLabels: "ab2-groups-v1",
  groupParents: "ab2-group-parents-v1",
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadProjects(): Project[] {
  const raw = load(KEYS.projects, DEFAULT_PROJECTS);
  return raw.map(normalizeProject);
}
export function loadSummits(): Summit[] {
  return load(KEYS.summits, DEFAULT_SUMMITS);
}
export function loadEsquentas(): Esquenta[] {
  return load(KEYS.esquentas, DEFAULT_ESQUENTAS);
}
export function loadAnnouncements(): Announcement[] {
  return load(KEYS.announcements, []);
}
export function loadGroupLabels(): GroupLabels {
  return load(KEYS.groupLabels, DEFAULT_GROUP_LABELS);
}
export function loadGroupParents(): GroupParents {
  return load(KEYS.groupParents, DEFAULT_GROUP_PARENTS);
}

export function saveProjects(data: Project[]) { save(KEYS.projects, data); }
export function saveSummits(data: Summit[]) { save(KEYS.summits, data); }
export function saveEsquentas(data: Esquenta[]) { save(KEYS.esquentas, data); }
export function saveAnnouncements(data: Announcement[]) { save(KEYS.announcements, data); }
export function saveGroupLabels(data: GroupLabels) { save(KEYS.groupLabels, data); }
export function saveGroupParents(data: GroupParents) { save(KEYS.groupParents, data); }

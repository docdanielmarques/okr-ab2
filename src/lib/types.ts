export interface User {
  email: string;
  name: string;
  isAdmin: boolean;
}

export interface KRLog {
  date: string;
  user: string;
  from: number;
  to: number;
  note: string;
}

export interface LinkLog {
  date: string;
  user: string;
  oldLink: string | null;
  newLink: string;
}

export interface KeyResult {
  id: number;
  title: string;
  current: number;
  target: number;
  unit: string;
  logs: KRLog[];
  link?: string;
  linkLogs: LinkLog[];
}

export interface Objective {
  id: number | string;
  title: string;
  krs: KeyResult[];
}

export interface ChildProject {
  id: string;
  name: string;
  objectives: Objective[];
}

export interface Project {
  id: number;
  name: string;
  color: string;
  members: string[];
  objectives: Objective[];
  type?: "normal" | "multiprojeto";
  children?: ChildProject[];
}

export interface Summit {
  id: string;
  name: string;
  date?: string | null;
  objectives: Objective[];
}

export interface Esquenta {
  id: string;
  name: string;
  date: string | null;
  objectives: Objective[];
}

export interface Announcement {
  id: number;
  text: string;
  date: string;
  user: string;
}

export interface KRTemplate {
  title: string;
  unit: string;
  target: number;
}

export interface Status {
  label: string;
  color: string;
  bg: string;
}

export interface GroupLabels {
  summits: string;
  esquentas: string;
}

export interface GroupParentItem {
  id: string;
  name: string;
  objectives: Objective[];
}

export interface GroupParents {
  summits: GroupParentItem;
  esquentas: GroupParentItem;
}

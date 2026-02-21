import type { Project } from "@/lib/types";
import { calcProj, getStatus, getProjectObjectives, getProjectKRCount } from "@/lib/data";
import { ProgressBar } from "./ProgressBar";

interface ProjectCardProps {
  proj: Project;
  onClick: () => void;
  canEdit: boolean;
}

export function ProjectCard({ proj, onClick, canEdit }: ProjectCardProps) {
  const p = calcProj(proj);
  const st = getStatus(p);
  const totalKRs = getProjectKRCount(proj);
  const totalObjs = getProjectObjectives(proj).length;

  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer overflow-hidden rounded-[14px] border p-5 transition-transform duration-200 hover:-translate-y-0.5"
      style={{ background: "#0F172A", borderColor: canEdit ? proj.color + "55" : "#1E293B", opacity: canEdit ? 1 : 0.7 }}
    >
      <div className="absolute left-0 right-0 top-0 h-[3px] rounded-t-[14px]" style={{ background: canEdit ? proj.color : "#334155" }} />
      <div className="mb-3.5 flex items-start justify-between">
        <div className="flex-1 pr-6">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <div className="text-[15px] font-bold" style={{ color: "#F1F5F9" }}>{proj.name}</div>
            {canEdit && (
              <span className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: proj.color + "22", color: proj.color }}>
                Você edita
              </span>
            )}
            {proj.type === "multiprojeto" && (
              <span className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: "#06B6D422", color: "#06B6D4" }}>
                Multiprojeto
              </span>
            )}
          </div>
          <div className="text-[11px]" style={{ color: "#64748B" }}>
            {totalObjs} objetivo{totalObjs > 1 ? "s" : ""} · {totalKRs} KRs
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[26px] font-extrabold" style={{ color: proj.color }}>{p}%</div>
          <div className="text-[11px]" style={{ color: st.color }}>{st.label}</div>
        </div>
      </div>
      <ProgressBar value={p} color={proj.color} height={6} />
    </div>
  );
}

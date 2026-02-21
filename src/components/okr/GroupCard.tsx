import type { KRTemplate, Objective } from "@/lib/types";
import { calcGroupPct, getStatus } from "@/lib/data";
import { ProgressBar } from "./ProgressBar";

interface GroupCardProps {
  name: string;
  items: { objectives: Objective[] }[];
  templates: KRTemplate[];
  color: string;
  onClick: () => void;
  subtitle: string;
  canEdit?: boolean;
  canConfig?: boolean;
  onConfig?: (() => void) | null;
  configTitle?: string;
}

export function GroupCard({ name, items, templates, color, onClick, subtitle, canEdit, canConfig, onConfig, configTitle }: GroupCardProps) {
  const p = calcGroupPct(items, templates);
  const st = getStatus(p);

  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer overflow-hidden rounded-[14px] border p-5 transition-transform duration-200 hover:-translate-y-0.5"
      style={{ background: "#0F172A", borderColor: color + "55" }}
    >
      <div className="absolute left-0 right-0 top-0 h-[3px] rounded-t-[14px]" style={{ background: color }} />
      <div className="mb-3.5 flex items-start justify-between">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <div className="text-[15px] font-bold" style={{ color: "#F1F5F9" }}>{name}</div>
            {canEdit && (
              <span className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: color + "22", color }}>
                Você edita
              </span>
            )}
          </div>
          <div className="text-[11px]" style={{ color: "#64748B" }}>{subtitle}</div>
        </div>
        <div className="text-right">
          <div className="text-[26px] font-extrabold" style={{ color }}>{p}%</div>
          <div className="text-[11px]" style={{ color: st.color }}>{st.label}</div>
        </div>
      </div>
      <ProgressBar value={p} color={color} height={6} />
      {canConfig && onConfig && (
        <button
          onClick={(e) => { e.stopPropagation(); onConfig(); }}
          title={configTitle}
          aria-label={configTitle}
          className="absolute right-2.5 top-2.5 cursor-pointer border-none bg-transparent p-[4px_6px] text-base leading-none underline transition-colors hover:!text-[#64748B]"
          style={{ color: "#475569" }}
        >
          ⚙
        </button>
      )}
    </div>
  );
}

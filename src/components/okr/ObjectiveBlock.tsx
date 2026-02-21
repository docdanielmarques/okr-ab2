import type { Objective, KeyResult } from "@/lib/types";
import { calcObj, getStatus } from "@/lib/data";
import { ProgressBar } from "./ProgressBar";
import { KRRow } from "./KRRow";

interface ObjectiveBlockProps {
  obj: Objective;
  color: string;
  canEdit: boolean;
  canEditLink: boolean;
  canConfigKR?: boolean;
  onUpdateKR: (kr: KeyResult) => void;
  onConfigKR?: (kr: KeyResult) => void;
  onEditLink: (kr: KeyResult) => void;
  onEditObjective: (obj: Objective) => void;
  onAddKR?: ((objId: number | string) => void) | null;
}

export function ObjectiveBlock({ obj, color, canEdit, canEditLink, canConfigKR, onUpdateKR, onConfigKR, onEditLink, onEditObjective, onAddKR }: ObjectiveBlockProps) {
  const op = calcObj(obj);
  const st = getStatus(op);

  return (
    <div className="mb-4 rounded-[14px] border p-5" style={{ background: "#0F172A", borderColor: "#1E293B" }}>
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-0.5 text-xs" style={{ color: "#64748B" }}>OBJETIVO</div>
          <div className="flex items-center gap-2">
            <div className="text-[15px] font-bold" style={{ color: "#F1F5F9" }}>{obj.title}</div>
            {canEdit && (
              <button
                onClick={() => onEditObjective(obj)}
                title="Editar configurações deste objetivo"
                aria-label="Editar configurações deste objetivo"
                className="cursor-pointer border-none bg-transparent p-[2px_4px] text-[15px] leading-none transition-colors hover:!text-[#64748B]"
                style={{ color: "#475569" }}
              >
                ⚙
              </button>
            )}
          </div>
        </div>
        <div className="ml-3 text-right">
          <div className="text-[22px] font-extrabold" style={{ color }}>{op}%</div>
          <div className="text-[11px]" style={{ color: st.color }}>{st.label}</div>
        </div>
      </div>
      <ProgressBar value={op} color={color} height={6} />
      <div className="mt-4">
        {obj.krs.map((kr) => (
          <KRRow key={kr.id} kr={kr} color={color} canEdit={canEdit} canEditLink={canEditLink} canConfigKR={canConfigKR} onUpdate={onUpdateKR} onConfig={onConfigKR} onEditLink={onEditLink} />
        ))}
      </div>
      {canEdit && onAddKR && (
        <button
          onClick={() => onAddKR(obj.id)}
          className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed bg-transparent py-1.5 text-xs transition-colors hover:border-[#475569] hover:text-[#64748B]"
          style={{ borderColor: "#1E293B", color: "#334155" }}
        >
          <span className="text-sm leading-none">+</span> Novo KR
        </button>
      )}
    </div>
  );
}

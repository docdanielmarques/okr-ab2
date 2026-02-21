import { useState } from "react";
import type { KeyResult } from "@/lib/types";
import { pct, getStatus, fmtDate, getToolName, getToolIcon } from "@/lib/data";
import { ProgressBar } from "./ProgressBar";

interface KRRowProps {
  kr: KeyResult;
  color: string;
  canEdit: boolean;
  canEditLink: boolean;
  canConfigKR?: boolean;
  onUpdate: (kr: KeyResult) => void;
  onConfig?: (kr: KeyResult) => void;
  onEditLink: (kr: KeyResult) => void;
}

export function KRRow({ kr, color, canEdit, canEditLink, canConfigKR, onUpdate, onConfig, onEditLink }: KRRowProps) {
  const [openKR, setOpenKR] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const p = pct(kr.current, kr.target);
  const st = getStatus(p);
  const logs = kr.logs || [];
  const linkLogs = kr.linkLogs || [];

  return (
    <div className="py-3" style={{ borderBottom: "1px solid #1E293B" }}>
      {/* Title + status */}
      <div className="mb-1.5 flex items-center justify-between">
        <div className="mr-3 flex flex-1 items-center gap-1.5">
          <span className="text-[13px]" style={{ color: "#CBD5E1" }}>{kr.title}</span>
          {canEdit && (
            <button
              onClick={() => onUpdate(kr)}
              title="Atualizar KR"
              className="cursor-pointer border-none bg-transparent p-[1px_3px] text-sm leading-none transition-colors hover:!text-[#64748B]"
              style={{ color: "#475569" }}
            >
              ↻
            </button>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full px-2 py-0.5 text-[11px]" style={{ color: st.color, background: st.bg }}>{st.label}</span>
          <span className="min-w-[80px] text-right text-xs" style={{ color: "#F1F5F9" }}>{kr.current}/{kr.target} {kr.unit}</span>
        </div>
      </div>

      {/* Progress + actions */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-[80px] flex-1"><ProgressBar value={p} color={color} /></div>
        <span className="min-w-[32px] text-right text-xs font-bold" style={{ color }}>{p}%</span>

        {kr.link ? (
          <a href={kr.link} target="_blank" rel="noopener noreferrer" title={`${getToolName(kr.link)}: ${kr.link}`}
            className="rounded-md px-2 py-0.5 text-xs no-underline" style={{ background: "#1E293B", border: "1px solid #334155" }}>
            🔗
          </a>
        ) : canEditLink && (
          <button onClick={() => onEditLink(kr)} className="cursor-pointer rounded-md px-2 py-0.5 text-[11px]"
            style={{ background: "#1E293B", border: "1px dashed #334155", color: "#475569" }}>+ link</button>
        )}
        {canEditLink && kr.link && (
          <button
            onClick={() => onEditLink(kr)}
            title="Editar configurações do link deste KR"
            aria-label="Editar configurações do link deste KR"
            className="cursor-pointer border-none bg-transparent p-[2px_4px] text-sm leading-none transition-colors hover:!text-[#64748B]"
            style={{ color: "#475569" }}
          >
            ⚙
          </button>
        )}
        {canConfigKR && onConfig && (
          <button
            onClick={() => onConfig(kr)}
            title="Editar configurações deste KR"
            aria-label="Editar configurações deste KR"
            className="cursor-pointer border-none bg-transparent p-[2px_4px] text-[15px] leading-none transition-colors hover:!text-[#64748B]"
            style={{ color: "#475569" }}
          >
            ⚙
          </button>
        )}

        <div className="flex gap-1">
          <button onClick={() => { setOpenKR((v) => !v); setOpenLink(false); }}
            className="cursor-pointer whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-medium"
            style={{ background: "none", border: "1px solid #1E293B", color: "#334155" }}>
            Log KR ({logs.length}) {openKR ? "▲" : "▼"}
          </button>
          <button onClick={() => { setOpenLink((v) => !v); setOpenKR(false); }}
            className="cursor-pointer whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-medium"
            style={{ background: "none", border: "1px solid #1E293B", color: "#334155" }}>
            Log Link ({linkLogs.length}) {openLink ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {/* KR Logs */}
      {openKR && (
        <div className="mt-2 overflow-hidden rounded-[10px]" style={{ background: "#0A1628", border: `1px solid ${color}33` }}>
          {!logs.length ? (
            <div className="px-3.5 py-2.5 text-xs" style={{ color: "#475569" }}>Nenhuma atualização registrada.</div>
          ) : logs.map((log, i) => (
            <div key={i} className="px-3.5 py-2.5" style={{ borderBottom: i < logs.length - 1 ? `1px solid ${color}22` : "none" }}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold" style={{ color }}>{log.user}</span>
                <span className="text-[11px]" style={{ color: "#475569" }}>· {fmtDate(log.date)}</span>
                <span className="ml-auto rounded-md px-2 py-0.5 text-xs" style={{ background: "#1E293B" }}>
                  <span style={{ color: "#EF4444" }}>{log.from}</span>
                  <span style={{ color: "#475569" }}> → </span>
                  <span style={{ color: "#10B981" }}>{log.to}</span>
                </span>
              </div>
              {log.note && <div className="mt-1 text-xs italic" style={{ color: "#64748B" }}>"{log.note}"</div>}
            </div>
          ))}
        </div>
      )}

      {/* Link Logs */}
      {openLink && (
        <div className="mt-2 overflow-hidden rounded-[10px]" style={{ background: "#0A1628", border: "1px solid #06B6D433" }}>
          {!linkLogs.length ? (
            <div className="px-3.5 py-2.5 text-xs" style={{ color: "#475569" }}>Nenhuma alteração de link registrada.</div>
          ) : linkLogs.map((l, i) => (
            <div key={i} className="px-3.5 py-2.5" style={{ borderBottom: i < linkLogs.length - 1 ? "1px solid #06B6D422" : "none" }}>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: "#06B6D4" }}>{l.user}</span>
                <span className="text-[11px]" style={{ color: "#475569" }}>· {fmtDate(l.date)}</span>
              </div>
              <div className="mb-0.5 text-[11px]" style={{ color: "#475569" }}>
                Novo: <a href={l.newLink || ""} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#06B6D4" }}>
                  {l.newLink ? (l.newLink.length > 50 ? l.newLink.slice(0, 50) + "…" : l.newLink) : "—"}
                </a>
              </div>
              {l.oldLink ? (
                <div className="text-[11px]" style={{ color: "#475569" }}>
                  Anterior: <a href={l.oldLink} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#475569" }}>
                    {l.oldLink.length > 50 ? l.oldLink.slice(0, 50) + "…" : l.oldLink}
                  </a>
                </div>
              ) : (
                <div className="text-[11px]" style={{ color: "#334155" }}>Primeiro link adicionado</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

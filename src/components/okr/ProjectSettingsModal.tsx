import { useState } from "react";
import type { Project, User } from "@/lib/types";
import { NON_ADMIN_USERS, PALETTE } from "@/lib/data";
import { Field, INPUT_STYLE } from "./Modal";

interface ProjectSettingsModalProps {
  proj: Project;
  onSave: (data: { name: string; color: string; members: string[] }) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function ProjectSettingsModal({ proj, onSave, onDelete, onClose }: ProjectSettingsModalProps) {
  const [name, setName] = useState(proj.name);
  const [color, setColor] = useState(proj.color);
  const [members, setMembers] = useState(proj.members || []);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggle = (n: string) => setMembers((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "#00000090" }}>
      <div className="w-[90%] min-w-[360px] max-w-[440px] overflow-y-auto rounded-2xl border p-7" style={{ background: "#0F172A", borderColor: "#1E293B", maxHeight: "90vh" }}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-bold" style={{ color: "#F1F5F9" }}>Configurações do projeto</h3>
          <button onClick={onClose} className="cursor-pointer border-none bg-transparent text-xl leading-none" style={{ color: "#475569" }}>×</button>
        </div>

        <Field label="Nome">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={INPUT_STYLE} />
        </Field>

        <Field label="Cor">
          <div className="flex flex-wrap gap-2">
            {PALETTE.map((c) => (
              <div key={c} onClick={() => setColor(c)} className="cursor-pointer rounded-full transition-transform"
                style={{
                  width: 26, height: 26, background: c,
                  border: color === c ? "3px solid #fff" : "3px solid transparent",
                  transform: color === c ? "scale(1.15)" : "scale(1)",
                }} />
            ))}
          </div>
        </Field>

        <Field label="Quem pode editar">
          <div className="overflow-hidden rounded-[10px] border" style={{ background: "#0A1628", borderColor: "#1E293B" }}>
            {NON_ADMIN_USERS.map((u, i) => {
              const checked = members.includes(u.name);
              return (
                <div key={u.email} onClick={() => toggle(u.name)}
                  className="flex cursor-pointer items-center gap-2.5 px-3.5 py-2.5 transition-colors"
                  style={{ borderBottom: i < NON_ADMIN_USERS.length - 1 ? "1px solid #1E293B" : "none", background: checked ? "#0F2240" : "transparent" }}>
                  <div className="flex shrink-0 items-center justify-center rounded transition-all"
                    style={{ width: 16, height: 16, background: checked ? color : "transparent", border: `2px solid ${checked ? color : "#334155"}` }}>
                    {checked && <span className="text-[10px] font-bold leading-none text-white">✓</span>}
                  </div>
                  <span className="text-[13px] transition-colors" style={{ color: checked ? "#F1F5F9" : "#64748B" }}>{u.name}</span>
                  <span className="ml-auto text-[11px]" style={{ color: "#334155" }}>{u.email}</span>
                </div>
              );
            })}
          </div>
        </Field>

        <div className="mb-4 flex gap-2.5">
          <button onClick={() => onSave({ name: name.trim() || proj.name, color, members })}
            className="flex-1 cursor-pointer rounded-lg border-none py-2.5 text-sm font-bold text-white" style={{ background: color }}>Salvar</button>
          <button onClick={onClose} className="flex-1 cursor-pointer rounded-lg border-none py-2.5 text-sm" style={{ background: "#1E293B", color: "#94A3B8" }}>Cancelar</button>
        </div>

        <div className="border-t pt-3.5" style={{ borderColor: "#1E293B" }}>
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)}
              className="w-full cursor-pointer rounded-lg border px-2 py-2 text-xs transition-colors hover:!bg-[#450A0A] hover:!text-[#FCA5A5]"
              style={{ background: "transparent", borderColor: "#450A0A", color: "#7F1D1D" }}>Excluir projeto</button>
          ) : (
            <div className="rounded-[10px] border p-3.5" style={{ background: "#1A0A0A", borderColor: "#7F1D1D" }}>
              <p className="mb-3 text-center text-xs leading-relaxed" style={{ color: "#FCA5A5" }}>
                Tem certeza? Excluir <strong>"{proj.name}"</strong> é irreversível.
              </p>
              <div className="flex gap-2">
                <button onClick={onDelete} className="flex-1 cursor-pointer rounded-lg border-none py-2 text-[13px] font-bold" style={{ background: "#7F1D1D", color: "#FCA5A5" }}>Sim, excluir</button>
                <button onClick={() => setConfirmDelete(false)} className="flex-1 cursor-pointer rounded-lg border-none py-2 text-[13px]" style={{ background: "#1E293B", color: "#94A3B8" }}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

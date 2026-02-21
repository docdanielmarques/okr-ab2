import type { ReactNode } from "react";

interface ModalProps {
  title: string;
  borderColor?: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, borderColor = "#334155", onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "#00000088" }}>
      <div className="w-[90%] min-w-[360px] max-w-[440px] rounded-2xl border p-7" style={{ background: "#0F172A", borderColor }}>
        <h3 className="mb-5 text-base font-bold" style={{ color: "#F1F5F9" }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  children: ReactNode;
}

export function Field({ label, children }: FieldProps) {
  return (
    <div className="mb-3.5">
      <label className="mb-1.5 block text-xs" style={{ color: "#64748B" }}>{label}</label>
      {children}
    </div>
  );
}

interface BtnRowProps {
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
  saveColor?: string;
}

export function BtnRow({ onSave, onCancel, saveLabel = "Salvar", saveColor = "#3B82F6" }: BtnRowProps) {
  return (
    <div className="mt-4 flex gap-2.5">
      <button onClick={onSave} className="flex-1 cursor-pointer rounded-lg border-none py-2.5 text-sm font-bold text-white" style={{ background: saveColor }}>
        {saveLabel}
      </button>
      <button onClick={onCancel} className="flex-1 cursor-pointer rounded-lg border-none py-2.5 text-sm" style={{ background: "#1E293B", color: "#94A3B8" }}>
        Cancelar
      </button>
    </div>
  );
}

export const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  background: "#1E293B",
  border: "1px solid #334155",
  color: "#F1F5F9",
  padding: "12px 14px",
  borderRadius: 8,
  fontSize: 14,
  boxSizing: "border-box" as const,
  outline: "none",
};

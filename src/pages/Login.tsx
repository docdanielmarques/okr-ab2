import { useState } from "react";
import { USERS } from "@/lib/data";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const [email, setEmail] = useState("admin@ab2l.com.br");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handle = () => {
    const u = USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (u) {
      setError("");
      login(u);
    } else {
      setError("E-mail não encontrado.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "#020617" }}>
      <div className="w-full max-w-[380px] rounded-[20px] border p-10" style={{ background: "#0F172A", borderColor: "#1E293B" }}>
        <div className="mb-8 text-center">
          <div className="mb-2 text-[11px] uppercase tracking-[3px]" style={{ color: "#64748B" }}>AB2L</div>
          <div className="mb-1.5 text-[22px] font-extrabold" style={{ color: "#F1F5F9" }}>Dashboard OKR</div>
          <div className="text-[13px]" style={{ color: "#64748B" }}>Entre com seu e-mail institucional</div>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs" style={{ color: "#64748B" }}>E-mail</label>
          <input
            type="email"
            placeholder="seu@ab2l.com.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handle()}
            className="w-full rounded-[10px] border px-3.5 py-3 text-sm outline-none"
            style={{
              background: "#1E293B",
              borderColor: error ? "#EF4444" : "#334155",
              color: "#F1F5F9",
            }}
          />
          {error && <div className="mt-1.5 text-xs" style={{ color: "#EF4444" }}>{error}</div>}
        </div>

        <button
          onClick={handle}
          className="w-full rounded-[10px] border-none py-3 text-[15px] font-bold text-white cursor-pointer"
          style={{ background: "#3B82F6" }}
        >
          Entrar
        </button>

        <div className="mt-6 rounded-[10px] p-3.5" style={{ background: "#1E293B" }}>
          <div className="mb-2 text-[11px] font-semibold" style={{ color: "#64748B" }}>EXEMPLOS FICTÍCIOS</div>
          {USERS.map((u) => (
            <div key={u.email} className="mb-0.5 text-[11px]" style={{ color: "#475569" }}>{u.email}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

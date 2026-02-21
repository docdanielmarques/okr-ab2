const { useState, useEffect } = React;

const USERS = [
  { email: "ana@ab2l.com.br",   name: "Ana Lima",    isAdmin: false },
  { email: "bruno@ab2l.com.br", name: "Bruno Melo",  isAdmin: false },
  { email: "carla@ab2l.com.br", name: "Carla Nunes", isAdmin: false },
  { email: "diego@ab2l.com.br", name: "Diego Ramos", isAdmin: false },
  { email: "admin@ab2l.com.br", name: "Admin",        isAdmin: true  },
];

const NON_ADMIN_USERS = USERS.filter(u => !u.isAdmin);

const getToolName = (url = "") => {
  if (url.includes("docs.google.com/spreadsheets")) return "Google Sheets";
  if (url.includes("trello.com")) return "Trello";
  if (url.includes("notion.so")) return "Notion";
  if (url.includes("drive.google.com")) return "Google Drive";
  return "Link externo";
};
const getToolIcon = (url = "") => {
  if (url.includes("docs.google.com/spreadsheets")) return "📊";
  if (url.includes("trello.com")) return "📋";
  if (url.includes("notion.so")) return "📝";
  if (url.includes("drive.google.com")) return "📁";
  return "🔗";
};
const fmtDate  = (iso) => { try { return new Date(iso).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric"}); } catch { return iso; } };
const fmtShort = (iso) => { try { return new Date(iso+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"}); } catch { return iso; } };
const todayStr = () => new Date().toISOString().split("T")[0];

const SUMMIT_OBJ_TITLE = "Consolidar presença internacional da AB2L";
const SUMMIT_KR_TEMPLATES = [
  { title: "Levar executivos brasileiros",      unit: "executivos", target: 30 },
  { title: "Firmar parcerias internacionais",   unit: "parcerias",  target: 5  },
  { title: "Confirmar speakers internacionais", unit: "speakers",   target: 10 },
];
const makeSummitKRs = (currents, base) => SUMMIT_KR_TEMPLATES.map((t,i) => ({ id: base+i, title: t.title, current: currents[i]||0, target: t.target, unit: t.unit, logs:[], linkLogs:[] }));

const ESQUENTA_OBJ_TITLE = "Gerar engajamento pré-evento LEX 26";
const ESQUENTA_KR_TEMPLATES = [
  { title: "Participantes no evento",   unit: "participantes", target: 100 },
  { title: "Leads gerados para LEX 26", unit: "leads",         target: 50  },
];
const makeEsquentaKRs = (currents, base) => ESQUENTA_KR_TEMPLATES.map((t,i) => ({ id: base+i, title: t.title, current: currents[i]||0, target: t.target, unit: t.unit, logs:[], linkLogs:[] }));

const DEFAULT_SUMMITS = [
  { id:"s1", name:"New York Summit",   objectives:[{ id:"so1", title:SUMMIT_OBJ_TITLE, krs:makeSummitKRs([12,1,4],1700) }] },
  { id:"s2", name:"Lisboa Summit",     objectives:[{ id:"so2", title:SUMMIT_OBJ_TITLE, krs:makeSummitKRs([5,0,2], 1710) }] },
  { id:"s3", name:"London Summit",     objectives:[{ id:"so3", title:SUMMIT_OBJ_TITLE, krs:makeSummitKRs([8,1,3], 1720) }] },
  { id:"s4", name:"Singapura Summit",  objectives:[{ id:"so4", title:SUMMIT_OBJ_TITLE, krs:makeSummitKRs([3,0,1], 1730) }] },
];

const DEFAULT_ESQUENTAS = [
  { id:"e1", name:"São Paulo, SP",      date:"2026-03-11", objectives:[{ id:"eo1", title:ESQUENTA_OBJ_TITLE, krs:makeEsquentaKRs([0,0],2100) }] },
  { id:"e2", name:"Salvador, BA",       date:"2026-03-26", objectives:[{ id:"eo2", title:ESQUENTA_OBJ_TITLE, krs:makeEsquentaKRs([0,0],2110) }] },
  { id:"e3", name:"Joinville, SC",      date:"2026-04-08", objectives:[{ id:"eo3", title:ESQUENTA_OBJ_TITLE, krs:makeEsquentaKRs([0,0],2120) }] },
  { id:"e4", name:"Florianópolis, SC",  date:"2026-04-09", objectives:[{ id:"eo4", title:ESQUENTA_OBJ_TITLE, krs:makeEsquentaKRs([0,0],2130) }] },
  { id:"e5", name:"Pinheiros, SP",      date:"2026-04-10", objectives:[{ id:"eo5", title:ESQUENTA_OBJ_TITLE, krs:makeEsquentaKRs([0,0],2140) }] },
  { id:"e6", name:"Santos, SP",         date:"2026-04-14", objectives:[{ id:"eo6", title:ESQUENTA_OBJ_TITLE, krs:makeEsquentaKRs([0,0],2150) }] },
  { id:"e7", name:"Belo Horizonte, MG", date:"2026-04-14", objectives:[{ id:"eo7", title:ESQUENTA_OBJ_TITLE, krs:makeEsquentaKRs([0,0],2160) }] },
  { id:"e8", name:"Rio de Janeiro, RJ", date:"2026-04-16", objectives:[{ id:"eo8", title:ESQUENTA_OBJ_TITLE, krs:makeEsquentaKRs([0,0],2170) }] },
];

const DEFAULT_GROUP_LABELS = {
  summits: "Summits Internacionais",
  esquentas: "Esquenta 26",
};

const DEFAULT_GROUP_PARENTS = {
  summits: { id:"gp-summits", name:"Projeto-mãe Summits", objectives:[] },
  esquentas:{ id:"gp-esquentas", name:"Projeto-mãe Esquenta", objectives:[] },
};

const DEFAULT_PROJECTS = [
  { id:1, type:"normal", name:"AB2L LEX 26", color:"#3B82F6", members:["Ana Lima"], children:[], objectives:[
    { id:1, title:"Consolidar o maior evento de legaltech do Brasil", krs:[
      { id:1, title:"Confirmar 50 expositores",  current:18,  target:50,   unit:"expositores",   logs:[], linkLogs:[] },
      { id:2, title:"Alcançar 3.000 inscritos",  current:850, target:3000, unit:"inscritos",     logs:[], linkLogs:[] },
      { id:3, title:"Fechar 20 patrocinadores",  current:7,   target:20,   unit:"patrocinadores",logs:[], linkLogs:[] },
    ]},
    { id:2, title:"Garantir excelência na experiência", krs:[
      { id:4, title:"NPS acima de 80",           current:0,  target:80, unit:"NPS",         logs:[], linkLogs:[] },
      { id:5, title:"Confirmar 30 palestrantes", current:12, target:30, unit:"palestrantes", logs:[], linkLogs:[] },
    ]}
  ]},
  { id:2, type:"normal", name:"Captação de Mantenedores", color:"#10B981", members:["Bruno Melo"], children:[], objectives:[
    { id:3, title:"Expandir base de escritórios mantenedores", krs:[
      { id:6, title:"Assinar 15 novos contratos R$100k+", current:4, target:15, unit:"contratos",
        logs:[
          { date:"2026-02-18", user:"Bruno Melo", from:3, to:4, note:"Fechamos Machado Meyer e Mattos Filho" },
          { date:"2026-02-13", user:"Bruno Melo", from:2, to:3, note:"" },
          { date:"2026-02-05", user:"Bruno Melo", from:1, to:2, note:"Primeiro contrato — Pinheiro Neto" },
        ],
        link:"https://docs.google.com/spreadsheets/example",
        linkLogs:[{ date:"2026-02-10", user:"Admin", oldLink:null, newLink:"https://docs.google.com/spreadsheets/example" }]
      },
      { id:7, title:"Realizar 60 reuniões de prospecção", current:22, target:60, unit:"reuniões", logs:[], link:"https://trello.com/example", linkLogs:[{ date:"2026-02-12", user:"Bruno Melo", oldLink:null, newLink:"https://trello.com/example" }] },
      { id:8, title:"Converter 30% dos leads qualificados", current:18, target:30, unit:"%", logs:[], linkLogs:[] },
    ]}
  ]},
  { id:3, type:"normal", name:"Hub / Coworking", color:"#8B5CF6", members:["Carla Nunes"], children:[], objectives:[
    { id:4, title:"Atingir ocupação plena do hub", krs:[
      { id:9,  title:"Ocupar 80% das estações de trabalho", current:45, target:80, unit:"%",         logs:[], linkLogs:[] },
      { id:10, title:"Fechar 10 contratos mensais",         current:3,  target:10, unit:"contratos", logs:[], linkLogs:[] },
    ]}
  ]},
  { id:4, type:"normal", name:"Certificações", color:"#F59E0B", members:["Carla Nunes"], children:[], objectives:[
    { id:5, title:"Lançar e escalar programa de certificações", krs:[
      { id:11, title:"Certificar 200 profissionais",     current:60, target:200, unit:"profissionais", logs:[], linkLogs:[] },
      { id:12, title:"Lançar 3 trilhas de certificação", current:1,  target:3,   unit:"trilhas",       logs:[], linkLogs:[] },
      { id:13, title:"NPS do curso acima de 75",         current:0,  target:75,  unit:"NPS",           logs:[], linkLogs:[] },
    ]}
  ]},
  { id:7, type:"normal", name:"Imersão China", color:"#F97316", members:["Diego Ramos"], children:[], objectives:[
    { id:8, title:"Estruturar missão de inovação à China", krs:[
      { id:20, title:"Confirmar 20 participantes",                  current:6, target:20, unit:"participantes", logs:[], linkLogs:[] },
      { id:21, title:"Agendar visitas em 8 empresas de tech",       current:2, target:8,  unit:"visitas",       logs:[], linkLogs:[] },
      { id:22, title:"Fechar parceria com 2 instituições chinesas", current:0, target:2,  unit:"parcerias",     logs:[], linkLogs:[] },
    ]}
  ]},
];

const getStatus = (p) => {
  if (p>=70) return {label:"On Track", color:"#10B981", bg:"#064E3B"};
  if (p>=40) return {label:"At Risk",  color:"#F59E0B", bg:"#451A03"};
  return           {label:"Off Track", color:"#EF4444", bg:"#450A0A"};
};
const pct      = (c,t) => t===0 ? 0 : Math.min(100, Math.round((c/t)*100));
const avgPct   = (arr) => arr.length===0 ? 0 : Math.round(arr.reduce((a,v)=>a+v,0)/arr.length);
const calcObj  = (obj)  => avgPct(obj.krs.map(kr=>pct(kr.current,kr.target)));
const getProjectObjectives = (proj) => [
  ...(proj.objectives||[]),
  ...((proj.children||[]).flatMap(c=>c.objectives||[])),
];
const getProjectKRCount = (proj) => getProjectObjectives(proj).reduce((a,o)=>a+(o.krs||[]).length,0);
const calcProj = (proj) => avgPct(getProjectObjectives(proj).map(calcObj));
const calcGroupAgg = (items, templates) => templates.map(t => {
  const m = items.flatMap(s=>s.objectives.flatMap(o=>o.krs)).filter(k=>k.title===t.title);
  return { title:t.title, unit:t.unit, current:m.reduce((a,k)=>a+k.current,0), target:m.reduce((a,k)=>a+k.target,0) };
});
const calcGroupPct = (items, templates) => avgPct(calcGroupAgg(items,templates).map(kr=>pct(kr.current,kr.target)));

// ─── Shared UI primitives ────────────────────────────────────────────────────

function ProgressBar({value,color,height=8}){
  return <div style={{background:"#1E293B",borderRadius:99,height,overflow:"hidden",width:"100%"}}>
    <div style={{width:`${value}%`,background:color,height:"100%",borderRadius:99,transition:"width 0.5s"}}/>
  </div>;
}

function LogBtn({label,count,open,onClick}){
  return <button onClick={onClick} style={{background:"none",border:"1px solid #1E293B",color:"#334155",borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap"}}>
    {label} ({count}) {open?"▲":"▼"}
  </button>;
}

const INPUT_STYLE = {width:"100%",background:"#1E293B",border:"1px solid #334155",color:"#F1F5F9",padding:"12px 14px",borderRadius:8,fontSize:14,boxSizing:"border-box"};

function Field({label,children}){
  return <div style={{marginBottom:14}}>
    <label style={{fontSize:12,color:"#64748B",display:"block",marginBottom:6}}>{label}</label>
    {children}
  </div>;
}

function BtnRow({onSave,onCancel,saveLabel="Salvar",saveColor="#3B82F6"}){
  return (
    <div style={{display:"flex",gap:10,marginTop:16}}>
      <button onClick={onSave} style={{flex:1,background:saveColor,border:"none",color:"#fff",padding:"10px",borderRadius:8,fontWeight:700,cursor:"pointer"}}>{saveLabel}</button>
      <button onClick={onCancel} style={{flex:1,background:"#1E293B",border:"none",color:"#94A3B8",padding:"10px",borderRadius:8,cursor:"pointer"}}>Cancelar</button>
    </div>
  );
}

function Modal({title,borderColor="#334155",onClose,children}){
  return (
    <div style={{position:"fixed",inset:0,background:"#00000088",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}>
      <div style={{background:"#0F172A",border:`1px solid ${borderColor}`,borderRadius:16,padding:28,minWidth:360,maxWidth:440,width:"90%"}}>
        <h3 style={{margin:"0 0 20px",color:"#F1F5F9"}}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

// ─── KR Row ──────────────────────────────────────────────────────────────────

function KRRow({kr,color,canEdit,canEditLink,canConfigKR,onUpdate,onConfig,onEditLink}){
  const [openKR,setOpenKR]     = useState(false);
  const [openLink,setOpenLink] = useState(false);
  const p=pct(kr.current,kr.target), st=getStatus(p);
  const logs=kr.logs||[], linkLogs=kr.linkLogs||[];
  return (
    <div style={{padding:"12px 0",borderBottom:"1px solid #1E293B"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <div style={{display:"flex",alignItems:"center",gap:6,flex:1,marginRight:12}}>
          <span style={{fontSize:13,color:"#CBD5E1"}}>{kr.title}</span>
          {canEdit&&(
            <button
              onClick={()=>onUpdate(kr)}
              title="Atualizar KR"
              onMouseEnter={e=>e.currentTarget.style.color="#64748B"}
              onMouseLeave={e=>e.currentTarget.style.color="#475569"}
              style={{background:"none",border:"none",color:"#475569",fontSize:14,cursor:"pointer",padding:"1px 3px",lineHeight:1}}>
              ↻
            </button>
          )}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <span style={{fontSize:11,color:st.color,background:st.bg,padding:"2px 8px",borderRadius:99}}>{st.label}</span>
          <span style={{fontSize:12,color:"#F1F5F9",minWidth:80,textAlign:"right"}}>{kr.current}/{kr.target} {kr.unit}</span>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:80}}><ProgressBar value={p} color={color}/></div>
        <span style={{fontSize:12,color,minWidth:32,textAlign:"right",fontWeight:700}}>{p}%</span>
        {kr.link
          ? <a href={kr.link} target="_blank" rel="noopener noreferrer" title={`${getToolName(kr.link)}: ${kr.link}`}
              style={{background:"#1E293B",border:"1px solid #334155",borderRadius:6,padding:"2px 8px",fontSize:12,textDecoration:"none"}}>🔗</a>
          : canEditLink && <button onClick={()=>onEditLink(kr)} style={{background:"#1E293B",border:"1px dashed #334155",color:"#475569",borderRadius:6,padding:"2px 8px",fontSize:11,cursor:"pointer"}}>+ link</button>
        }
        {canEditLink&&kr.link&&(
          <button
            onClick={()=>onEditLink(kr)}
            title="Editar configurações do link deste KR"
            aria-label="Editar configurações do link deste KR"
            onMouseEnter={e=>e.currentTarget.style.color="#64748B"}
            onMouseLeave={e=>e.currentTarget.style.color="#475569"}
            style={{background:"none",border:"none",color:"#475569",fontSize:14,cursor:"pointer",padding:"2px 4px",lineHeight:1}}>
            ⚙
          </button>
        )}
        {canConfigKR&&(
          <button
            onClick={()=>onConfig(kr)}
            title="Editar configurações deste KR"
            aria-label="Editar configurações deste KR"
            onMouseEnter={e=>e.currentTarget.style.color="#64748B"}
            onMouseLeave={e=>e.currentTarget.style.color="#475569"}
            style={{background:"none",border:"none",color:"#475569",fontSize:15,cursor:"pointer",padding:"2px 4px",lineHeight:1}}>
            ⚙
          </button>
        )}
        <div style={{display:"flex",gap:4}}>
          <LogBtn label="Log KR"   count={logs.length}     open={openKR}   onClick={()=>{setOpenKR(v=>!v);setOpenLink(false);}}/>
          <LogBtn label="Log Link" count={linkLogs.length} open={openLink} onClick={()=>{setOpenLink(v=>!v);setOpenKR(false);}}/>
        </div>
      </div>
      {openKR&&(
        <div style={{marginTop:8,background:"#0A1628",borderRadius:10,border:`1px solid ${color}33`,overflow:"hidden"}}>
          {!logs.length
            ? <div style={{padding:"10px 14px",fontSize:12,color:"#475569"}}>Nenhuma atualização registrada.</div>
            : logs.map((log,i)=>(
              <div key={i} style={{padding:"10px 14px",borderBottom:i<logs.length-1?`1px solid ${color}22`:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <span style={{fontSize:12,fontWeight:600,color}}>{log.user}</span>
                  <span style={{fontSize:11,color:"#475569"}}>· {fmtDate(log.date)}</span>
                  <span style={{marginLeft:"auto",fontSize:12,background:"#1E293B",borderRadius:6,padding:"2px 8px"}}>
                    <span style={{color:"#EF4444"}}>{log.from}</span><span style={{color:"#475569"}}> → </span><span style={{color:"#10B981"}}>{log.to}</span>
                  </span>
                </div>
                {log.note&&<div style={{fontSize:12,color:"#64748B",fontStyle:"italic",marginTop:4}}>"{log.note}"</div>}
              </div>
            ))
          }
        </div>
      )}
      {openLink&&(
        <div style={{marginTop:8,background:"#0A1628",borderRadius:10,border:"1px solid #06B6D433",overflow:"hidden"}}>
          {!linkLogs.length
            ? <div style={{padding:"10px 14px",fontSize:12,color:"#475569"}}>Nenhuma alteração de link registrada.</div>
            : linkLogs.map((l,i)=>(
              <div key={i} style={{padding:"10px 14px",borderBottom:i<linkLogs.length-1?"1px solid #06B6D422":"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{fontSize:12,fontWeight:600,color:"#06B6D4"}}>{l.user}</span>
                  <span style={{fontSize:11,color:"#475569"}}>· {fmtDate(l.date)}</span>
                </div>
                <div style={{fontSize:11,color:"#475569",marginBottom:2}}>
                  Novo: <a href={l.newLink||""} target="_blank" rel="noopener noreferrer" style={{color:"#06B6D4",textDecoration:"underline"}}>{l.newLink?(l.newLink.length>50?l.newLink.slice(0,50)+"…":l.newLink):"—"}</a>
                </div>
                {l.oldLink
                  ? <div style={{fontSize:11,color:"#475569"}}>Anterior: <a href={l.oldLink} target="_blank" rel="noopener noreferrer" style={{color:"#475569",textDecoration:"underline"}}>{l.oldLink.length>50?l.oldLink.slice(0,50)+"…":l.oldLink}</a></div>
                  : <div style={{fontSize:11,color:"#334155"}}>Primeiro link adicionado</div>
                }
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

// ─── Objective Block ─────────────────────────────────────────────────────────

function ObjectiveBlock({obj,color,canEdit,canEditLink,canConfigKR,onUpdateKR,onConfigKR,onEditLink,onEditObjective,onAddKR}){
  const op=calcObj(obj), st=getStatus(op);
  return (
    <div style={{background:"#0F172A",border:"1px solid #1E293B",borderRadius:14,padding:20,marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div style={{flex:1}}>
          <div style={{fontSize:12,color:"#64748B",marginBottom:2}}>OBJETIVO</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{fontWeight:700,color:"#F1F5F9",fontSize:15}}>{obj.title}</div>
            {canEdit&&(
              <button
                onClick={()=>onEditObjective(obj)}
                title="Editar configurações deste objetivo"
                aria-label="Editar configurações deste objetivo"
                onMouseEnter={e=>e.currentTarget.style.color="#64748B"}
                onMouseLeave={e=>e.currentTarget.style.color="#475569"}
                style={{background:"none",border:"none",color:"#475569",fontSize:15,cursor:"pointer",padding:"2px 4px",lineHeight:1}}>
                ⚙
              </button>
            )}
          </div>
        </div>
        <div style={{textAlign:"right",marginLeft:12}}>
          <div style={{fontSize:22,fontWeight:800,color}}>{op}%</div>
          <div style={{fontSize:11,color:st.color}}>{st.label}</div>
        </div>
      </div>
      <ProgressBar value={op} color={color} height={6}/>
      <div style={{marginTop:16}}>
        {obj.krs.map(kr=><KRRow key={kr.id} kr={kr} color={color} canEdit={canEdit} canEditLink={canEditLink} canConfigKR={canConfigKR} onUpdate={onUpdateKR} onConfig={onConfigKR} onEditLink={onEditLink}/>)}
      </div>
      {canEdit&&onAddKR&&(
        <button onClick={()=>onAddKR(obj.id)}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="#475569";e.currentTarget.style.color="#64748B";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="#1E293B";e.currentTarget.style.color="#334155";}}
          style={{marginTop:12,width:"100%",background:"none",border:"1px dashed #1E293B",color:"#334155",
            borderRadius:8,padding:"7px",fontSize:12,cursor:"pointer",transition:"all 0.15s",
            display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <span style={{fontSize:14,lineHeight:1}}>+</span> Novo KR
        </button>
      )}
    </div>
  );
}

// ─── Project Settings Modal ───────────────────────────────────────────────────

const PALETTE = ["#3B82F6","#10B981","#8B5CF6","#F59E0B","#EF4444","#F97316","#06B6D4","#EC4899","#84CC16","#6366F1"];

function ProjectSettingsModal({proj, onSave, onDelete, onClose}){
  const [name,    setName]    = useState(proj.name);
  const [color,   setColor]   = useState(proj.color);
  const [members, setMembers] = useState(proj.members || []);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggle = (n) => setMembers(prev => prev.includes(n) ? prev.filter(x=>x!==n) : [...prev,n]);

  return (
    <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}>
      <div style={{background:"#0F172A",border:"1px solid #1E293B",borderRadius:16,padding:28,minWidth:360,maxWidth:440,width:"90%",maxHeight:"90vh",overflowY:"auto"}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h3 style={{margin:0,color:"#F1F5F9",fontSize:16,fontWeight:700}}>Configurações do projeto</h3>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#475569",fontSize:20,cursor:"pointer",lineHeight:1,padding:"0 2px"}}>×</button>
        </div>

        {/* Nome */}
        <Field label="Nome">
          <input type="text" value={name} onChange={e=>setName(e.target.value)} style={INPUT_STYLE}/>
        </Field>

        {/* Cor */}
        <Field label="Cor">
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {PALETTE.map(c=>(
              <div key={c} onClick={()=>setColor(c)} style={{
                width:26,height:26,borderRadius:"50%",background:c,cursor:"pointer",
                border:color===c?"3px solid #fff":"3px solid transparent",boxSizing:"border-box",
                transition:"transform 0.1s",transform:color===c?"scale(1.15)":"scale(1)"
              }}/>
            ))}
          </div>
        </Field>

        {/* Membros */}
        <Field label="Quem pode editar">
          <div style={{background:"#0A1628",borderRadius:10,border:"1px solid #1E293B",overflow:"hidden"}}>
            {NON_ADMIN_USERS.map((u,i)=>{
              const checked = members.includes(u.name);
              return (
                <div key={u.email} onClick={()=>toggle(u.name)}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer",
                    borderBottom:i<NON_ADMIN_USERS.length-1?"1px solid #1E293B":"none",
                    background:checked?"#0F2240":"transparent",transition:"background 0.15s"}}>
                  <div style={{
                    width:16,height:16,borderRadius:4,flexShrink:0,
                    background:checked?color:"transparent",
                    border:`2px solid ${checked?color:"#334155"}`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    transition:"all 0.15s"
                  }}>
                    {checked&&<span style={{fontSize:10,color:"#fff",lineHeight:1,fontWeight:700}}>✓</span>}
                  </div>
                  <span style={{fontSize:13,color:checked?"#F1F5F9":"#64748B",transition:"color 0.15s"}}>{u.name}</span>
                  <span style={{fontSize:11,color:"#334155",marginLeft:"auto"}}>{u.email}</span>
                </div>
              );
            })}
          </div>
        </Field>

        {/* Salvar / Cancelar */}
        <div style={{display:"flex",gap:10,marginBottom:16}}>
          <button onClick={()=>onSave({name:name.trim()||proj.name, color, members})}
            style={{flex:1,background:color,border:"none",color:"#fff",padding:"10px",borderRadius:8,fontWeight:700,cursor:"pointer"}}>
            Salvar
          </button>
          <button onClick={onClose}
            style={{flex:1,background:"#1E293B",border:"none",color:"#94A3B8",padding:"10px",borderRadius:8,cursor:"pointer"}}>
            Cancelar
          </button>
        </div>

        {/* Zona de perigo */}
        <div style={{borderTop:"1px solid #1E293B",paddingTop:14}}>
          {!confirmDelete
            ? <button onClick={()=>setConfirmDelete(true)}
                onMouseEnter={e=>{e.currentTarget.style.background="#450A0A";e.currentTarget.style.color="#FCA5A5";e.currentTarget.style.borderColor="#7F1D1D";}}
                onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#7F1D1D";e.currentTarget.style.borderColor="#450A0A";}}
                style={{width:"100%",background:"transparent",border:"1px solid #450A0A",color:"#7F1D1D",
                  padding:"8px",borderRadius:8,fontSize:12,cursor:"pointer",transition:"all 0.15s"}}>
                Excluir projeto
              </button>
            : <div style={{background:"#1A0A0A",border:"1px solid #7F1D1D",borderRadius:10,padding:"14px"}}>
                <p style={{fontSize:12,color:"#FCA5A5",margin:"0 0 12px",textAlign:"center",lineHeight:1.5}}>
                  Tem certeza? Excluir <strong>"{proj.name}"</strong> é irreversível.
                </p>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={onDelete}
                    style={{flex:1,background:"#7F1D1D",border:"none",color:"#FCA5A5",padding:"9px",borderRadius:8,fontWeight:700,cursor:"pointer",fontSize:13}}>
                    Sim, excluir
                  </button>
                  <button onClick={()=>setConfirmDelete(false)}
                    style={{flex:1,background:"#1E293B",border:"none",color:"#94A3B8",padding:"9px",borderRadius:8,cursor:"pointer",fontSize:13}}>
                    Cancelar
                  </button>
                </div>
              </div>
          }
        </div>

      </div>
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({proj, onClick, canEdit}){
  const p=calcProj(proj), st=getStatus(p);
  const totalKRs=getProjectKRCount(proj);
  const totalObjs=getProjectObjectives(proj).length;
  return (
    <div onClick={onClick}
        onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
        onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}
        style={{background:"#0F172A",border:`1px solid ${canEdit?proj.color+"55":"#1E293B"}`,borderRadius:14,padding:20,
          cursor:"pointer",position:"relative",overflow:"hidden",transition:"transform 0.2s",opacity:canEdit?1:0.7}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:canEdit?proj.color:"#334155",borderRadius:"14px 14px 0 0"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div style={{flex:1,paddingRight:24}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
              <div style={{fontWeight:700,color:"#F1F5F9",fontSize:15}}>{proj.name}</div>
              {canEdit&&<span style={{fontSize:10,background:proj.color+"22",color:proj.color,padding:"2px 7px",borderRadius:99,fontWeight:600}}>Você edita</span>}
              {proj.type==="multiprojeto"&&<span style={{fontSize:10,background:"#06B6D422",color:"#06B6D4",padding:"2px 7px",borderRadius:99,fontWeight:600}}>Multiprojeto</span>}
            </div>
            <div style={{fontSize:11,color:"#64748B"}}>{totalObjs} objetivo{totalObjs>1?"s":""} · {totalKRs} KRs</div>
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            <div style={{fontSize:26,fontWeight:800,color:proj.color}}>{p}%</div>
            <div style={{fontSize:11,color:st.color}}>{st.label}</div>
          </div>
        </div>
        <ProgressBar value={p} color={proj.color} height={6}/>
    </div>
  );
}

// ─── Group Card ───────────────────────────────────────────────────────────────

function GroupCard({name,items,templates,color,onClick,subtitle,canEdit=false,canConfig=false,onConfig=null,configTitle=""}){
  const p=calcGroupPct(items,templates), st=getStatus(p);
  return (
    <div onClick={onClick}
      onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
      onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}
      style={{background:"#0F172A",border:`1px solid ${color}55`,borderRadius:14,padding:20,cursor:"pointer",
        position:"relative",overflow:"hidden",transition:"transform 0.2s"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:color,borderRadius:"14px 14px 0 0"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
            <div style={{fontWeight:700,color:"#F1F5F9",fontSize:15}}>{name}</div>
            {canEdit&&<span style={{fontSize:10,background:color+"22",color,padding:"2px 7px",borderRadius:99,fontWeight:600}}>Você edita</span>}
          </div>
          <div style={{fontSize:11,color:"#64748B"}}>{subtitle}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:26,fontWeight:800,color}}>{p}%</div>
          <div style={{fontSize:11,color:st.color}}>{st.label}</div>
        </div>
      </div>
        <ProgressBar value={p} color={color} height={6}/>
      {canConfig&&onConfig&&(
        <button
          onClick={e=>{e.stopPropagation();onConfig();}}
          title={configTitle}
          aria-label={configTitle}
          onMouseEnter={e=>e.currentTarget.style.color="#64748B"}
          onMouseLeave={e=>e.currentTarget.style.color="#475569"}
          style={{position:"absolute",top:10,right:10,background:"none",border:"none",color:"#475569",fontSize:16,cursor:"pointer",padding:"4px 6px",lineHeight:1,textDecoration:"underline"}}>
          ⚙
        </button>
      )}
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────

function LoginScreen({onLogin}){
  const [email,setEmail]=useState("admin@ab2l.com.br"), [error,setError]=useState("");
  const handle=()=>{
    const u=USERS.find(u=>u.email.toLowerCase()===email.trim().toLowerCase());
    if(u){setError("");onLogin(u);}else setError("E-mail não encontrado.");
  };
  return (
    <div style={{minHeight:"100vh",background:"#020617",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Inter,sans-serif"}}>
      <div style={{background:"#0F172A",border:"1px solid #1E293B",borderRadius:20,padding:40,width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:11,color:"#64748B",letterSpacing:3,textTransform:"uppercase",marginBottom:8}}>AB2L</div>
          <div style={{fontSize:22,fontWeight:800,color:"#F1F5F9",marginBottom:6}}>Dashboard OKR</div>
          <div style={{fontSize:13,color:"#64748B"}}>Entre com seu e-mail institucional</div>
        </div>
        <div style={{marginBottom:16}}>
          <label style={{fontSize:12,color:"#64748B",display:"block",marginBottom:6}}>E-mail</label>
          <input type="email" placeholder="seu@ab2l.com.br" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()}
            style={{width:"100%",background:"#1E293B",border:`1px solid ${error?"#EF4444":"#334155"}`,color:"#F1F5F9",padding:"12px 14px",borderRadius:10,fontSize:14,boxSizing:"border-box",outline:"none"}}/>
          {error&&<div style={{fontSize:12,color:"#EF4444",marginTop:6}}>{error}</div>}
        </div>
        <button onClick={handle} style={{width:"100%",background:"#3B82F6",border:"none",color:"#fff",padding:"12px",borderRadius:10,fontWeight:700,cursor:"pointer",fontSize:15}}>Entrar</button>
        <div style={{marginTop:24,background:"#1E293B",borderRadius:10,padding:14}}>
          <div style={{fontSize:11,color:"#64748B",marginBottom:8,fontWeight:600}}>EXEMPLOS FICTÍCIOS</div>
          {USERS.map(u=><div key={u.email} style={{fontSize:11,color:"#475569",marginBottom:2}}>{u.email}</div>)}
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App(){
  const normalizeProject = (p) => ({
    ...p,
    type: p.type || "normal",
    children: (p.children || []).map(c => ({...c, objectives: c.objectives || []})),
    objectives: p.objectives || [],
  });

  const [user,setUser]           = useState(null);
  const [projects,setProjects]   = useState(null);
  const [summits,setSummits]     = useState(null);
  const [esquentas,setEsquentas] = useState(null);
  const [announcements,setAnnouncements] = useState([]);
  const [view,setView]           = useState("home");
  const [saving,setSaving]       = useState(false);
  const [lastSaved,setLastSaved] = useState(null);
  const [loading,setLoading]     = useState(true);

  // modals
  const [editingKR,setEditingKR]           = useState(null);
  const [krVals,setKrVals]                 = useState({});
  const [editingKRConfig,setEditingKRConfig] = useState(null);
  const [krConfigVals,setKrConfigVals]     = useState({title:"",target:"",unit:""});
  const [editingLink,setEditingLink]       = useState(null);
  const [newLink,setNewLink]               = useState("");
  const [editingObj,setEditingObj]         = useState(null);
  const [objTitle,setObjTitle]             = useState("");
  const [showAnnounce,setShowAnnounce]     = useState(false);
  const [announceText,setAnnounceText]     = useState("");
  const [addingSummit,setAddingSummit]     = useState(false);
  const [newSummitName,setNewSummitName]   = useState("");
  const [newSummitDate,setNewSummitDate]   = useState("");
  const [addingEsquenta,setAddingEsquenta] = useState(false);
  const [newEsquentaName,setNewEsquentaName] = useState("");
  const [newEsquentaDate,setNewEsquentaDate] = useState("");
  const [addingProject,setAddingProject]   = useState(false);
  const [newProjName,setNewProjName]       = useState("");
  const [newProjType,setNewProjType]       = useState("");
  const [newProjColor,setNewProjColor]     = useState("#3B82F6");
  const [newProjObjTitle,setNewProjObjTitle] = useState("");
  const [settingsProj,setSettingsProj]     = useState(null); // ← gear modal
  const [groupLabels,setGroupLabels]       = useState(DEFAULT_GROUP_LABELS);
  const [groupParents,setGroupParents]     = useState(DEFAULT_GROUP_PARENTS);
  const [settingsGroup,setSettingsGroup]   = useState(null); // "summits" | "esquentas"
  const [groupLabelInput,setGroupLabelInput] = useState("");
  const [settingsGroupItem,setSettingsGroupItem] = useState(null); // {type,id}
  const [groupItemName,setGroupItemName]   = useState("");
  const [groupItemDate,setGroupItemDate]   = useState("");
  // add objective
  const [addingObj,setAddingObj]           = useState(false); // adding to current proj
  const [newObjTitle,setNewObjTitle]       = useState("");
  // add KR
  const [addingKRToObj,setAddingKRToObj]   = useState(null); // obj.id target
  const [newKRVals,setNewKRVals]           = useState({title:"",target:"",unit:""});
  const [addingChildProject,setAddingChildProject] = useState(false);
  const [newChildProjectName,setNewChildProjectName] = useState("");

  useEffect(()=>{
    (async()=>{
      try{
        const r1=await window.storage.get("ab2l-okr-v2",true);       setProjects(r1?JSON.parse(r1.value).map(normalizeProject):DEFAULT_PROJECTS.map(normalizeProject));
        const r2=await window.storage.get("ab2l-summits-v2",true);   setSummits(r2?JSON.parse(r2.value):DEFAULT_SUMMITS);
        const r3=await window.storage.get("ab2l-ann-v1",true);       setAnnouncements(r3?JSON.parse(r3.value):[]);
        const r4=await window.storage.get("ab2l-esquentas-v1",true); setEsquentas(r4?JSON.parse(r4.value):DEFAULT_ESQUENTAS);
        const r5=await window.storage.get("ab2l-groups-v1",true);    setGroupLabels(r5?JSON.parse(r5.value):DEFAULT_GROUP_LABELS);
        const r6=await window.storage.get("ab2l-group-parents-v1",true); setGroupParents(r6?JSON.parse(r6.value):DEFAULT_GROUP_PARENTS);
      }catch{
        setProjects(DEFAULT_PROJECTS.map(normalizeProject)); setSummits(DEFAULT_SUMMITS);
        setAnnouncements([]); setEsquentas(DEFAULT_ESQUENTAS); setGroupLabels(DEFAULT_GROUP_LABELS); setGroupParents(DEFAULT_GROUP_PARENTS);
      }
      setLoading(false);
    })();
  },[]);

  const persist=async(p,s,a,e,g=null,gp=null)=>{
    setSaving(true);
    try{
      if(p!==null) await window.storage.set("ab2l-okr-v2",       JSON.stringify(p),true);
      if(s!==null) await window.storage.set("ab2l-summits-v2",   JSON.stringify(s),true);
      if(a!==null) await window.storage.set("ab2l-ann-v1",       JSON.stringify(a),true);
      if(e!==null) await window.storage.set("ab2l-esquentas-v1", JSON.stringify(e),true);
      if(g!==null) await window.storage.set("ab2l-groups-v1",    JSON.stringify(g),true);
      if(gp!==null) await window.storage.set("ab2l-group-parents-v1", JSON.stringify(gp),true);
      setLastSaved(new Date().toLocaleDateString("pt-BR"));
    }catch(err){console.error(err);}
    setSaving(false);
  };

  // Permissions read from proj.members — admin always has access
  const canEdit = (id) => {
    if(!user) return false;
    if(user.isAdmin) return true;
    const p = projects?.find(p=>p.id===id);
    return p ? (p.members||[]).includes(user.name) : false;
  };
  const canEditLink = (id) => user&&(user.isAdmin||canEdit(id));

  const applyKRs = fn => ({
    updP: projects.map(pr=>({
      ...pr,
      objectives:pr.objectives.map(o=>({...o,krs:fn(o.krs)})),
      children:(pr.children||[]).map(ch=>({...ch,objectives:(ch.objectives||[]).map(o=>({...o,krs:fn(o.krs)}))})),
    })),
    updS: summits.map(s=>({...s,objectives:s.objectives.map(o=>({...o,krs:fn(o.krs)}))})),
    updE: esquentas.map(e=>({...e,objectives:e.objectives.map(o=>({...o,krs:fn(o.krs)}))})),
    updGP: {
      summits: {...groupParents.summits, objectives:(groupParents.summits.objectives||[]).map(o=>({...o,krs:fn(o.krs)}))},
      esquentas:{...groupParents.esquentas, objectives:(groupParents.esquentas.objectives||[]).map(o=>({...o,krs:fn(o.krs)}))},
    },
  });

  const saveKR=async()=>{
    const newVal=Number(krVals.current);
    const log={date:todayStr(),user:user.name,from:0,to:newVal,note:krVals.note||""};
    const {updP,updS,updE,updGP}=applyKRs(krs=>krs.map(kr=>{
      if(kr.id!==editingKR) return kr;
      log.from=kr.current;
      return{...kr,current:newVal,target:Number(krVals.target),logs:[{...log},...(kr.logs||[])]};
    }));
    setProjects(updP);setSummits(updS);setEsquentas(updE);setGroupParents(updGP);setEditingKR(null);
    await persist(updP,updS,null,updE,null,updGP);
  };

  const saveLink=async()=>{
    const entry={date:todayStr(),user:user.name,oldLink:null,newLink};
    const {updP,updS,updE,updGP}=applyKRs(krs=>krs.map(kr=>{
      if(kr.id!==editingLink) return kr;
      entry.oldLink=kr.link||null;
      return{...kr,link:newLink,linkLogs:[{...entry},...(kr.linkLogs||[])]};
    }));
    setProjects(updP);setSummits(updS);setEsquentas(updE);setGroupParents(updGP);setEditingLink(null);
    await persist(updP,updS,null,updE,null,updGP);
  };

  const saveObjective=async()=>{
    const upd=items=>items.map(x=>({
      ...x,
      objectives:x.objectives.map(o=>o.id===editingObj?{...o,title:objTitle}:o),
      children:(x.children||[]).map(ch=>({...ch,objectives:(ch.objectives||[]).map(o=>o.id===editingObj?{...o,title:objTitle}:o)})),
    }));
    const updP=upd(projects),updS=upd(summits),updE=upd(esquentas);
    const updGP={
      summits:{...groupParents.summits,objectives:(groupParents.summits.objectives||[]).map(o=>o.id===editingObj?{...o,title:objTitle}:o)},
      esquentas:{...groupParents.esquentas,objectives:(groupParents.esquentas.objectives||[]).map(o=>o.id===editingObj?{...o,title:objTitle}:o)},
    };
    setProjects(updP);setSummits(updS);setEsquentas(updE);setGroupParents(updGP);setEditingObj(null);
    await persist(updP,updS,null,updE,null,updGP);
  };

  const deleteObjective=async()=>{
    if(!user?.isAdmin||editingObj===null) return;
    const ok=window.confirm("Tem certeza que deseja deletar este objetivo? Essa ação é irreversível.");
    if(!ok) return;
    const upd=items=>items.map(x=>({
      ...x,
      objectives:x.objectives.filter(o=>o.id!==editingObj),
      children:(x.children||[]).map(ch=>({...ch,objectives:(ch.objectives||[]).filter(o=>o.id!==editingObj)})),
    }));
    const updP=upd(projects),updS=upd(summits),updE=upd(esquentas);
    const updGP={
      summits:{...groupParents.summits,objectives:(groupParents.summits.objectives||[]).filter(o=>o.id!==editingObj)},
      esquentas:{...groupParents.esquentas,objectives:(groupParents.esquentas.objectives||[]).filter(o=>o.id!==editingObj)},
    };
    setProjects(updP);setSummits(updS);setEsquentas(updE);setGroupParents(updGP);setEditingObj(null);
    await persist(updP,updS,null,updE,null,updGP);
  };

  const saveKRConfig=async()=>{
    if(!user?.isAdmin||editingKRConfig===null) return;
    const {updP,updS,updE,updGP}=applyKRs(krs=>krs.map(kr=>kr.id===editingKRConfig
      ? {...kr,title:krConfigVals.title.trim()||kr.title,target:Number(krConfigVals.target),unit:krConfigVals.unit.trim()}
      : kr
    ));
    setProjects(updP);setSummits(updS);setEsquentas(updE);setGroupParents(updGP);setEditingKRConfig(null);
    await persist(updP,updS,null,updE,null,updGP);
  };

  const deleteKR=async()=>{
    if(!user?.isAdmin||editingKRConfig===null) return;
    const ok=window.confirm("Tem certeza que deseja deletar este KR? Essa ação é irreversível.");
    if(!ok) return;
    const {updP,updS,updE,updGP}=applyKRs(krs=>krs.filter(kr=>kr.id!==editingKRConfig));
    setProjects(updP);setSummits(updS);setEsquentas(updE);setGroupParents(updGP);setEditingKRConfig(null);
    await persist(updP,updS,null,updE,null,updGP);
  };

  const saveAnnouncement=async()=>{
    if(!announceText.trim()) return;
    const updated=[{id:Date.now(),text:announceText.trim(),date:todayStr(),user:user.name},...announcements];
    setAnnouncements(updated);setAnnounceText("");setShowAnnounce(false);
    await persist(null,null,updated,null);
  };
  const deleteAnnouncement=async id=>{
    const updated=announcements.filter(a=>a.id!==id);
    setAnnouncements(updated); await persist(null,null,updated,null);
  };

  const saveSummit=async()=>{
    if(!newSummitName.trim()) return;
    const base=Date.now();
    const updS=[...summits,{id:`s${base}`,name:newSummitName.trim(),date:newSummitDate||null,objectives:[{id:`so${base}`,title:SUMMIT_OBJ_TITLE,krs:makeSummitKRs([0,0,0],base+100)}]}];
    setSummits(updS);setAddingSummit(false);setNewSummitName("");setNewSummitDate("");
    await persist(null,updS,null,null);
  };

  const saveEsquenta=async()=>{
    if(!newEsquentaName.trim()) return;
    const base=Date.now();
    const updE=[...esquentas,{id:`e${base}`,name:newEsquentaName.trim(),date:newEsquentaDate||null,objectives:[{id:`eo${base}`,title:ESQUENTA_OBJ_TITLE,krs:makeEsquentaKRs([0,0],base+100)}]}];
    setEsquentas(updE);setAddingEsquenta(false);setNewEsquentaName("");setNewEsquentaDate("");
    await persist(null,null,null,updE);
  };

  const saveNewProject=async()=>{
    if(!newProjName.trim()||!newProjType) return;
    const base=Date.now();
    const newProj={id:base,type:newProjType,name:newProjName.trim(),color:newProjColor,members:[],children:[],
      objectives:[{id:base+1,title:newProjObjTitle.trim()||"Objetivo principal",krs:[]}]};
    const updP=[...projects,newProj];
    setProjects(updP);setAddingProject(false);setNewProjType("");setNewProjName("");setNewProjObjTitle("");setNewProjColor("#3B82F6");
    await persist(updP,null,null,null);
  };

  const saveProjectSettings=async({name,color,members})=>{
    const updP=projects.map(p=>p.id===settingsProj.id?{...p,name,color,members}:p);
    setProjects(updP);setSettingsProj(null);
    await persist(updP,null,null,null);
  };

  const deleteProject=async id=>{
    const updP=projects.filter(p=>p.id!==id);
    setProjects(updP);setSettingsProj(null);
    if(view===`project:${id}`) setView("home");
    await persist(updP,null,null,null);
  };

  const saveNewObjective=async()=>{
    if(!newObjTitle.trim()) return;
    const base=Date.now();
    const newObj={id:base,title:newObjTitle.trim(),krs:[]};
    if(proj){
      const updP=projects.map(p=>p.id===proj.id?{...p,objectives:[...p.objectives,newObj]}:p);
      setProjects(updP);
      setAddingObj(false);
      setNewObjTitle("");
      await persist(updP,null,null,null);
      return;
    }
    if(summit){
      const updS=summits.map(s=>s.id===summit.id?{...s,objectives:[...s.objectives,newObj]}:s);
      setSummits(updS);
      setAddingObj(false);
      setNewObjTitle("");
      await persist(null,updS,null,null);
      return;
    }
    if(esquenta){
      const updE=esquentas.map(e=>e.id===esquenta.id?{...e,objectives:[...e.objectives,newObj]}:e);
      setEsquentas(updE);
      setAddingObj(false);
      setNewObjTitle("");
      await persist(null,null,null,updE);
      return;
    }
    if(isSummits&&!summit){
      const updGP={...groupParents,summits:{...groupParents.summits,objectives:[...(groupParents.summits.objectives||[]),newObj]}};
      setGroupParents(updGP);
      setAddingObj(false);
      setNewObjTitle("");
      await persist(null,null,null,null,null,updGP);
      return;
    }
    if(isEsquentas&&!esquenta){
      const updGP={...groupParents,esquentas:{...groupParents.esquentas,objectives:[...(groupParents.esquentas.objectives||[]),newObj]}};
      setGroupParents(updGP);
      setAddingObj(false);
      setNewObjTitle("");
      await persist(null,null,null,null,null,updGP);
    }
  };

  const saveNewKR=async()=>{
    if(!newKRVals.title.trim()||!newKRVals.target) return;
    const base=Date.now();
    const newKR={id:base,title:newKRVals.title.trim(),current:0,target:Number(newKRVals.target),unit:newKRVals.unit.trim()||"",logs:[],linkLogs:[]};
    if(proj){
      const updP=projects.map(p=>p.id===proj.id
        ?{
          ...p,
          objectives:p.objectives.map(o=>o.id===addingKRToObj?{...o,krs:[...o.krs,newKR]}:o),
          children:(p.children||[]).map(ch=>({...ch,objectives:(ch.objectives||[]).map(o=>o.id===addingKRToObj?{...o,krs:[...o.krs,newKR]}:o)})),
        }
        :p);
      setProjects(updP);
      setAddingKRToObj(null);
      setNewKRVals({title:"",target:"",unit:""});
      await persist(updP,null,null,null);
      return;
    }
    if(summit){
      const updS=summits.map(s=>s.id===summit.id
        ?{...s,objectives:s.objectives.map(o=>o.id===addingKRToObj?{...o,krs:[...o.krs,newKR]}:o)}
        :s);
      setSummits(updS);
      setAddingKRToObj(null);
      setNewKRVals({title:"",target:"",unit:""});
      await persist(null,updS,null,null);
      return;
    }
    if(esquenta){
      const updE=esquentas.map(e=>e.id===esquenta.id
        ?{...e,objectives:e.objectives.map(o=>o.id===addingKRToObj?{...o,krs:[...o.krs,newKR]}:o)}
        :e);
      setEsquentas(updE);
      setAddingKRToObj(null);
      setNewKRVals({title:"",target:"",unit:""});
      await persist(null,null,null,updE);
      return;
    }
    if(isSummits&&!summit){
      const updGP={
        ...groupParents,
        summits:{
          ...groupParents.summits,
          objectives:(groupParents.summits.objectives||[]).map(o=>o.id===addingKRToObj?{...o,krs:[...o.krs,newKR]}:o),
        },
      };
      setGroupParents(updGP);
      setAddingKRToObj(null);
      setNewKRVals({title:"",target:"",unit:""});
      await persist(null,null,null,null,null,updGP);
      return;
    }
    if(isEsquentas&&!esquenta){
      const updGP={
        ...groupParents,
        esquentas:{
          ...groupParents.esquentas,
          objectives:(groupParents.esquentas.objectives||[]).map(o=>o.id===addingKRToObj?{...o,krs:[...o.krs,newKR]}:o),
        },
      };
      setGroupParents(updGP);
      setAddingKRToObj(null);
      setNewKRVals({title:"",target:"",unit:""});
      await persist(null,null,null,null,null,updGP);
    }
  };

  const saveNewChildProject=async()=>{
    if(!proj||proj.type!=="multiprojeto"||!newChildProjectName.trim()) return;
    const base=Date.now();
    const child={id:`cp-${base}`,name:newChildProjectName.trim(),objectives:[{id:base+1,title:"Objetivo principal",krs:[]}]};
    const updP=projects.map(p=>p.id===proj.id?{...p,children:[...(p.children||[]),child]}:p);
    setProjects(updP);
    setAddingChildProject(false);
    setNewChildProjectName("");
    await persist(updP,null,null,null);
  };

  const openGroupSettings = (type) => {
    setSettingsGroup(type);
    setGroupLabelInput(groupLabels[type] || "");
  };

  const saveGroupSettings = async() => {
    if(!settingsGroup || !groupLabelInput.trim()) return;
    const updG = {...groupLabels, [settingsGroup]: groupLabelInput.trim()};
    setGroupLabels(updG);
    setSettingsGroup(null);
    setGroupLabelInput("");
    await persist(null,null,null,null,updG);
  };

  const deleteGroupItems = async() => {
    if(!user?.isAdmin || !settingsGroup) return;
    const groupName = settingsGroup==="summits" ? "Summits" : "Esquenta";
    const ok = window.confirm(`Tem certeza que deseja deletar todos os itens de ${groupName}? Essa ação é irreversível.`);
    if(!ok) return;
    if(settingsGroup==="summits"){
      setSummits([]);
      if(view==="summits" || view.startsWith("summit:")) setView("home");
      await persist(null,[],null,null);
    }else{
      setEsquentas([]);
      if(view==="esquentas" || view.startsWith("esquenta:")) setView("home");
      await persist(null,null,null,[]);
    }
    setSettingsGroup(null);
    setGroupLabelInput("");
  };

  const openGroupItemSettings = (type, item) => {
    setSettingsGroupItem({type,id:item.id});
    setGroupItemName(item.name || "");
    setGroupItemDate(item.date || "");
  };

  const saveGroupItemSettings = async() => {
    if(!settingsGroupItem || !groupItemName.trim()) return;
    if(!groupItemDate){
      const okNoDate = window.confirm("Este item está sem data. Deseja salvar mesmo assim?");
      if(!okNoDate) return;
    }
    if(settingsGroupItem.type==="summit"){
      const updS = summits.map(s=>s.id===settingsGroupItem.id ? {...s,name:groupItemName.trim(),date:groupItemDate||null} : s);
      setSummits(updS);
      if(view===`summit:${settingsGroupItem.id}`) setView(`summit:${settingsGroupItem.id}`);
      await persist(null,updS,null,null);
    }else{
      const updE = esquentas.map(e=>e.id===settingsGroupItem.id ? {...e,name:groupItemName.trim(),date:groupItemDate||null} : e);
      setEsquentas(updE);
      if(view===`esquenta:${settingsGroupItem.id}`) setView(`esquenta:${settingsGroupItem.id}`);
      await persist(null,null,null,updE);
    }
    setSettingsGroupItem(null);
    setGroupItemName("");
    setGroupItemDate("");
  };

  const deleteGroupItem = async() => {
    if(!user?.isAdmin || !settingsGroupItem) return;
    const label = settingsGroupItem.type==="summit" ? "Summit" : "Esquenta";
    const ok = window.confirm(`Tem certeza que deseja deletar este ${label}? Essa ação é irreversível.`);
    if(!ok) return;
    if(settingsGroupItem.type==="summit"){
      const updS = summits.filter(s=>s.id!==settingsGroupItem.id);
      setSummits(updS);
      if(view===`summit:${settingsGroupItem.id}`) setView("summits");
      await persist(null,updS,null,null);
    }else{
      const updE = esquentas.filter(e=>e.id!==settingsGroupItem.id);
      setEsquentas(updE);
      if(view===`esquenta:${settingsGroupItem.id}`) setView("esquentas");
      await persist(null,null,null,updE);
    }
    setSettingsGroupItem(null);
    setGroupItemName("");
    setGroupItemDate("");
  };

  if(!user) return <LoginScreen onLogin={setUser}/>;
  if(loading) return (
    <div style={{minHeight:"100vh",background:"#020617",display:"flex",alignItems:"center",justifyContent:"center",color:"#64748B",fontFamily:"Inter,sans-serif"}}>
      <div style={{textAlign:"center"}}><div style={{fontSize:32,marginBottom:12}}>⟳</div><div>Carregando…</div></div>
    </div>
  );

  const isHome=view==="home", isSummits=view==="summits", isEsquentas=view==="esquentas";
  const proj     = view.startsWith("project:")  ? projects.find(p=>p.id===Number(view.split(":")[1])) : null;
  const summit   = view.startsWith("summit:")   ? summits.find(s=>s.id===view.split(":")[1]) : null;
  const esquenta = view.startsWith("esquenta:") ? esquentas.find(e=>e.id===view.split(":")[1]) : null;
  const goBack   = ()=>{ if(summit){setView("summits");return;} if(esquenta){setView("esquentas");return;} setView("home"); };

  const SUMMIT_COLOR="#06B6D4", ESQUENTA_COLOR="#EF4444";
  const sumAllObjectives = [...summits.flatMap(s=>s.objectives||[]), ...(groupParents.summits?.objectives||[])];
  const esquentaAllObjectives = [...esquentas.flatMap(e=>e.objectives||[]), ...(groupParents.esquentas?.objectives||[])];
  const summitsTotalPct = avgPct(sumAllObjectives.map(calcObj));
  const esquentasTotalPct = avgPct(esquentaAllObjectives.map(calcObj));
  const allPcts=[...projects.map(calcProj),summitsTotalPct,esquentasTotalPct];
  const globalPct=avgPct(allPcts);
  const onTrack =allPcts.filter(p=>getStatus(p).label==="On Track").length;
  const atRisk  =allPcts.filter(p=>getStatus(p).label==="At Risk").length;
  const offTrack=allPcts.filter(p=>getStatus(p).label==="Off Track").length;
  const totalKRs=projects.reduce((a,p)=>a+getProjectKRCount(p),0)
    +summits.reduce((a,s)=>a+s.objectives.reduce((b,o)=>b+o.krs.length,0),0)
    +esquentas.reduce((a,e)=>a+e.objectives.reduce((b,o)=>b+o.krs.length,0),0)
    +(groupParents.summits?.objectives||[]).reduce((a,o)=>a+o.krs.length,0)
    +(groupParents.esquentas?.objectives||[]).reduce((a,o)=>a+o.krs.length,0);

  const openKREdit  = kr  => { setEditingKR(kr.id);   setKrVals({current:kr.current,target:kr.target,note:""}); };
  const openKRConfig= kr  => { setEditingKRConfig(kr.id); setKrConfigVals({title:kr.title,target:kr.target,unit:kr.unit||""}); };
  const openLinkEdit= kr  => { setEditingLink(kr.id); setNewLink(kr.link||""); };
  const openObjEdit = obj => { setEditingObj(obj.id); setObjTitle(obj.title); };

  const renderGroupView=(items,templates,color,addLabel,onAdd,showDate,type)=>(
    <div>
      {(() => {
        const parentKey = type==="summit" ? "summits" : "esquentas";
        const parentObj = (groupParents[parentKey]?.objectives)||[];
        const allObjectives = [...items.flatMap(i=>i.objectives||[]), ...parentObj];
        const totalPct = avgPct(allObjectives.map(calcObj));
        return (
      <div style={{background:"#0F172A",border:`1px solid ${color}44`,borderRadius:14,padding:20,marginBottom:24}}>
        <div style={{display:"flex",alignItems:"center",gap:24,marginBottom:16}}>
          <div><div style={{fontSize:42,fontWeight:900,color}}>{totalPct}%</div><div style={{fontSize:13,color:"#64748B"}}>somatória geral</div></div>
          <div style={{flex:1}}>
            <ProgressBar value={totalPct} color={color} height={12}/>
            <div style={{fontSize:12,color:"#64748B",marginTop:8}}>{items.length} itens · KRs consolidados</div>
          </div>
        </div>
        <div style={{borderTop:"1px solid #1E293B",paddingTop:14}}>
          <div style={{fontSize:12,color:"#64748B",marginBottom:10,fontWeight:600,letterSpacing:1}}>SOMATÓRIA DOS KRs</div>
          {calcGroupAgg(items,templates).map((kr,i)=>{
            const p=pct(kr.current,kr.target),st=getStatus(p);
            return <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10,flexWrap:"wrap"}}>
              <span style={{fontSize:12,color:"#94A3B8",flex:1,minWidth:140}}>{kr.title}</span>
              <span style={{fontSize:11,color:st.color,background:st.bg,padding:"2px 8px",borderRadius:99,flexShrink:0}}>{st.label}</span>
              <span style={{fontSize:12,color:"#64748B",minWidth:90,textAlign:"right"}}>{kr.current}/{kr.target} {kr.unit}</span>
              <div style={{width:120,flexShrink:0}}><ProgressBar value={p} color={color} height={6}/></div>
              <span style={{fontSize:12,color,fontWeight:700,minWidth:32,textAlign:"right"}}>{p}%</span>
            </div>;
          })}
        </div>
        <div style={{borderTop:"1px solid #1E293B",paddingTop:14,marginTop:12}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div style={{fontSize:12,color:"#64748B",fontWeight:700,letterSpacing:1}}>OBJETIVOS DO MULTIPROJETO (PROJETO-MÃE)</div>
            {user.isAdmin&&(
              <button onClick={()=>setAddingObj(true)} style={{background:"none",border:"1px dashed #334155",color:"#475569",borderRadius:8,padding:"4px 10px",fontSize:12,cursor:"pointer"}}>
                + Novo Objetivo
              </button>
            )}
          </div>
          {parentObj.length===0
            ? <div style={{fontSize:12,color:"#475569"}}>Nenhum objetivo no projeto-mãe ainda.</div>
            : parentObj.map(obj=><ObjectiveBlock key={obj.id} obj={obj} color={color} canEdit={user.isAdmin} canEditLink={user.isAdmin} canConfigKR={user.isAdmin} onUpdateKR={openKREdit} onConfigKR={openKRConfig} onEditLink={openLinkEdit} onEditObjective={openObjEdit} onAddKR={user.isAdmin?setAddingKRToObj:null}/>)
          }
        </div>
      </div>
        );
      })()}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14}}>
        {items.map(item=>{
          const p=calcProj(item),st=getStatus(p);
          const viewKey=addLabel==="Novo Summit"?"summit":"esquenta";
          return <div key={item.id} onClick={()=>setView(`${viewKey}:${item.id}`)}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
            onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}
            style={{background:"#0F172A",border:`1px solid ${color}33`,borderRadius:12,padding:18,cursor:"pointer",
              position:"relative",overflow:"hidden",transition:"transform 0.2s"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:color,borderRadius:"12px 12px 0 0"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <div style={{fontWeight:700,color:"#F1F5F9",fontSize:14}}>{item.name}</div>
                {showDate&&item.date&&<div style={{fontSize:11,color:"#64748B",marginTop:2}}>📅 {fmtShort(item.date)}</div>}
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:22,fontWeight:800,color}}>{p}%</div>
                <div style={{fontSize:11,color:st.color}}>{st.label}</div>
              </div>
            </div>
            <ProgressBar value={p} color={color} height={5}/>
          </div>;
        })}
        {user.isAdmin&&<div onClick={onAdd}
          onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
          onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}
          style={{background:"#0F172A",border:"1px dashed #334155",borderRadius:12,padding:18,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"transform 0.2s"}}>
          <span style={{fontSize:20,color:"#334155"}}>+</span>
          <span style={{fontSize:13,color:"#475569"}}>{addLabel}</span>
        </div>}
      </div>
    </div>
  );

  const renderDetailHeader=(item,color)=>(
    <div style={{background:"#0F172A",border:`1px solid ${color}44`,borderRadius:14,padding:20,marginBottom:24,display:"flex",alignItems:"center",gap:24}}>
      <div><div style={{fontSize:42,fontWeight:900,color}}>{calcProj(item)}%</div><div style={{fontSize:13,color:"#64748B"}}>progresso geral</div></div>
      <div style={{flex:1}}><ProgressBar value={calcProj(item)} color={color} height={12}/></div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#020617",color:"#F1F5F9",fontFamily:"Inter,sans-serif",padding:24}}>

      {/* HEADER */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {!isHome&&<button onClick={goBack} style={{background:"#1E293B",border:"none",color:"#94A3B8",padding:"6px 12px",borderRadius:8,cursor:"pointer",fontSize:13}}>← Voltar</button>}
          <div>
            <div style={{fontSize:11,color:"#64748B",letterSpacing:2,textTransform:"uppercase"}}>AB2L</div>
            <h1 style={{margin:0,fontSize:22,fontWeight:800,color:"#F1F5F9"}}>
              {proj?proj.name:summit?summit.name:isSummits?groupLabels.summits:esquenta?`${esquenta.name}${esquenta.date?"  ·  📅 "+fmtShort(esquenta.date):""}`:isEsquentas?groupLabels.esquentas:"Dashboard OKR"}
            </h1>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
          {saving&&<span style={{fontSize:11,color:"#F59E0B"}}>● Salvando…</span>}
          {!saving&&lastSaved&&<span style={{fontSize:11,color:"#10B981"}}>● Salvo {lastSaved}</span>}
          {user.isAdmin&&summit&&<button onClick={()=>openGroupItemSettings("summit",summit)} title="Editar configurações deste summit" aria-label="Editar configurações deste summit" style={{background:"none",border:"none",color:"#475569",fontSize:16,cursor:"pointer",padding:"2px 4px",lineHeight:1,textDecoration:"underline"}}>⚙</button>}
          {user.isAdmin&&esquenta&&<button onClick={()=>openGroupItemSettings("esquenta",esquenta)} title="Editar configurações desta cidade de esquenta" aria-label="Editar configurações desta cidade de esquenta" style={{background:"none",border:"none",color:"#475569",fontSize:16,cursor:"pointer",padding:"2px 4px",lineHeight:1,textDecoration:"underline"}}>⚙</button>}
          {user.isAdmin&&isSummits&&<button onClick={()=>openGroupSettings("summits")} title="Editar configurações da área de summits" aria-label="Editar configurações da área de summits" style={{background:"none",border:"none",color:"#475569",fontSize:16,cursor:"pointer",padding:"2px 4px",lineHeight:1,textDecoration:"underline"}}>⚙</button>}
          {user.isAdmin&&isEsquentas&&<button onClick={()=>openGroupSettings("esquentas")} title="Editar configurações da área de esquentas" aria-label="Editar configurações da área de esquentas" style={{background:"none",border:"none",color:"#475569",fontSize:16,cursor:"pointer",padding:"2px 4px",lineHeight:1,textDecoration:"underline"}}>⚙</button>}
          {user.isAdmin&&<button onClick={()=>setShowAnnounce(true)} style={{background:"#7C3AED",border:"none",color:"#fff",padding:"6px 14px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600}}>📢 Aviso</button>}
          <div style={{background:"#0F172A",border:"1px solid #1E293B",borderRadius:8,padding:"6px 12px",fontSize:12,color:"#94A3B8",display:"flex",alignItems:"center",gap:6}}>
            👤 {user.name}{user.isAdmin&&<span style={{fontSize:10,background:"#3B82F622",color:"#3B82F6",padding:"1px 6px",borderRadius:99}}>Admin</span>}
          </div>
          <button onClick={()=>setUser(null)} style={{background:"#1E293B",border:"none",color:"#64748B",padding:"6px 12px",borderRadius:8,cursor:"pointer",fontSize:12}}>Sair</button>
        </div>
      </div>

      {/* ANNOUNCEMENTS */}
      {isHome&&announcements.length>0&&(
        <div style={{marginBottom:20}}>
          {announcements.map(a=>(
            <div key={a.id} style={{background:"#1E1040",border:"1px solid #7C3AED55",borderRadius:10,padding:"10px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:14}}>📢</span>
              <div style={{flex:1}}><span style={{fontSize:13,color:"#E2D9F3"}}>{a.text}</span><span style={{fontSize:11,color:"#64748B",marginLeft:10}}>{a.user} · {fmtDate(a.date)}</span></div>
              {user.isAdmin&&<button onClick={()=>deleteAnnouncement(a.id)} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:13}}>✕</button>}
            </div>
          ))}
        </div>
      )}

      {/* HOME */}
      {isHome&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:28}}>
            {[
              {label:"Progresso Global", value:`${globalPct}%`, color:"#3B82F6"},
              {label:"Projetos",         value:projects.length+2, color:"#8B5CF6"},
              {label:"Total de KRs",     value:totalKRs, color:"#06B6D4"},
              {label:"On Track",         value:onTrack,  color:"#10B981"},
              {label:"At Risk",          value:atRisk,   color:"#F59E0B"},
              {label:"Off Track",        value:offTrack, color:"#EF4444"},
            ].map((c,i)=>(
              <div key={i} style={{background:"#0F172A",border:`1px solid ${c.color}33`,borderRadius:12,padding:"16px 18px"}}>
                <div style={{fontSize:11,color:"#64748B",marginBottom:6}}>{c.label}</div>
                <div style={{fontSize:24,fontWeight:800,color:c.color}}>{c.value}</div>
              </div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
            {projects.map(p=>(
              <ProjectCard key={p.id} proj={p}
                onClick={()=>setView(`project:${p.id}`)}
                canEdit={canEdit(p.id)}
              />
            ))}
            <GroupCard name={groupLabels.summits} items={summits}   templates={SUMMIT_KR_TEMPLATES}   color={SUMMIT_COLOR}   onClick={()=>setView("summits")}   subtitle={`${summits.length} summits · KRs consolidados`} canEdit={user.isAdmin}/>
            <GroupCard name={groupLabels.esquentas} items={esquentas} templates={ESQUENTA_KR_TEMPLATES} color={ESQUENTA_COLOR} onClick={()=>setView("esquentas")} subtitle={`${esquentas.length} cidades · KRs consolidados`} canEdit={user.isAdmin||canEdit(5)}/>
            {user.isAdmin&&(
              <div onClick={()=>{setNewProjType("");setAddingProject(true);}}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}
                style={{background:"#0F172A",border:"1px dashed #334155",borderRadius:14,padding:20,cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:10,transition:"transform 0.2s",minHeight:100}}>
                <span style={{fontSize:24,color:"#334155"}}>+</span>
                <span style={{fontSize:14,color:"#475569"}}>Novo Projeto</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* PROJECT DETAIL */}
      {proj&&(
        <div>
          <div style={{background:"#0F172A",border:`1px solid ${proj.color}44`,borderRadius:14,padding:20,marginBottom:24,display:"flex",alignItems:"center",gap:24}}>
            <div><div style={{fontSize:42,fontWeight:900,color:proj.color}}>{calcProj(proj)}%</div><div style={{fontSize:13,color:"#64748B"}}>progresso geral</div></div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{flex:1}}>
                  <ProgressBar value={calcProj(proj)} color={proj.color} height={12}/>
                </div>
                {user.isAdmin&&(
                  <button
                    onClick={()=>setSettingsProj(proj)}
                    title="Editar configurações deste projeto"
                    aria-label="Editar configurações deste projeto"
                    onMouseEnter={e=>e.currentTarget.style.color="#64748B"}
                    onMouseLeave={e=>e.currentTarget.style.color="#334155"}
                    style={{background:"none",border:"none",color:"#334155",fontSize:19,cursor:"pointer",padding:"4px 6px",lineHeight:1,textDecoration:"underline"}}>
                    ⚙
                  </button>
                )}
              </div>
              <div style={{display:"flex",gap:16,marginTop:10,flexWrap:"wrap"}}>
                <span style={{fontSize:12,color:"#64748B"}}>{getProjectObjectives(proj).length} objetivos</span>
                <span style={{fontSize:12,color:"#64748B"}}>{getProjectKRCount(proj)} KRs</span>
                {canEdit(proj.id)
                  ?<span style={{fontSize:12,color:"#10B981"}}>✓ Você pode editar</span>
                  :<span style={{fontSize:12,color:"#EF4444"}}>🔒 Somente leitura</span>}
                {(proj.members||[]).length>0&&<span style={{fontSize:12,color:"#475569"}}>· Editores: {(proj.members||[]).join(", ")}</span>}
                {proj.type==="multiprojeto"&&<span style={{fontSize:12,color:"#06B6D4"}}>Multiprojeto · soma mãe + subprojetos</span>}
              </div>
            </div>
          </div>
          {proj.objectives.map(obj=><ObjectiveBlock key={obj.id} obj={obj} color={proj.color} canEdit={canEdit(proj.id)} canEditLink={canEditLink(proj.id)} canConfigKR={user.isAdmin} onUpdateKR={openKREdit} onConfigKR={openKRConfig} onEditLink={openLinkEdit} onEditObjective={openObjEdit} onAddKR={canEdit(proj.id)?setAddingKRToObj:null}/>)}
          {proj.type==="multiprojeto"&&(
            <div style={{marginTop:14}}>
              <div style={{fontSize:12,color:"#64748B",letterSpacing:1,fontWeight:700,marginBottom:8}}>SUBPROJETOS</div>
              {(proj.children||[]).map(child=>(
                <div key={child.id} style={{background:"#0A1628",border:"1px solid #1E293B",borderRadius:12,padding:14,marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#CBD5E1"}}>{child.name}</div>
                    <div style={{fontSize:12,color:proj.color,fontWeight:700}}>{avgPct((child.objectives||[]).map(calcObj))}%</div>
                  </div>
                  {(child.objectives||[]).map(obj=><ObjectiveBlock key={obj.id} obj={obj} color={proj.color} canEdit={canEdit(proj.id)} canEditLink={canEditLink(proj.id)} canConfigKR={user.isAdmin} onUpdateKR={openKREdit} onConfigKR={openKRConfig} onEditLink={openLinkEdit} onEditObjective={openObjEdit} onAddKR={canEdit(proj.id)?setAddingKRToObj:null}/>)}
                </div>
              ))}
              {user.isAdmin&&(
                <button onClick={()=>setAddingChildProject(true)}
                  style={{width:"100%",background:"none",border:"1px dashed #334155",color:"#475569",borderRadius:12,padding:"10px",fontSize:13,cursor:"pointer"}}>
                  + Novo Subprojeto
                </button>
              )}
            </div>
          )}
          {user.isAdmin&&(
            <button onClick={()=>setAddingObj(true)}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#475569";e.currentTarget.style.color="#64748B";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#334155";e.currentTarget.style.color="#475569";}}
              style={{width:"100%",background:"none",border:"1px dashed #334155",color:"#475569",
                borderRadius:12,padding:"12px",fontSize:13,cursor:"pointer",transition:"all 0.15s",
                display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:4}}>
              <span style={{fontSize:18,lineHeight:1}}>+</span> Novo Objetivo
            </button>
          )}
        </div>
      )}

      {isSummits&&!summit&&renderGroupView(summits,SUMMIT_KR_TEMPLATES,SUMMIT_COLOR,"Novo Summit",()=>setAddingSummit(true),true,"summit")}
      {summit&&(
        <div>
          {renderDetailHeader(summit,SUMMIT_COLOR)}
          {summit.objectives.map(obj=><ObjectiveBlock key={obj.id} obj={obj} color={SUMMIT_COLOR} canEdit={user.isAdmin} canEditLink={user.isAdmin} canConfigKR={user.isAdmin} onUpdateKR={openKREdit} onConfigKR={openKRConfig} onEditLink={openLinkEdit} onEditObjective={openObjEdit} onAddKR={user.isAdmin?setAddingKRToObj:null}/>)}
          {user.isAdmin&&(
            <button onClick={()=>setAddingObj(true)}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#475569";e.currentTarget.style.color="#64748B";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#334155";e.currentTarget.style.color="#475569";}}
              style={{width:"100%",background:"none",border:"1px dashed #334155",color:"#475569",
                borderRadius:12,padding:"12px",fontSize:13,cursor:"pointer",transition:"all 0.15s",
                display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:4}}>
              <span style={{fontSize:18,lineHeight:1}}>+</span> Novo Objetivo
            </button>
          )}
        </div>
      )}
      {isEsquentas&&!esquenta&&renderGroupView(esquentas,ESQUENTA_KR_TEMPLATES,ESQUENTA_COLOR,"Nova Cidade",()=>setAddingEsquenta(true),true,"esquenta")}
      {esquenta&&(
        <div>
          {renderDetailHeader(esquenta,ESQUENTA_COLOR)}
          {esquenta.objectives.map(obj=><ObjectiveBlock key={obj.id} obj={obj} color={ESQUENTA_COLOR} canEdit={canEdit(5)||user.isAdmin} canEditLink={canEditLink(5)} canConfigKR={user.isAdmin} onUpdateKR={openKREdit} onConfigKR={openKRConfig} onEditLink={openLinkEdit} onEditObjective={openObjEdit} onAddKR={(canEdit(5)||user.isAdmin)?setAddingKRToObj:null}/>)}
          {(canEdit(5)||user.isAdmin)&&(
            <button onClick={()=>setAddingObj(true)}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#475569";e.currentTarget.style.color="#64748B";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#334155";e.currentTarget.style.color="#475569";}}
              style={{width:"100%",background:"none",border:"1px dashed #334155",color:"#475569",
                borderRadius:12,padding:"12px",fontSize:13,cursor:"pointer",transition:"all 0.15s",
                display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:4}}>
              <span style={{fontSize:18,lineHeight:1}}>+</span> Novo Objetivo
            </button>
          )}
        </div>
      )}

      {/* ── MODALS ── */}

      {editingKR!==null&&(
        <Modal title="Atualizar Key Result" onClose={()=>setEditingKR(null)}>
          {[["Valor atual","current","number"],["Meta","target","number"],["Observação (opcional)","note","text"]].map(([label,key,type])=>(
            <Field key={key} label={label}><input type={type} value={krVals[key]||""} onChange={e=>setKrVals(v=>({...v,[key]:e.target.value}))} style={INPUT_STYLE}/></Field>
          ))}
          <BtnRow onSave={saveKR} onCancel={()=>setEditingKR(null)}/>
        </Modal>
      )}

      {editingKRConfig!==null&&(
        <Modal title="Configuração KR" onClose={()=>setEditingKRConfig(null)}>
          <Field label="Título do KR">
            <input type="text" value={krConfigVals.title} onChange={e=>setKrConfigVals(v=>({...v,title:e.target.value}))} style={INPUT_STYLE}/>
          </Field>
          <Field label="Meta">
            <input type="number" value={krConfigVals.target} onChange={e=>setKrConfigVals(v=>({...v,target:e.target.value}))} style={INPUT_STYLE}/>
          </Field>
          <Field label="Unidade">
            <input type="text" value={krConfigVals.unit} onChange={e=>setKrConfigVals(v=>({...v,unit:e.target.value}))} style={INPUT_STYLE}/>
          </Field>
          <BtnRow onSave={saveKRConfig} onCancel={()=>setEditingKRConfig(null)}/>
          {user.isAdmin&&(
            <button onClick={deleteKR}
              style={{marginTop:10,width:"100%",background:"transparent",border:"1px solid #450A0A",color:"#7F1D1D",
                padding:"8px",borderRadius:8,fontSize:12,cursor:"pointer"}}>
              Deletar KR
            </button>
          )}
        </Modal>
      )}

      {editingLink!==null&&(
        <Modal title="Link Operacional" onClose={()=>setEditingLink(null)}>
          <p style={{fontSize:12,color:"#64748B",margin:"0 0 16px"}}>Cole o link da planilha, Trello, Notion ou qualquer ferramenta deste KR.</p>
          <input type="url" placeholder="https://…" value={newLink} onChange={e=>setNewLink(e.target.value)} style={{...INPUT_STYLE,marginBottom:8}}/>
          {newLink&&<div style={{fontSize:12,color:"#64748B",marginBottom:8}}>{getToolIcon(newLink)} {getToolName(newLink)}</div>}
          <BtnRow onSave={saveLink} onCancel={()=>setEditingLink(null)}/>
        </Modal>
      )}

      {editingObj!==null&&(
        <Modal title="Editar Objetivo" onClose={()=>setEditingObj(null)}>
          <input type="text" value={objTitle} onChange={e=>setObjTitle(e.target.value)} style={{...INPUT_STYLE,marginBottom:4}}/>
          <BtnRow onSave={saveObjective} onCancel={()=>setEditingObj(null)}/>
          {user.isAdmin&&(
            <button onClick={deleteObjective}
              style={{marginTop:10,width:"100%",background:"transparent",border:"1px solid #450A0A",color:"#7F1D1D",
                padding:"8px",borderRadius:8,fontSize:12,cursor:"pointer"}}>
              Deletar Objetivo
            </button>
          )}
        </Modal>
      )}

      {settingsGroup!==null&&(
        <Modal title={settingsGroup==="summits"?"Configuração Summits":"Configuração Esquenta"} onClose={()=>setSettingsGroup(null)}>
          <Field label="Nome do card">
            <input type="text" value={groupLabelInput} onChange={e=>setGroupLabelInput(e.target.value)} style={INPUT_STYLE}/>
          </Field>
          <BtnRow onSave={saveGroupSettings} onCancel={()=>setSettingsGroup(null)}/>
          {user.isAdmin&&(
            <button onClick={deleteGroupItems}
              style={{marginTop:10,width:"100%",background:"transparent",border:"1px solid #450A0A",color:"#7F1D1D",
                padding:"8px",borderRadius:8,fontSize:12,cursor:"pointer"}}>
              Deletar todos os itens
            </button>
          )}
        </Modal>
      )}

      {settingsGroupItem!==null&&(
        <Modal title={settingsGroupItem.type==="summit"?"Configuração Summit":"Configuração Esquenta"} onClose={()=>setSettingsGroupItem(null)}>
          <Field label="Nome">
            <input type="text" value={groupItemName} onChange={e=>setGroupItemName(e.target.value)} style={INPUT_STYLE}/>
          </Field>
          <Field label="Data">
            <input type="date" value={groupItemDate} onChange={e=>setGroupItemDate(e.target.value)} style={INPUT_STYLE}/>
          </Field>
          <BtnRow onSave={saveGroupItemSettings} onCancel={()=>setSettingsGroupItem(null)}/>
          {user.isAdmin&&(
            <button onClick={deleteGroupItem}
              style={{marginTop:10,width:"100%",background:"transparent",border:"1px solid #450A0A",color:"#7F1D1D",
                padding:"8px",borderRadius:8,fontSize:12,cursor:"pointer"}}>
              {settingsGroupItem.type==="summit"?"Deletar Summit":"Deletar Esquenta"}
            </button>
          )}
        </Modal>
      )}

      {showAnnounce&&(
        <Modal title="📢 Publicar Aviso Geral" borderColor="#7C3AED55" onClose={()=>setShowAnnounce(false)}>
          <p style={{fontSize:12,color:"#64748B",margin:"0 0 12px"}}>Aparece no topo do Dashboard para todos os usuários.</p>
          <textarea rows={3} value={announceText} onChange={e=>setAnnounceText(e.target.value)}
            placeholder="Ex: Reunião de alinhamento OKR na sexta às 15h…"
            style={{...INPUT_STYLE,resize:"vertical",marginBottom:4}}/>
          <BtnRow onSave={saveAnnouncement} onCancel={()=>setShowAnnounce(false)} saveLabel="Publicar" saveColor="#7C3AED"/>
        </Modal>
      )}

      {addingProject&&(
        <Modal title="Novo Projeto" onClose={()=>{setAddingProject(false);setNewProjType("");}}>
          <Field label="Tipo de projeto">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <button onClick={()=>setNewProjType("normal")} style={{background:newProjType==="normal"?"#0F2240":"#1E293B",border:"1px solid #334155",color:"#CBD5E1",padding:"10px",borderRadius:8,cursor:"pointer"}}>Projeto normal</button>
              <button onClick={()=>setNewProjType("multiprojeto")} style={{background:newProjType==="multiprojeto"?"#0F2240":"#1E293B",border:"1px solid #334155",color:"#CBD5E1",padding:"10px",borderRadius:8,cursor:"pointer"}}>Multiprojeto</button>
            </div>
          </Field>
          <Field label="Nome do projeto"><input type="text" placeholder="Ex: AB2L Awards" value={newProjName} onChange={e=>setNewProjName(e.target.value)} style={INPUT_STYLE}/></Field>
          <Field label={newProjType==="multiprojeto"?"Objetivo do projeto-mãe":"Primeiro objetivo"}><input type="text" placeholder="Ex: Consolidar o programa de premiações" value={newProjObjTitle} onChange={e=>setNewProjObjTitle(e.target.value)} style={INPUT_STYLE}/></Field>
          <Field label="Cor do projeto">
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {PALETTE.map(c=><div key={c} onClick={()=>setNewProjColor(c)} style={{width:28,height:28,borderRadius:"50%",background:c,cursor:"pointer",border:newProjColor===c?"3px solid #fff":"3px solid transparent",boxSizing:"border-box"}}/>)}
            </div>
          </Field>
          <BtnRow onSave={saveNewProject} onCancel={()=>{setAddingProject(false);setNewProjType("");}} saveLabel="Criar" saveColor={newProjColor}/>
        </Modal>
      )}

      {addingSummit&&(
        <Modal title="Novo Summit" borderColor="#06B6D444" onClose={()=>setAddingSummit(false)}>
          <Field label="Nome do Summit"><input type="text" placeholder="Ex: Tokyo Summit" value={newSummitName} onChange={e=>setNewSummitName(e.target.value)} style={INPUT_STYLE}/></Field>
          <Field label="Data (opcional)"><input type="date" value={newSummitDate} onChange={e=>setNewSummitDate(e.target.value)} style={INPUT_STYLE}/></Field>
          <BtnRow onSave={saveSummit} onCancel={()=>setAddingSummit(false)} saveLabel="Criar" saveColor={SUMMIT_COLOR}/>
        </Modal>
      )}

      {addingChildProject&&(
        <Modal title="Novo Subprojeto" onClose={()=>setAddingChildProject(false)}>
          <Field label="Nome do subprojeto">
            <input type="text" placeholder="Ex: Frente Europa" value={newChildProjectName} onChange={e=>setNewChildProjectName(e.target.value)} style={INPUT_STYLE}/>
          </Field>
          <BtnRow onSave={saveNewChildProject} onCancel={()=>setAddingChildProject(false)} saveLabel="Criar" saveColor={proj?.color||"#3B82F6"}/>
        </Modal>
      )}

      {addingEsquenta&&(
        <Modal title="Nova Cidade" borderColor="#EF444444" onClose={()=>setAddingEsquenta(false)}>
          <Field label="Cidade"><input type="text" placeholder="Ex: Curitiba, PR" value={newEsquentaName} onChange={e=>setNewEsquentaName(e.target.value)} style={INPUT_STYLE}/></Field>
          <Field label="Data do evento"><input type="date" value={newEsquentaDate} onChange={e=>setNewEsquentaDate(e.target.value)} style={INPUT_STYLE}/></Field>
          <BtnRow onSave={saveEsquenta} onCancel={()=>setAddingEsquenta(false)} saveLabel="Criar" saveColor={ESQUENTA_COLOR}/>
        </Modal>
      )}

      {/* ⚙ Project Settings Modal */}
      {settingsProj&&(
        <ProjectSettingsModal
          proj={settingsProj}
          onSave={saveProjectSettings}
          onDelete={()=>deleteProject(settingsProj.id)}
          onClose={()=>setSettingsProj(null)}
        />
      )}

      {/* + Novo Objetivo */}
      {addingObj&&(
        <Modal title="Novo Objetivo" onClose={()=>{setAddingObj(false);setNewObjTitle("");}}>
          <Field label="Título do objetivo">
            <input type="text" placeholder="Ex: Expandir presença nacional" value={newObjTitle}
              onChange={e=>setNewObjTitle(e.target.value)} style={INPUT_STYLE} autoFocus/>
          </Field>
          <BtnRow onSave={saveNewObjective} onCancel={()=>{setAddingObj(false);setNewObjTitle("");}} saveLabel="Criar" saveColor={proj?.color||"#3B82F6"}/>
        </Modal>
      )}

      {/* + Novo KR */}
      {addingKRToObj!==null&&(
        <Modal title="Novo Key Result" onClose={()=>{setAddingKRToObj(null);setNewKRVals({title:"",target:"",unit:""});}}>
          <Field label="Título do KR">
            <input type="text" placeholder="Ex: Fechar 10 contratos" value={newKRVals.title}
              onChange={e=>setNewKRVals(v=>({...v,title:e.target.value}))} style={INPUT_STYLE} autoFocus/>
          </Field>
          <Field label="Meta">
            <input type="number" placeholder="Ex: 10" value={newKRVals.target}
              onChange={e=>setNewKRVals(v=>({...v,target:e.target.value}))} style={INPUT_STYLE}/>
          </Field>
          <Field label="Unidade">
            <input type="text" placeholder="Ex: contratos, inscritos, %" value={newKRVals.unit}
              onChange={e=>setNewKRVals(v=>({...v,unit:e.target.value}))} style={INPUT_STYLE}/>
          </Field>
          <BtnRow onSave={saveNewKR} onCancel={()=>{setAddingKRToObj(null);setNewKRVals({title:"",target:"",unit:""}); }} saveLabel="Criar" saveColor={proj?.color||"#3B82F6"}/>
        </Modal>
      )}

    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

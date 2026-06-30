import { useState, useRef, useEffect, useCallback } from "react";

// ─── Theme ─────────────────────────────────────────────────────────────────
const T = {
  light:{bg:"#fff",bg2:"#fafaf9",bg3:"#f0ebe5",border:"#e8e4e0",text:"#1a1a1a",
    muted:"#6b6b6b",sidebar:"#fafaf9",sborder:"#ece8e3",dark:false,
    // Accent (Qatar maroon) tint — used for "Quick mode" badge and ⚙️ active state
    accentBg:"#fdf0f3",accentBorder:"#e3a8b8",
    // Cite inline badge
    citeBg:"#fdf0f3",citeBorder:"#e3a8b8",
    // Risk cards
    riskHiBg:"#fef3f2",riskMidBg:"#fffbeb",riskLoBg:"#f0fdf4",
    // MOPH Qatar / World answer columns
    mzBg:"#fff5f5",mzBorder:"#f5b8c0",mzText:"#8B1A2B",mzSubBorder:"#f0c5c8",
    worldBg:"#f3faf2",worldBorder:"#b3dcb0",worldText:"#1a7a35",
    // Compare block
    cmpBg:"linear-gradient(135deg,#fff5f5 0%,#f3faf2 100%)",cmpBorder:"#f0c5c8",cmpLabel:"#555",
    // Source-type card tints
    srcMzBg:"#fff5f5",srcMzB:"#f5b8c0",
    srcPmBg:"#f0f6ff",srcPmB:"#c0d8f5",
    srcCoBg:"#fff5f7",srcCoB:"#f5b8c0",
    srcPdfBg:"#faf5ff",srcPdfB:"#C4B5FD",
    // PDF panel
    pdfPanelBg:"#faf5ff",
    // Grade badge tints
    gradeA:{bg:"#d1fae5",c:"#065f46"},gradeB:{bg:"#dbeafe",c:"#1e40af"},
    gradeC:{bg:"#fef3c7",c:"#92400e"},gradeD:{bg:"#fee2e2",c:"#991b1b"},
  },
  dark:{bg:"#0f1117",bg2:"#1a1d26",bg3:"#242836",border:"#2d3244",text:"#e8eaf0",
    muted:"#8b8fa8",sidebar:"#13151f",sborder:"#1e2133",dark:true,
    // Accent (Qatar maroon) tint
    accentBg:"#2a0f17",accentBorder:"#7a1530",
    // Cite inline badge
    citeBg:"#2a0f17",citeBorder:"#7a1530",
    // Risk cards
    riskHiBg:"#2d1212",riskMidBg:"#2d2410",riskLoBg:"#0d2318",
    // MOPH Qatar / World answer columns
    mzBg:"#1f0e13",mzBorder:"#5c1a28",mzText:"#f5b8c0",mzSubBorder:"#5c1a28",
    worldBg:"#0d1f13",worldBorder:"#1a3d22",worldText:"#4ade80",
    // Compare block
    cmpBg:"linear-gradient(135deg,#1f0e13 0%,#0d1f13 100%)",cmpBorder:"#5c1a28",cmpLabel:"#8b8fa8",
    // Source-type card tints
    srcMzBg:"#1f0e13",srcMzB:"#5c1a28",
    srcPmBg:"#0f1e2e",srcPmB:"#1a3a5c",
    srcCoBg:"#1f0e13",srcCoB:"#5c1a28",
    srcPdfBg:"#16102a",srcPdfB:"#3b2d6e",
    // PDF panel
    pdfPanelBg:"#16102a",
    // Grade badge tints
    gradeA:{bg:"#052e16",c:"#4ade80"},gradeB:{bg:"#0c1a3d",c:"#93c5fd"},
    gradeC:{bg:"#2d1f00",c:"#fcd34d"},gradeD:{bg:"#2d0a0a",c:"#fca5a5"},
  },
};

// ─── Language support ───────────────────────────────────────────────────────
// Qatar edition — three languages: Arabic (default), English, Russian
// Lang state is managed in App and passed down via `lang` prop / context.
// All user-facing strings are in the I18N map below.
const I18N={
  ar:{
    // Navigation
    navChat:"الدردشة السريرية",
    navExam:"وضع الفحص",
    navDoc:"تحليل الوثيقة",
    navCalc:"الآلات الحاسبة",
    navDrugs:"التفاعلات الدوائية",
    navDdx:"التشخيص التفريقي",
    navMoph:"قاعدة MOPH",
    navFav:"المفضلة",
    navHist:"السجل",
    // Header / home
    heroTitle:"البيانات الطبية — على الفور.",
    heroSub:"PubMed · Cochrane · PDF · MOPH Qatar · الآلات الحاسبة · التفاعلات · التشخيص التفريقي",
    suggestionsLabel:"أمثلة على الأسئلة",
    inputPlaceholder:"اطرح سؤالاً سريرياً…",
    voicePlaceholder:"تحدّث…",
    footerDisclaimer:"لا يُغني عن الحكم السريري",
    // Chat
    save:"☆ حفظ",
    saved:"⭐ محفوظ",
    exportHis:"📋 تصدير إلى HIS",
    sources:"مصادر",
    mophLabel:"MOPH Qatar",
    worldLabel:"الممارسة العالمية",
    compareLabel:"المقارنة",
    // Settings
    settings:"الإعدادات",
    quickMode:"الوضع الموجز",
    population:"الفئة السكانية",
    pubmedSince:"PubMed منذ",
    // Misc
    repeat:"إعادة",
    searchPlaceholder:"بحث…",
    // Calculators
    calcTitle:"الآلات الحاسبة السريرية",
    // Drugs
    drugsTitle:"فحص التفاعلات الدوائية",
    drugsPlaceholder:"مثال: وارفارين، أسبرين، أوميبرازول، أميودارون، ميتفورمين",
    checkBtn:"فحص التفاعلات",
    checking:"جارٍ التحليل…",
    // DDx
    ddxTitle:"التشخيص التفريقي",
    ddxSub:"صِف الأعراض والتاريخ المرضي ونتائج الفحص",
    ddxBtn:"وضع قائمة التشخيصات",
    analyzing:"جارٍ التحليل…",
    // MOPH sync
    mophSyncTitle:"قاعدة التوجيهات السريرية MOPH Qatar",
    mophSyncSub:"يقوم الفهرس تلقائياً بتنزيل التوجيهات السريرية بتنسيق PDF من موقع MOPH Qatar وفهرستها أسبوعياً.",
    syncBtn:"تشغيل التحديث الآن",
    syncing:"جارٍ المزامنة…",
    // Grades
    gradeA:"المستوى A",gradeB:"المستوى B",gradeC:"المستوى C",gradeD:"المستوى D",
    // Populations
    pop:["عام","حوامل","أطفال","كبار السن (>65)","مرض كلوي مزمن","قصور كبدي"],
  },
  en:{
    navChat:"Clinical Chat",
    navExam:"Exam Mode",
    navDoc:"Document Analysis",
    navCalc:"Calculators",
    navDrugs:"Drug Interactions",
    navDdx:"Differential Dx",
    navMoph:"MOPH Database",
    navFav:"Favourites",
    navHist:"History",
    heroTitle:"Medical Data — Instantly.",
    heroSub:"PubMed · Cochrane · PDF · MOPH Qatar · Calculators · Interactions · DDx",
    suggestionsLabel:"Sample questions",
    inputPlaceholder:"Ask a clinical question…",
    voicePlaceholder:"Speak…",
    footerDisclaimer:"Does not replace clinical judgement",
    save:"☆ Save",
    saved:"⭐ Saved",
    exportHis:"📋 Export to HIS",
    sources:"Sources",
    mophLabel:"MOPH Qatar",
    worldLabel:"Global Practice",
    compareLabel:"Comparison",
    settings:"Settings",
    quickMode:"Brief mode",
    population:"Population",
    pubmedSince:"PubMed since",
    repeat:"Repeat",
    searchPlaceholder:"Search…",
    calcTitle:"Clinical Calculators",
    drugsTitle:"Drug Interaction Checker",
    drugsPlaceholder:"e.g.: warfarin, aspirin, omeprazole, amiodarone, metformin",
    checkBtn:"Check Interactions",
    checking:"Analysing…",
    ddxTitle:"Differential Diagnosis",
    ddxSub:"Describe symptoms, history, and examination findings",
    ddxBtn:"Build DDx",
    analyzing:"Analysing…",
    mophSyncTitle:"MOPH Qatar Clinical Guidelines Database",
    mophSyncSub:"The index automatically downloads and indexes PDF clinical guidelines from MOPH Qatar weekly.",
    syncBtn:"Run Update Now",
    syncing:"Syncing…",
    gradeA:"Level A",gradeB:"Level B",gradeC:"Level C",gradeD:"Level D",
    pop:["General","Pregnant","Paediatric","Elderly (>65)","CKD","Hepatic impairment"],
  },
  ru:{
    navChat:"Клинический чат",
    navExam:"Режим осмотра",
    navDoc:"Анализ документа",
    navCalc:"Калькуляторы",
    navDrugs:"Interactions",
    navDdx:"Дифф. диагностика",
    navMoph:"База MOPH",
    navFav:"Избранное",
    navHist:"История",
    heroTitle:"Медицинские данные — мгновенно.",
    heroSub:"PubMed · Cochrane · PDF · MOPH Qatar · Калькуляторы · Interactions · ДДx",
    suggestionsLabel:"Примеры вопросов",
    inputPlaceholder:"Задайте клинический вопрос…",
    voicePlaceholder:"Говорите…",
    footerDisclaimer:"Не заменяет клиническое суждение",
    save:"☆ Сохранить",
    saved:"⭐ Сохранено",
    exportHis:"📋 Экспорт в МИС",
    sources:"Источников",
    mophLabel:"MOPH Qatar",
    worldLabel:"Мировая практика",
    compareLabel:"Сравнение",
    settings:"Настройки",
    quickMode:"Краткий режим",
    population:"Популяция",
    pubmedSince:"PubMed с",
    repeat:"Повторить",
    searchPlaceholder:"Поиск…",
    calcTitle:"Клинические калькуляторы",
    drugsTitle:"Проверка взаимодействий",
    drugsPlaceholder:"например: варфарин, аспирин, омепразол, амиодарон, метформин",
    checkBtn:"Проверить взаимодействия",
    checking:"Анализ…",
    ddxTitle:"Дифференциальный диагноз",
    ddxSub:"Опишите симптомы, анамнез и данные обследования",
    ddxBtn:"Составить ДДx",
    analyzing:"Анализ…",
    mophSyncTitle:"База клинических руководств MOPH Qatar",
    mophSyncSub:"Серверный индекс автоматически скачивает и индексирует PDF-руководства с сайта MOPH Qatar еженедельно.",
    syncBtn:"Запустить обновление сейчас",
    syncing:"Синхронизация…",
    gradeA:"Уровень A",gradeB:"Уровень B",gradeC:"Уровень C",gradeD:"Уровень D",
    pop:["Общая","Беременные","Дети","Пожилые (>65)","ХБП","Печёночная недостаточность"],
  },
};

// ─── Constants ──────────────────────────────────────────────────────────────
const MOPH_URL="https://www.moph.gov.qa/english/medicalregulations/Pages/ClinicalGuidelines.aspx";
// Legacy alias so older references still work
const MINZDRAV_URL=MOPH_URL;
// AI_MODEL is intentionally not defined here — the server decides which model to use.
// Update the model in server.js (ALLOWED_MODELS), not in the frontend.
const PUBMED_BASE="https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const EUROPEPMC="https://www.ebi.ac.uk/europepmc/webservices/rest/search";

// ─── AI call wrapper ──────────────────────────────────────────────────────────
// Calls go through our own backend proxy (server.js, see /docgrade-server),
// which holds the real Anthropic API key server-side and is never exposed to
// the browser. Set VITE_API_BASE_URL in your Cloudflare Pages project's
// environment variables to your deployed backend's URL. Until a backend is
// deployed, this defaults to localhost, so the chat/AI features will not work
// in production — only the static UI will render. See README for details.
const API_BASE_URL=(typeof import.meta!=="undefined"&&import.meta.env?.VITE_API_BASE_URL)||"http://localhost:8787";
const AI_API_URL=`${API_BASE_URL}/api/analyze`;

// Shared AbortController is now stored inside the App component as a useRef
// (see abortRef) to avoid cross-instance interference in StrictMode / tests.

async function callAI({messages,system,maxTokens=1000,signal}){
  // The model is chosen server-side from an allowlist (see server.js
  // ALLOWED_MODELS) — the client never needs to (and cannot) pick an
  // arbitrary model, which closes off a class of cost/abuse attacks against
  // a tampered frontend bundle.
  const body={max_tokens:maxTokens,messages};
  if(system)body.system=system;
  const res=await fetch(AI_API_URL,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(body),
    signal,
  });
  if(!res.ok){
    const errBody=await res.json().catch(()=>null);
    const map={
      401:"Authorization error (401) — خطأ في التفويض — Ошибка авторизации",
      429:"Rate limit exceeded (429) — تجاوز الحد — Превышен лимит запросов",
      500:"Backend/Anthropic internal error (500) — خطأ داخلي — Внутренняя ошибка сервера",
    };
    throw new Error(errBody?.error?.message||map[res.status]||`HTTP ${res.status}`);
  }
  const d=await res.json();
  if(d.error)throw new Error(d.error.message||"API Error");
  return d.content?.map(c=>c.text||"").join("")||"";
}
const SUGGESTED_AR=[
  "العلاج الأول لمرض السكري من النوع الثاني في المرضى المسنين؟",
  "مضادات التخثر في الرجفان الأذيني مع مرض كلوي مزمن؟",
  "إدارة الالتهاب الرئوي المكتسب من المجتمع لدى البالغين",
  "حاصرات بيتا في قصور القلب: متى تُمنع؟",
  "عتبات وصف الستاتينات وفق إرشادات ACC/AHA",
];
const SUGGESTED_EN=[
  "First-line therapy for type 2 diabetes in elderly patients?",
  "Anticoagulation in AF with CKD?",
  "Management of community-acquired pneumonia in adults",
  "Beta-blockers in heart failure: when are they contraindicated?",
  "Statin prescribing thresholds per ACC/AHA guidelines",
];
const SUGGESTED_RU=[
  "Терапия первой линии при СД 2 типа у пожилых пациентов?",
  "Антикоагуляция при ФП на фоне ХБП?",
  "Ведение внебольничной пневмонии у взрослых",
  "Бета-блокаторы при сердечной недостаточности: когда противопоказаны?",
  "Пороговые значения для назначения статинов по АКК/ААС",
];
const SUGGESTED_BY_LANG={ar:SUGGESTED_AR,en:SUGGESTED_EN,ru:SUGGESTED_RU};
// POPULATIONS and NAV are now derived from I18N in the App component (per lang)
const NAV_IDS=[
  {id:"chat",       icon:"💬"},
  {id:"exam",       icon:"🎙️"},
  {id:"docanalysis",icon:"📂"},
  {id:"calc",       icon:"🧮"},
  {id:"drugs",      icon:"💊"},
  {id:"ddx",        icon:"🔍"},
  {id:"mzsync",     icon:"🔵"},
  {id:"fav",        icon:"⭐"},
  {id:"history",    icon:"📜"},
];
const NAV_LABEL_KEY={
  chat:"navChat",exam:"navExam",docanalysis:"navDoc",calc:"navCalc",
  drugs:"navDrugs",ddx:"navDdx",mzsync:"navMoph",fav:"navFav",history:"navHist",
};

// ─── Icons ──────────────────────────────────────────────────────────────────
const DGLogo=()=>(
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#8A1538"/>
    <path d="M9 16a7 7 0 1 0 14 0 7 7 0 0 0-14 0z" fill="white" fillOpacity=".15"/>
    <path d="M16 10v12M10 16h12" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
  </svg>
);
// MOPH Qatar icon — maroon & white (Qatar national colors)
const MOPHIcon=({s=13})=>(
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#8B1A2B"/>
    <path d="M12 6v12M6 12h12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="3" fill="#8B1A2B" stroke="white" strokeWidth="1"/>
  </svg>
);
// Keep MZIcon as alias so existing refs compile
const MZIcon=MOPHIcon;
const PMIcon=({s=13})=>(
  <svg width={s} height={s} viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="5" fill="#326599"/>
    <text x="3" y="19" fontSize="11" fontWeight="bold" fill="white" fontFamily="monospace">PM</text>
  </svg>
);
const CoIcon=({s=13})=>(
  <svg width={s} height={s} viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="5" fill="#C41F3E"/>
    <text x="4" y="19" fontSize="11" fontWeight="bold" fill="white" fontFamily="monospace">Co</text>
  </svg>
);
const PDFIcon=({s=13})=>(
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="2" width="18" height="20" rx="3" fill="#6B46C1"/>
    <path d="M7 12h3a2 2 0 1 0 0-4H7v8m6-8h2a2 2 0 0 1 0 4h-2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const GlobeIcon=({s=13,c="#1a7a35"})=>(
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

// ─── PubMed ─────────────────────────────────────────────────────────────────
async function searchPubMed(q,max=5,yearMin="",signal){
  let term=encodeURIComponent(q);
  const y=parseInt(yearMin,10);
  if(!isNaN(y)&&y>1900) term+=encodeURIComponent(` AND ("${y}"[Date - Publication] : "3000"[Date - Publication])`);
  const r=await fetch(`${PUBMED_BASE}/esearch.fcgi?db=pubmed&term=${term}&retmax=${max}&retmode=json&sort=relevance`,{signal});
  const d=await r.json(); return d?.esearchresult?.idlist||[];
}
async function fetchPMSummaries(pmids,signal){
  if(!pmids.length)return[];
  const r=await fetch(`${PUBMED_BASE}/esummary.fcgi?db=pubmed&id=${pmids.join(",")}&retmode=json`,{signal});
  const d=await r.json(); const res=d?.result||{};
  return pmids.map(id=>{const doc=res[id];if(!doc)return null;
    return{pmid:id,title:doc.title||"",journal:doc.fulljournalname||"",
      year:doc.pubdate?.slice(0,4)||"",authors:(doc.authors||[]).slice(0,3).map(a=>a.name).join(", "),
      url:`https://pubmed.ncbi.nlm.nih.gov/${id}/`,type:"pubmed"};}).filter(Boolean);
}
async function fetchPMAbstracts(pmids,signal){
  if(!pmids.length)return"";
  const r=await fetch(`${PUBMED_BASE}/efetch.fcgi?db=pubmed&id=${pmids.join(",")}&rettype=abstract&retmode=text`,{signal});
  return(await r.text()).slice(0,4000);
}
async function searchCochrane(q,max=4,signal){
  const enc=encodeURIComponent(`${q} AND JOURNAL_TITLE:"Cochrane Database of Systematic Reviews"`);
  const r=await fetch(`${EUROPEPMC}?query=${enc}&format=json&pageSize=${max}&resultType=core`,{signal});
  const d=await r.json();
  return(d?.resultList?.result||[]).map(it=>({
    pmid:it.pmid||"",title:it.title||"",journal:"Cochrane Database of Systematic Reviews",
    year:it.pubYear||"",authors:(it.authorString||"").split(",").slice(0,3).join(",").trim(),
    abstract:(it.abstractText||"").slice(0,500),doi:it.doi||"",
    url:it.doi?`https://doi.org/${it.doi}`:"https://www.cochranelibrary.com",type:"cochrane"}));
}

// ─── RAG ────────────────────────────────────────────────────────────────────
function chunkText(text,size=800,overlap=150){
  const chunks=[];let start=0;
  const step=Math.max(1,size-overlap); // guard against infinite loop if overlap>=size
  while(start<text.length){chunks.push(text.slice(start,start+size));start+=step;}
  return chunks;
}
function tokenize(t){return t.toLowerCase().replace(/[^а-яёa-z0-9\s]/gi," ").split(/\s+/).filter(w=>w.length>2);}
function ragSearch(q,chunks,k=5){
  const qT=new Set(tokenize(q));
  return chunks.map(c=>{const u=new Set(tokenize(c.text));const h=[...u].filter(t=>qT.has(t)).length;
    return{...c,score:h/Math.sqrt(u.size+1)};}).sort((a,b)=>b.score-a.score).filter(c=>c.score>0).slice(0,k);
}
async function extractPDF(file,lib){
  const buf=await file.arrayBuffer();
  const pdf=await lib.getDocument({data:buf}).promise;
  let text="";const pages=Math.min(pdf.numPages,60);
  for(let i=1;i<=pages;i++){const p=await pdf.getPage(i);const c=await p.getTextContent();
    text+=c.items.map(x=>x.str).join(" ")+"\n";}
  return text;
}

// ─── Grade badge ─────────────────────────────────────────────────────────────
const GradeBadge=({g,th,lang="en"})=>{
  const key="grade"+(g||"C");
  const t=(th&&th[key])||{bg:"#fef3c7",c:"#92400e"};
  const L=I18N[lang]||I18N.en;
  const label={A:L.gradeA,B:L.gradeB,C:L.gradeC,D:L.gradeD}[g]||L.gradeC;
  return <span style={{fontSize:9.5,fontWeight:700,padding:"2px 6px",borderRadius:4,
    background:t.bg,color:t.c,fontFamily:"system-ui,sans-serif",marginLeft:4}}>{label}</span>;
};

// ─── Cite ────────────────────────────────────────────────────────────────────
const Cite=({i,s,th})=>(
  <span title={s} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",
    width:15,height:15,borderRadius:3,
    background:(th&&th.citeBg)||"#fdf0f3",
    border:`1px solid ${(th&&th.citeBorder)||"#e3a8b8"}`,
    color:"#8A1538",fontSize:8,fontWeight:700,cursor:"pointer",marginLeft:2,
    verticalAlign:"super",fontFamily:"monospace"}}>{i}</span>
);
const renderInline=(text="",sources=[],th)=>
  (text||"").split(/(\[\d+\])/g).map((p,i)=>{
    const m=p.match(/\[(\d+)\]/);
    if(m){const s=sources[parseInt(m[1])-1];return <Cite key={`cite-${i}-${m[1]}`} i={parseInt(m[1])} s={s?.source||""} th={th}/>;}
    return <span key={`txt-${i}`}>{p}</span>;
  });

// ─── Typing dots ─────────────────────────────────────────────────────────────
const Dots=()=>(
  <div style={{display:"flex",gap:5,padding:"11px 14px",alignItems:"center"}}>
    {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#8A1538",
      animation:`bd 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}
  </div>
);

// ─── Status bar ──────────────────────────────────────────────────────────────
const STEPS=[
  {k:"pubmed",  l:"PubMed",                     c:"#326599"},
  {k:"cochrane",l:"Cochrane",                    c:"#C41F3E"},
  {k:"moph",    l:"MOPH Qatar",                  c:"#8B1A2B"},
  {k:"rag",     l:"PDF Guidelines / PDF / PDF",  c:"#6B46C1"},
  {k:"claude",  l:"Analysis / تحليل / Анализ",   c:"#8A1538"},
];
const StatusBar=({step,th})=>{
  const ci=STEPS.findIndex(s=>s.k===step);if(ci<0)return null;
  return(
    <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:8,flexWrap:"wrap",
      background:th.bg2,border:`1px solid ${th.border}`,borderRadius:8,padding:"7px 12px"}}>
      {STEPS.map((s,i)=>(
        <div key={s.k} style={{display:"flex",alignItems:"center",gap:4}}>
          <div style={{display:"flex",alignItems:"center",gap:4,opacity:i>ci?.25:i<ci?.5:1,transition:"opacity .3s"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:s.c,
              animation:i===ci?"pulse2 1s ease-in-out infinite":"none"}}/>
            <span style={{fontSize:10.5,color:s.c,fontWeight:600,fontFamily:"system-ui,sans-serif"}}>{s.l}</span>
          </div>
          {i<STEPS.length-1&&<span style={{color:th.muted,fontSize:11}}>›</span>}
        </div>
      ))}
    </div>
  );
};

// ─── System prompt builder ───────────────────────────────────────────────────
const buildPrompt=(pubCtx,coCtx,ragCtx,quick,population,lang="en")=>{
  // The AI always responds in the language of the query/lang setting
  const langInstr={
    ar:"أجب دائماً باللغة العربية.",
    en:"Always respond in English.",
    ru:"Отвечай строго на русском языке.",
  }[lang]||"Always respond in English.";

  return `You are DocGrade — a Clinical Decision Support System for Qatar (MOPH Qatar edition). ${langInstr}
${population&&population!=="General"&&population!=="عام"&&population!=="Общая"?`IMPORTANT: Adapt all recommendations for the special population: ${population}.`:""}
${pubCtx?`## PubMed articles:\n${pubCtx}\n`:""}
${coCtx?`## Cochrane reviews:\n${coCtx}\n`:""}
${ragCtx?`## PDF guideline excerpts (priority source):\n${ragCtx}\n`:""}
${quick?`Give a BRIEF answer (2–3 sentences) without sections. Most important points only.`:`
Structure your answer STRICTLY in this format. All four blocks are REQUIRED — do not skip any:

<INTRO>The essence of the question and brief clinical context, 1–2 sentences.</INTRO>

<MINZDRAV>
MOPH Qatar Position: clinical guidelines, circulars, standards published by the Ministry of Public Health of Qatar.
Reference: moph.gov.qa. After each recommendation — [Grade A/B/C/D]. Numeric source markers [1],[2]…
If no official MOPH Qatar guidelines exist on the topic, state this explicitly.
</MINZDRAV>

<WORLD>
Global practice: WHO, ACC/AHA, ESC, NICE, UpToDate and other leading organisations' recommendations.
${pubCtx||coCtx?"Use the PubMed/Cochrane articles above as additional context.":"Rely on current international guidelines from your knowledge (ACC/AHA, ESC, NICE, WHO etc)."}
After each recommendation — [Grade A/B/C/D]. Numeric source markers [1],[2]…
IMPORTANT: this block is always required — even if no PubMed/Cochrane articles were found.
</WORLD>

<COMPARE>
1–3 sentences: key similarities and differences between MOPH Qatar position and global practice.
If positions align, state this explicitly. This block is always required.
</COMPARE>

<SOURCES>[{"source":"Source name","snippet":"Brief summary.","minzdrav":true/false,"url":"https://...or empty string","type":"minzdrav/pubmed/cochrane/pdf"}]</SOURCES>

<DISCLAIMER>This response is for informational purposes only and does not replace clinical judgement. For current MOPH Qatar guidelines visit moph.gov.qa.</DISCLAIMER>

Minimum 2 MOPH Qatar sources.`}`;
};

// ─── Parse AI response ────────────────────────────────────────────────────────
// ─── HTML sanitizer (XSS protection for printAnswer) ─────────────────────────
const escapeHtml=str=>(str||"")
  .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;").replace(/'/g,"&#039;");

// ─── Grade extractor — fixed: m[7] обращался к символу строки, а не к capture group ──
const extractGrades=txt=>{
  if(!txt)return[];
  // matchAll даёт итератор [fullMatch, captureGroup1] — используем m[1], а не m[7]
  return[...(txt.matchAll(/\[Grade\s+([ABCD])\]/gi))].map(m=>m[1].toUpperCase());
};

const parseAI=text=>{
  const get=tag=>{const m=text.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));return m?m[1].trim():"";};
  let sources=[];try{sources=JSON.parse(get("SOURCES"));}catch{}
  const intro=get("INTRO"),minzdrav=get("MINZDRAV");
  const world=get("WORLD")||"Global practice data was not retrieved in this response. Please try again.";
  const compare=get("COMPARE")||"A comparison of MOPH Qatar and international positions was not generated. Please try again.";
  return{intro,minzdrav,world,compare,sources,disclaimer:get("DISCLAIMER"),
    raw:(!intro&&!minzdrav)?text:"",
    grades:{minzdrav:extractGrades(minzdrav),world:extractGrades(world)}};
};

// ─── MIS / EMIAS export templates ─────────────────────────────────────────────
// Форматы клинических документов для копирования в МИС (ЕМИАС, MedElement и др.)

const MIS_TEMPLATES={
  epicrisis:(msg,date)=>`CLINICAL DISCHARGE SUMMARY (DocGrade AI)
Date: ${date}

CLINICAL RATIONALE:
${(msg.intro||"").replace(/\[Grade [ABCD]\]/g,"").replace(/\[\d+\]/g,"")}

MOPH QATAR GUIDELINES:
${(msg.minzdrav||"").replace(/\[Grade [ABCD]\]/g,"").replace(/\[\d+\]/g,"")}

INTERNATIONAL PRACTICE:
${(msg.world||"").replace(/\[Grade [ABCD]\]/g,"").replace(/\[\d+\]/g,"")}

COMPARISON OF APPROACHES:
${msg.compare||"—"}

REFERENCES:
${(msg.sources||[]).map((s,i)=>`${i+1}. ${s.source}${s.url?" ("+s.url+")":""}`).join("\n")||"—"}

---
Generated by DocGrade AI based on PubMed, Cochrane, MOPH Qatar Clinical Guidelines.
Does not replace clinical judgement. Current guidelines: moph.gov.qa`,

  diagnosis:(msg,date)=>`CLINICAL DIAGNOSIS JUSTIFICATION
Date: ${date}

${(msg.intro||"").replace(/\[Grade [ABCD]\]/g,"").replace(/\[\d+\]/g,"")}

Per MOPH Qatar Clinical Guidelines (moph.gov.qa):
${(msg.minzdrav||"").replace(/\[Grade [ABCD]\]/g,"").replace(/\[\d+\]/g,"")}

International Evidence (PubMed/Cochrane):
${(msg.world||"").replace(/\[Grade [ABCD]\]/g,"").replace(/\[\d+\]/g,"")}

References: ${(msg.sources||[]).slice(0,3).map(s=>s.source).join("; ")||"—"}
[DocGrade AI, ${date}]`,

  vk:(msg,date)=>`CLINICAL COMMITTEE PROTOCOL
Date: ${date}

ISSUE UNDER REVIEW:
[Complete manually]

BACKGROUND (prepared by DocGrade AI):
${(msg.intro||"").replace(/\[Grade [ABCD]\]/g,"").replace(/\[\d+\]/g,"")}

MOPH QATAR POSITION:
${(msg.minzdrav||"").replace(/\[Grade [ABCD]\]/g,"").replace(/\[\d+\]/g,"")}

COMMITTEE DECISION:
[Complete after meeting]

COMMITTEE MEMBERS:
[Signatures]

Reference materials generated automatically by DocGrade AI.
Current MOPH Qatar guidelines: moph.gov.qa`,
};

// MIS Export modal
const MISExportModal=({msg,onClose,th})=>{
  const [format,setFormat]=useState("epicrisis");
  const [copied,setCopied]=useState(false);
  const date=new Date().toLocaleDateString("ru-RU",{day:"2-digit",month:"long",year:"numeric"});
  const text=MIS_TEMPLATES[format]?.(msg,date)||"";

  const copy=()=>{
    navigator.clipboard.writeText(text).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});
  };

  const formats=[
    {id:"epicrisis",  label:"📋 Discharge Summary"},
    {id:"diagnosis",  label:"🔬 Diagnosis Justification"},
    {id:"vk",         label:"⚕️ Committee Protocol"},
  ];

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:1000,
      display:"flex",alignItems:"center",justifyContent:"center",padding:16}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:th.bg,borderRadius:16,width:"100%",maxWidth:640,maxHeight:"85vh",
        display:"flex",flexDirection:"column",boxShadow:"0 24px 60px rgba(0,0,0,.3)"}}>
        {/* Header */}
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${th.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:15,fontWeight:700,color:th.text,fontFamily:"Georgia,serif"}}>📋 Export to HIS / تصدير إلى HIS / Экспорт в МИС</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",
            fontSize:18,color:th.muted,padding:"2px 6px"}}>✕</button>
        </div>
        {/* Format tabs */}
        <div style={{display:"flex",gap:6,padding:"12px 20px",borderBottom:`1px solid ${th.border}`}}>
          {formats.map(f=>(
            <button key={f.id} onClick={()=>setFormat(f.id)}
              style={{padding:"6px 12px",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:600,
                background:format===f.id?"#8A1538":th.bg2,color:format===f.id?"white":th.muted,
                border:`1px solid ${format===f.id?"#8A1538":th.border}`,fontFamily:"system-ui,sans-serif"}}>
              {f.label}
            </button>
          ))}
        </div>
        {/* Text preview */}
        <textarea readOnly value={text}
          style={{flex:1,margin:"12px 20px",background:th.bg2,border:`1px solid ${th.border}`,
            borderRadius:10,padding:"12px 14px",fontSize:12,color:th.text,fontFamily:"monospace",
            lineHeight:1.6,resize:"none",outline:"none",minHeight:260}}/>
        {/* Actions */}
        <div style={{padding:"12px 20px",borderTop:`1px solid ${th.border}`,display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button onClick={()=>printAnswer(msg)}
            style={{background:th.bg2,color:th.muted,border:`1px solid ${th.border}`,borderRadius:8,
              padding:"8px 14px",cursor:"pointer",fontSize:13,fontFamily:"system-ui,sans-serif"}}>
            🖨️ PDF Print
          </button>
          <button onClick={copy}
            style={{background:copied?"#16a34a":"#8A1538",color:"white",border:"none",borderRadius:8,
              padding:"8px 18px",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"system-ui,sans-serif",
              transition:"background .2s"}}>
            {copied?"✅ Copied":"📋 Copy to HIS"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Keep printAnswer for MISExportModal's PDF button
const cleanForPrint = str =>
  escapeHtml((str||"").replace(/\[Grade [ABCD]\]/g,"").replace(/\[\d+\]/g,""));

const printAnswer=msg=>{
  const win=window.open("","_blank");
  if(!win){alert("Please allow pop-ups for PDF export");return;}
  // Sanitize sources defensively
  const srcRows=(msg.sources||[]).map((s,i)=>`<div class="src"><b>${i+1}.</b> ${escapeHtml(s.source||"")} — ${escapeHtml(s.snippet||"")}</div>`).join("");
  const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>DocGrade — Clinical Reference</title>
    <style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;color:#1a1a1a;font-size:14px;line-height:1.7}
    h1{font-size:20px;color:#8A1538;margin-bottom:8px}h2{font-size:14px;font-weight:700;margin:16px 0 6px;text-transform:uppercase;letter-spacing:.5px}
    .mz{background:#fff5f5;border:1px solid #f5b8c0;border-radius:8px;padding:12px 16px;margin-bottom:12px}
    .world{background:#f3faf2;border:1px solid #b3dcb0;border-radius:8px;padding:12px 16px;margin-bottom:12px}
    .src{font-size:11px;color:#555;margin-bottom:4px;padding:4px 8px;background:#f9f9f9;border-radius:4px}
    .disc{font-size:11px;color:#888;margin-top:20px;border-top:1px solid #eee;padding-top:10px}
    @media print{body{margin:20px}}</style></head><body>
    <h1>DocGrade — Clinical Reference (MOPH Qatar)</h1>
    <p style="color:#888;font-size:12px">${new Date().toLocaleDateString("en-GB")}</p>
    ${msg.intro?`<p>${cleanForPrint(msg.intro)}</p>`:""}
    ${msg.minzdrav?`<div class="mz"><h2>🔴 MOPH Qatar</h2><p>${cleanForPrint(msg.minzdrav)}</p></div>`:""}
    ${msg.world?`<div class="world"><h2>🟢 Global Practice</h2><p>${cleanForPrint(msg.world)}</p></div>`:""}
    ${msg.compare?`<p><strong>⚖️ Comparison:</strong> ${cleanForPrint(msg.compare)}</p>`:""}
    ${srcRows?`<div style="margin-top:16px"><h2>References</h2>${srcRows}</div>`:""}
    ${msg.disclaimer?`<div class="disc">⚠️ ${cleanForPrint(msg.disclaimer)}</div>`:""}
    <script>window.onload=()=>{window.print();window.close();}<\/script></body></html>`;
  win.document.write(html);win.document.close();
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── CALCULATORS ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// Годовой риск инсульта при ФП по таблице ESC 2020 (Lip et al.), индекс = CHA₂DS₂-VASc балл
const CHADS_RISK=[0.0,1.3,2.2,3.2,4.0,6.7,9.8,11.2,12.5,15.2];

const CalcCHADS=({th})=>{
  const [v,setV]=useState({chf:0,htn:0,age75:0,dm:0,stroke:0,vasc:0,age6574:0,female:0});
  const score=Object.values(v).reduce((a,b)=>a+b,0);
  const pct=CHADS_RISK[Math.min(score,9)]??15.2;
  const risk=score===0
    ?"~0% — anticoagulants not recommended"
    :score===1
      ?`~${pct}% — рассмотреть антикоагулянты`
      :`~${pct}% — антикоагулянты рекомендованы`;
  const fields=[
    ["chf","Heart Failure",1],["htn","Hypertension",1],
    ["age75","Age ≥75 years",2],["dm","Diabetes Mellitus",1],
    ["stroke","Stroke/TIA history",2],["vasc","Vascular disease",1],
    ["age6574","Age 65–74 years",1],["female","Female sex",1],
  ];
  return(
    <div>
      <h3 style={{fontSize:15,fontWeight:700,color:th.text,marginBottom:4,fontFamily:"system-ui,sans-serif"}}>CHA₂DS₂-VASc</h3>
      <p style={{fontSize:12,color:th.muted,marginBottom:14,fontFamily:"system-ui,sans-serif"}}>Риск инсульта при фибрилляции предсердий</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
        {fields.map(([key,label,pts])=>(
          <label key={key} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",
            background:v[key]?th.bg3:th.bg2,border:`1px solid ${v[key]?"#8A1538":th.border}`,
            borderRadius:8,cursor:"pointer",transition:"all .15s"}}>
            <input type="checkbox" checked={!!v[key]} onChange={e=>setV(x=>({...x,[key]:e.target.checked?pts:0}))} style={{accentColor:"#8A1538"}}/>
            <span style={{fontSize:12.5,color:th.text,fontFamily:"system-ui,sans-serif",flex:1}}>{label}</span>
            <span style={{fontSize:11,fontWeight:700,color:"#8A1538",fontFamily:"monospace"}}>+{pts}</span>
          </label>
        ))}
      </div>
      <div style={{background:score>=2?th.riskHiBg:score===1?th.riskMidBg:th.riskLoBg,
        border:`1.5px solid ${score>=2?"#fca5a5":score===1?"#fde68a":"#86efac"}`,
        borderRadius:10,padding:"14px 16px"}}>
        <div style={{fontSize:26,fontWeight:700,color:score>=2?"#dc2626":score===1?"#d97706":"#16a34a",
          fontFamily:"monospace",marginBottom:4}}>{score}</div>
        <div style={{fontSize:13,fontWeight:600,color:th.text,fontFamily:"system-ui,sans-serif"}}>{risk}</div>
      </div>
    </div>
  );
};

const CalceGFR=({th})=>{
  const [cr,setCr]=useState(""); const [age,setAge]=useState("");
  const [sex,setSex]=useState("male"); const [unit,setUnit]=useState("mgdl"); // "mgdl" | "umol"
  // Convert input to mg/dL for formula
  const crMgdl = ()=>{
    const raw=parseFloat(cr); if(!raw||raw<=0) return null;
    return unit==="umol" ? raw/88.4 : raw;
  };
  const egfr=()=>{
    const s=crMgdl(),a=parseInt(age,10);if(!s||!a)return null;
    const k=sex==="female"?0.7:0.9,alpha=sex==="female"?-0.241:-0.302;
    const ratio=s/k;
    const base=142*Math.pow(ratio<1?ratio:1,alpha)*Math.pow(ratio>1?ratio:1,-1.2)*Math.pow(0.9938,a);
    return Math.round(base*(sex==="female"?1.012:1));
  };
  const val=egfr();
  const stage=val===null?"—":val>=90?"G1 — Normal":val>=60?"G2 — Mildly decreased":val>=45?"G3a — Mildly to moderately decreased":
    val>=30?"G3b — Moderately to severely decreased":val>=15?"G4 — Severely decreased":"G5 — Kidney failure";
  const color=val===null?"#888":val>=60?"#16a34a":val>=30?"#d97706":"#dc2626";
  const inp={background:th.bg2,border:`1px solid ${th.border}`,borderRadius:8,padding:"8px 12px",
    color:th.text,fontSize:14,fontFamily:"system-ui,sans-serif",width:"100%",outline:"none"};
  const crLabel = unit==="umol" ? "Creatinine (µmol/L)" : "Creatinine (mg/dL)";
  const crPlaceholder = unit==="umol" ? "e.g. 97" : "e.g. 1.1";
  const crStep = unit==="umol" ? "1" : "0.01";
  // Show converted value hint
  const rawCr=parseFloat(cr);
  const convertedHint = cr && rawCr
    ? unit==="umol"
      ? `≈ ${(rawCr/88.4).toFixed(2)} мг/дл`
      : `≈ ${Math.round(rawCr*88.4)} мкмоль/л`
    : null;
  return(
    <div>
      <h3 style={{fontSize:15,fontWeight:700,color:th.text,marginBottom:4,fontFamily:"system-ui,sans-serif"}}>eGFR (CKD-EPI 2021)</h3>
      <p style={{fontSize:12,color:th.muted,marginBottom:10,fontFamily:"system-ui,sans-serif"}}>Расчётная скорость клубочковой фильтрации · без расовых коэффициентов</p>
      {/* Unit toggle */}
      <div style={{display:"flex",gap:6,marginBottom:12,alignItems:"center"}}>
        <span style={{fontSize:11.5,color:th.muted,fontFamily:"system-ui,sans-serif"}}>Единицы креатинина:</span>
        {[["mgdl","mg/dL"],["umol","µmol/L"]].map(([u,l])=>(
          <button key={u} onClick={()=>{
            if(u===unit)return;
            // Auto-convert existing value instead of clearing
            const raw=parseFloat(cr);
            if(raw){
              const converted=u==="umol"
                ? (raw*88.4).toFixed(0)        // мг/дл → мкмоль/л
                : (raw/88.4).toFixed(2);        // мкмоль/л → мг/дл
              setCr(converted);
            }
            setUnit(u);
          }}
            style={{padding:"4px 10px",borderRadius:6,cursor:"pointer",fontSize:11.5,fontWeight:600,
              background:unit===u?"#8A1538":th.bg2,color:unit===u?"white":th.muted,
              border:`1px solid ${unit===u?"#8A1538":th.border}`,transition:"all .15s",
              fontFamily:"system-ui,sans-serif"}}>{l}</button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        <div>
          <label style={{fontSize:11.5,color:th.muted,fontFamily:"system-ui,sans-serif",display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span>{crLabel}</span>
            {convertedHint&&<span style={{color:"#8A1538",fontSize:10}}>{convertedHint}</span>}
          </label>
          <input style={inp} type="number" step={crStep} placeholder={crPlaceholder} value={cr} onChange={e=>setCr(e.target.value)}/>
        </div>
        <div>
          <label style={{fontSize:11.5,color:th.muted,fontFamily:"system-ui,sans-serif",display:"block",marginBottom:4}}>Возраст (лет)</label>
          <input style={inp} type="number" placeholder="e.g. 55" value={age} onChange={e=>setAge(e.target.value)}/>
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {["male","female"].map(s=>(
          <button key={s} onClick={()=>setSex(s)} style={{flex:1,padding:"7px",borderRadius:8,cursor:"pointer",
            fontFamily:"system-ui,sans-serif",fontSize:13,fontWeight:600,
            background:sex===s?"#8A1538":th.bg2,color:sex===s?"white":th.muted,
            border:`1px solid ${sex===s?"#8A1538":th.border}`,transition:"all .15s"}}>
            {s==="male"?"Male":"Female"}
          </button>
        ))}
      </div>
      <div style={{background:th.bg2,border:`1.5px solid ${th.border}`,borderRadius:10,padding:"14px 16px"}}>
        <div style={{fontSize:28,fontWeight:700,color,fontFamily:"monospace",marginBottom:4}}>
          {val!==null?`${val} мл/мин/1.73м²`:"—"}
        </div>
        <div style={{fontSize:13,fontWeight:600,color:th.text,fontFamily:"system-ui,sans-serif"}}>{stage}</div>
      </div>
    </div>
  );
};

const CalcGRACE=({th})=>{
  const [f,setF]=useState({age:65,hr:80,sbp:130,cr:1.0,killip:1,st:0,arrest:0,troponin:0});
  const score=()=>{
    // Явный маппинг вместо хрупкого [0,0,20,39,59][f.killip] — защита от NaN при некорректном стейте
    const KILLIP_SCORE={1:0,2:20,3:39,4:59};
    let s=0;
    s+=f.age<40?0:f.age<50?18:f.age<60?36:f.age<70?55:f.age<80?73:91;
    s+=f.hr<50?0:f.hr<70?3:f.hr<90?9:f.hr<110?15:f.hr<150?24:38;
    s+=f.sbp<80?58:f.sbp<100?53:f.sbp<120?43:f.sbp<140?34:f.sbp<160?24:f.sbp<200?10:0;
    s+=f.cr<0.4?1:f.cr<0.8?3:f.cr<1.2?5:f.cr<1.6?7:f.cr<2.0?9:f.cr<4.0?15:20;
    s+=KILLIP_SCORE[f.killip]??0;
    if(f.st)s+=28;if(f.arrest)s+=43;if(f.troponin)s+=15;
    return s;
  };
  const sc=score();
  const risk=sc<109?"Low (<1%) — early discharge possible":sc<140?"Intermediate (1–3%) — standard monitoring":"High (>3%) — early invasive strategy";
  const inp=(key,label,min,max,step=1)=>(
    <div>
      <label style={{fontSize:11,color:th.muted,fontFamily:"system-ui,sans-serif",marginBottom:3,display:"block"}}>{label}</label>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <input type="range" min={min} max={max} step={step} value={f[key]}
          onChange={e=>setF(x=>({...x,[key]:parseFloat(e.target.value)}))}
          style={{flex:1,accentColor:"#8A1538"}}/>
        <input type="number" min={min} max={max} step={step} value={f[key]}
          onChange={e=>{const v=parseFloat(e.target.value);if(!isNaN(v)&&v>=min&&v<=max)setF(x=>({...x,[key]:v}));}}
          style={{width:58,background:th.bg2,border:`1px solid ${th.border}`,borderRadius:6,
            padding:"3px 6px",fontSize:12,color:th.text,fontFamily:"monospace",outline:"none",textAlign:"center"}}/>
      </div>
    </div>
  );
  return(
    <div>
      <h3 style={{fontSize:15,fontWeight:700,color:th.text,marginBottom:4,fontFamily:"system-ui,sans-serif"}}>GRACE 2.0</h3>
      <p style={{fontSize:12,color:th.muted,marginBottom:14,fontFamily:"system-ui,sans-serif"}}>Риск внутрибольничной смерти при ОКС</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        {inp("age","Age (years)",18,100)} {inp("hr","HR (bpm)",20,200)}
        {inp("sbp","SBP (mmHg)",50,250)} {inp("cr","Creatinine (mg/dL)",0.4,6,0.1)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:12}}>
        {[["Killip I",1],["Killip II",2],["Killip III",3],["Killip IV",4]].map(([l,v])=>(
          <button key={v} onClick={()=>setF(x=>({...x,killip:v}))}
            style={{padding:"6px",borderRadius:7,cursor:"pointer",fontSize:12,
              background:f.killip===v?"#8A1538":th.bg2,color:f.killip===v?"white":th.muted,
              border:`1px solid ${f.killip===v?"#8A1538":th.border}`,fontFamily:"system-ui,sans-serif"}}>{l}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {[["st","ST depression"],["arrest","Cardiac arrest"],["troponin","Troponin +"]].map(([k,l])=>(
          <label key={k} style={{display:"flex",alignItems:"center",gap:5,flex:1,padding:"7px 10px",
            background:f[k]?th.bg3:th.bg2,border:`1px solid ${f[k]?"#8A1538":th.border}`,
            borderRadius:8,cursor:"pointer",fontSize:11.5,color:th.text,fontFamily:"system-ui,sans-serif"}}>
            <input type="checkbox" checked={!!f[k]} onChange={e=>setF(x=>({...x,[k]:e.target.checked?1:0}))} style={{accentColor:"#8A1538"}}/>{l}
          </label>
        ))}
      </div>
      <div style={{background:sc>=140?th.riskHiBg:sc>=109?th.riskMidBg:th.riskLoBg,
        border:`1.5px solid ${sc>=140?"#fca5a5":sc>=109?"#fde68a":"#86efac"}`,borderRadius:10,padding:"14px 16px"}}>
        <div style={{fontSize:26,fontWeight:700,fontFamily:"monospace",
          color:sc>=140?"#dc2626":sc>=109?"#d97706":"#16a34a",marginBottom:4}}>{sc}</div>
        <div style={{fontSize:13,fontWeight:600,color:th.text,fontFamily:"system-ui,sans-serif"}}>{risk}</div>
      </div>
    </div>
  );
};

const CalcAPGAR=({th})=>{
  const cats=[
    {key:"color",label:"Skin colour",opts:["Blue/pale","Body pink","Fully pink"]},
    {key:"pulse",label:"Heart rate",opts:["Absent","< 100 bpm","> 100 bpm"]},
    {key:"reflex",label:"Reflexes (on catheterisation)",opts:["No response","Grimace","Cough/sneeze"]},
    {key:"muscle",label:"Muscle tone",opts:["Flaccid","Some flexion","Active motion"]},
    {key:"breath",label:"Breathing",opts:["Absent","Irregular/weak cry","Strong cry"]},
  ];
  const [v,setV]=useState({color:0,pulse:0,reflex:0,muscle:0,breath:0});
  const score=Object.values(v).reduce((a,b)=>a+b,0);
  const interp=score>=7?"7–10 — Normal condition":score>=4?"4–6 — Moderate depression. Assistance required.":"0–3 — Severe depression. Resuscitation.";
  return(
    <div>
      <h3 style={{fontSize:15,fontWeight:700,color:th.text,marginBottom:4,fontFamily:"system-ui,sans-serif"}}>Шкала Апгар</h3>
      <p style={{fontSize:12,color:th.muted,marginBottom:14,fontFamily:"system-ui,sans-serif"}}>Оценка состояния новорождённого (1 и 5 мин)</p>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
        {cats.map(cat=>(
          <div key={cat.key}>
            <div style={{fontSize:12,fontWeight:600,color:th.muted,marginBottom:5,fontFamily:"system-ui,sans-serif"}}>{cat.label}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
              {cat.opts.map((opt,score_val)=>(
                <button key={`${cat.key}-${score_val}`} onClick={()=>setV(x=>({...x,[cat.key]:score_val}))}
                  style={{padding:"6px 8px",borderRadius:7,cursor:"pointer",fontSize:11,lineHeight:1.35,
                    background:v[cat.key]===score_val?"#8A1538":th.bg2,
                    color:v[cat.key]===score_val?"white":th.muted,
                    border:`1px solid ${v[cat.key]===score_val?"#8A1538":th.border}`,
                    fontFamily:"system-ui,sans-serif",transition:"all .15s"}}>
                  {opt}<br/><strong>{score_val}</strong>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{background:score>=7?th.riskLoBg:score>=4?th.riskMidBg:th.riskHiBg,
        border:`1.5px solid ${score>=7?"#86efac":score>=4?"#fde68a":"#fca5a5"}`,borderRadius:10,padding:"14px 16px"}}>
        <div style={{fontSize:30,fontWeight:700,fontFamily:"monospace",
          color:score>=7?"#16a34a":score>=4?"#d97706":"#dc2626",marginBottom:4}}>{score}/10</div>
        <div style={{fontSize:13,fontWeight:600,color:th.text,fontFamily:"system-ui,sans-serif"}}>{interp}</div>
      </div>
    </div>
  );
};

const CalculatorsSection=({th})=>{
  const [active,setActive]=useState("chads");
  const tabs=[["chads","CHA₂DS₂-VASc"],["egfr","eGFR"],["grace","GRACE"],["apgar","Апгар"]];
  return(
    <div style={{maxWidth:700,margin:"0 auto",paddingTop:20}}>
      <h2 style={{fontSize:18,fontWeight:700,color:th.text,marginBottom:16,fontFamily:"Georgia,serif"}}>🧮 Clinical Calculators / الآلات الحاسبة السريرية</h2>
      <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
        {tabs.map(([id,label])=>(
          <button key={id} onClick={()=>setActive(id)}
            style={{padding:"7px 14px",borderRadius:8,cursor:"pointer",fontSize:12.5,fontWeight:600,
              background:active===id?"#8A1538":th.bg2,color:active===id?"white":th.muted,
              border:`1px solid ${active===id?"#8A1538":th.border}`,transition:"all .15s",
              fontFamily:"system-ui,sans-serif"}}>{label}</button>
        ))}
      </div>
      <div style={{background:th.bg2,border:`1px solid ${th.border}`,borderRadius:14,padding:"20px 22px"}}>
        {active==="chads"&&<CalcCHADS th={th}/>}
        {active==="egfr"&&<CalceGFR th={th}/>}
        {active==="grace"&&<CalcGRACE th={th}/>}
        {active==="apgar"&&<CalcAPGAR th={th}/>}
      </div>
    </div>
  );
};

// ─── Drug Interactions ────────────────────────────────────────────────────────
// SEVERITY_LABELS: все поля — обычные значения (не функции).
// bg и border — функции от th, c — строка цвета текста.
const SEVERITY={
  high:{c:"#dc2626",border:()=>"1.5px solid #fca5a5",bg:th=>th.riskHiBg},
  medium:{c:"#d97706",border:()=>"1px solid #fde68a",  bg:th=>th.riskMidBg},
  low: {c:"#16a34a",border:()=>"1px solid #86efac",  bg:th=>th.riskLoBg},
  // Russian aliases (legacy / fallback)
  высокая:{c:"#dc2626",border:()=>"1.5px solid #fca5a5",bg:th=>th.riskHiBg},
  средняя:{c:"#d97706",border:()=>"1px solid #fde68a",  bg:th=>th.riskMidBg},
  низкая: {c:"#16a34a",border:()=>"1px solid #86efac",  bg:th=>th.riskLoBg},
};
const getSev=key=>SEVERITY[key]||SEVERITY.low;

const DrugSection=({th})=>{
  const [drugs,setDrugs]=useState("");
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [filter,setFilter]=useState("all"); // "all" | "high" | "medium" | "low"
  const [showAlts,setShowAlts]=useState(null); // drug name for which alternatives are shown

  const check=async()=>{
    if(!drugs.trim()||loading)return;setLoading(true);setResult(null);setFilter("all");setShowAlts(null);
    try{
      const text=await callAI({maxTokens:1400,messages:[{role:"user",content:`Check clinically significant drug interactions for: ${drugs}

Respond in English strictly in this format:
<INTERACTIONS>
[{"drugA":"Drug A","drugB":"Drug B","type":"pharmacodynamic/pharmacokinetic","severity":"high/medium/low","description":"mechanism and risk description","recommendation":"what the clinician should do","alternative":"safe INN alternative available in Qatar (or null)"}]
</INTERACTIONS>
<SUMMARY>Overall summary: what needs monitoring or adjustment.</SUMMARY>`}]});
      // Parse interactions JSON
      let pairs=[];
      const rawInter=text.match(/<INTERACTIONS>([\s\S]*?)<\/INTERACTIONS>/)?.[1]?.trim()||"";
      if(rawInter){
        try{pairs=JSON.parse(rawInter.replace(/^```(?:json)?|```$/gm,"").replace(/,\s*([}\]])/g,"$1"));}
        catch{pairs=[];}
      }
      const sum=text.match(/<SUMMARY>([\s\S]*?)<\/SUMMARY>/)?.[1]?.trim()||"";
      setResult({pairs,sum,raw:pairs.length===0?rawInter:""});
    }catch(e){setResult({pairs:[],sum:"",raw:`⚠️ ${e?.message||"Ошибка"}. Попробуйте снова.`});}
    finally{setLoading(false);}
  };

  const visiblePairs=(result?.pairs||[]).filter(p=>filter==="all"||p.severity===filter);
  const severityCounts=(result?.pairs||[]).reduce((a,p)=>{a[p.severity]=(a[p.severity]||0)+1;return a;},{});

  return(
    <div style={{maxWidth:700,margin:"0 auto",paddingTop:20}}>
      <h2 style={{fontSize:18,fontWeight:700,color:th.text,marginBottom:6,fontFamily:"Georgia,serif"}}>💊 Drug Interaction Checker / فحص التفاعلات الدوائية</h2>
      <p style={{fontSize:13,color:th.muted,marginBottom:16,fontFamily:"system-ui,sans-serif"}}>
        Enter medications separated by commas — get interactions with severity ratings and Qatar-available alternatives
      </p>
      <textarea value={drugs} onChange={e=>setDrugs(e.target.value)}
        placeholder="e.g.: warfarin, aspirin, omeprazole, amiodarone, metformin"
        style={{width:"100%",background:th.bg2,border:`1.5px solid ${th.border}`,borderRadius:10,
          padding:"12px 14px",fontSize:14,color:th.text,fontFamily:"system-ui,sans-serif",
          resize:"vertical",minHeight:80,outline:"none",lineHeight:1.5,marginBottom:10}}/>
      <button onClick={check} disabled={!drugs.trim()||loading}
        style={{background:"#8A1538",color:"white",border:"none",borderRadius:9,padding:"10px 20px",
          cursor:!drugs.trim()||loading?"not-allowed":"pointer",fontSize:14,fontWeight:600,
          fontFamily:"system-ui,sans-serif",opacity:!drugs.trim()||loading?.5:1,transition:"all .15s"}}>
        {loading?"Analysing…":"Check Interactions"}
      </button>

      {result&&(
        <div style={{marginTop:16}}>
          {/* Severity filter bar */}
          {result.pairs.length>0&&(
            <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{fontSize:11,color:th.muted,fontFamily:"system-ui,sans-serif"}}>Filter / تصفية:</span>
              {["all","high","medium","low"].map(f=>{
                const cnt=f==="all"?result.pairs.length:(severityCounts[f]||0);
                if(f!=="all"&&!cnt)return null;
                const active=filter===f;
                const c={high:"#dc2626",medium:"#d97706",low:"#16a34a",all:"#8A1538"}[f];
                return(
                  <button key={f} onClick={()=>setFilter(f)}
                    style={{padding:"4px 10px",borderRadius:6,cursor:"pointer",fontSize:11.5,fontWeight:600,
                      background:active?c:"transparent",color:active?"white":c,
                      border:`1.5px solid ${c}`,fontFamily:"system-ui,sans-serif",transition:"all .15s"}}>
                    {f} {cnt>0&&`(${cnt})`}
                  </button>
                );
              })}
            </div>
          )}

          {/* Interaction cards */}
          {visiblePairs.map((p,i)=>{
            const sv=getSev(p.severity);
            return(
              <div key={i} style={{background:sv.bg(th),border:sv.border(),borderRadius:12,padding:"13px 15px",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                  <span style={{fontSize:13,fontWeight:700,color:th.text,fontFamily:"system-ui,sans-serif"}}>
                    {p.drugA} <span style={{color:th.muted}}>+</span> {p.drugB}
                  </span>
                  <span style={{fontSize:10.5,fontWeight:700,padding:"2px 8px",borderRadius:5,
                    background:"transparent",border:sv.border(),color:sv.c,fontFamily:"system-ui,sans-serif"}}>
                    {p.severity||"—"}
                  </span>
                  {p.type&&<span style={{fontSize:10,color:th.muted,fontFamily:"system-ui,sans-serif"}}>{p.type}</span>}
                </div>
                <p style={{fontSize:12.5,color:th.text,fontFamily:"system-ui,sans-serif",lineHeight:1.65,marginBottom:6}}>{p.description}</p>
                {p.recommendation&&(
                  <div style={{fontSize:12,color:sv.c,fontWeight:600,fontFamily:"system-ui,sans-serif",marginBottom:6}}>
                    → {p.recommendation}
                  </div>
                )}
                {/* Qatar alternatives */}
                {p.alternative&&p.alternative!=="null"&&(
                  <div>
                    <button onClick={()=>setShowAlts(showAlts===`${i}`?null:`${i}`)}
                      style={{background:"none",border:`1px solid ${th.border}`,borderRadius:6,padding:"3px 9px",
                        cursor:"pointer",fontSize:11,color:th.muted,fontFamily:"system-ui,sans-serif"}}>
                      💊 {showAlts===`${i}`?"Hide":"Show"} Qatar alternatives
                    </button>
                    {showAlts===`${i}`&&(
                      <div style={{marginTop:8,background:th.bg,border:`1px solid ${th.border}`,borderRadius:8,padding:"10px 12px"}}>
                        <div style={{fontSize:11,fontWeight:700,color:th.muted,textTransform:"uppercase",
                          letterSpacing:".5px",marginBottom:6,fontFamily:"system-ui,sans-serif"}}>
                          Safe alternatives (INN / brands in Qatar)
                        </div>
                        <p style={{fontSize:12.5,color:th.text,fontFamily:"system-ui,sans-serif",lineHeight:1.6}}>{p.alternative}</p>
                        <div style={{marginTop:8,padding:"6px 10px",background:th.bg2,borderRadius:6,
                          fontSize:10.5,color:th.muted,fontFamily:"system-ui,sans-serif"}}>
                          ℹ️ Formulary availability via MOPH Qatar Drug Database / قاعدة بيانات الأدوية
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Raw fallback */}
          {result.raw&&(
            <div style={{background:th.bg2,border:`1px solid ${th.border}`,borderRadius:12,padding:"16px",marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:".5px",
                marginBottom:10,fontFamily:"system-ui,sans-serif"}}>Interactions</div>
              <div style={{fontSize:13.5,color:th.text,lineHeight:1.75,fontFamily:"system-ui,sans-serif",whiteSpace:"pre-wrap"}}>{result.raw}</div>
            </div>
          )}

          {/* Summary */}
          {result.sum&&(
            <div style={{background:th.riskMidBg,border:"1px solid #fde68a",borderRadius:10,padding:"12px 14px"}}>
              <strong style={{fontSize:12,color:"#92400e",fontFamily:"system-ui,sans-serif"}}>⚠️ Резюме: </strong>
              <span style={{fontSize:13,color:th.text,fontFamily:"system-ui,sans-serif"}}>{result.sum}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── DDx Section ──────────────────────────────────────────────────────────────
const DDxSection=({th})=>{
  const [symp,setSymp]=useState("");const [result,setResult]=useState(null);const [loading,setLoading]=useState(false);
  const analyze=async()=>{
    if(!symp.trim()||loading)return;setLoading(true);setResult(null);
    try{
      const text=await callAI({maxTokens:1200,messages:[{role:"user",content:`Build a differential diagnosis for this clinical presentation: ${symp}

Respond in English ONLY in JSON format:
<DDX>
[
  {"diagnosis":"Diagnosis","probability":"high/medium/low","reasoning":"Brief rationale","keyFindings":["Key finding 1","Finding 2"],"nextSteps":"Next diagnostic steps"},
  ...
]
</DDX>
<URGENT>Signs requiring immediate action (if any), otherwise — "No emergency findings"</URGENT>`}]});
      let ddx=[];
      const rawDdx=text.match(/<DDX>([\s\S]*?)<\/DDX>/)?.[1]||"";
      if(rawDdx){
        try{
          const clean=rawDdx.trim()
            .replace(/^```(?:json)?|```$/gm,"")
            .replace(/,\s*([}\]])/g,"$1")
            .replace(/[\u0000-\u001F]/g," ")
            .trim();
          const parsed=JSON.parse(clean);
          ddx=Array.isArray(parsed)?parsed:(parsed?.diagnoses||[]);
        }catch(e1){
          try{
            const objs=[];let depth=0,start=-1;
            for(let i=0;i<rawDdx.length;i++){
              if(rawDdx[i]==="{"){if(depth===0)start=i;depth++;}
              else if(rawDdx[i]==="}"){depth--;if(depth===0&&start>=0){
                try{const o=JSON.parse(rawDdx.slice(start,i+1).replace(/,\s*}/g,"}"));
                  if(o.diagnosis)objs.push(o);}catch{}
                start=-1;}}
            }
            ddx=objs;
          }catch{ddx=[];}
        }
      }
      if(!ddx.length){ddx=[{diagnosis:"Could not parse response structure",probability:"low",reasoning:text.slice(0,300),keyFindings:[],nextSteps:"Try rephrasing the query"}];}
      const urgent=text.match(/<URGENT>([\s\S]*?)<\/URGENT>/)?.[1]?.trim()||"";
      setResult({ddx,urgent});
    }catch(e){setResult({ddx:[],urgent:`⚠️ ${e?.message||"Error"}. Please try again.`});}
    finally{setLoading(false);}
  };
  const pColors={
    high:  {bg:th.riskHiBg,b:"#fca5a5",c:"#dc2626"},
    medium:{bg:th.riskMidBg,b:"#fde68a",c:"#d97706"},
    low:   {bg:th.riskLoBg,b:"#86efac",c:"#16a34a"},
    // Russian fallbacks
    высокая:{bg:th.riskHiBg,b:"#fca5a5",c:"#dc2626"},
    средняя:{bg:th.riskMidBg,b:"#fde68a",c:"#d97706"},
    низкая: {bg:th.riskLoBg,b:"#86efac",c:"#16a34a"},
  };
  return(
    <div style={{maxWidth:750,margin:"0 auto",paddingTop:20}}>
      <h2 style={{fontSize:18,fontWeight:700,color:th.text,marginBottom:6,fontFamily:"Georgia,serif"}}>🔍 Differential Diagnosis / التشخيص التفريقي</h2>
      <p style={{fontSize:13,color:th.muted,marginBottom:16,fontFamily:"system-ui,sans-serif"}}>Describe symptoms, history, and examination findings</p>
      <textarea value={symp} onChange={e=>setSymp(e.target.value)}
        placeholder="e.g.: 55-year-old male, sudden chest pain radiating to left arm, diaphoresis, HR 110, BP 90/60, ECG — ST elevation V1-V4"
        style={{width:"100%",background:th.bg2,border:`1.5px solid ${th.border}`,borderRadius:10,
          padding:"12px 14px",fontSize:14,color:th.text,fontFamily:"system-ui,sans-serif",
          resize:"vertical",minHeight:90,outline:"none",lineHeight:1.5,marginBottom:10}}/>
      <button onClick={analyze} disabled={!symp.trim()||loading}
        style={{background:"#8A1538",color:"white",border:"none",borderRadius:9,padding:"10px 20px",
          cursor:!symp.trim()||loading?"not-allowed":"pointer",fontSize:14,fontWeight:600,
          fontFamily:"system-ui,sans-serif",opacity:!symp.trim()||loading?.5:1}}>
        {loading?"Analysing…":"Build DDx"}
      </button>
      {result&&(
        <div style={{marginTop:16}}>
          {result.urgent&&result.urgent!=="No emergency findings"&&(
            <div style={{background:th.riskHiBg,border:"1.5px solid #fca5a5",borderRadius:10,padding:"12px 14px",marginBottom:12,display:"flex",gap:8}}>
              <span style={{fontSize:18}}>🚨</span>
              <div><strong style={{fontSize:12.5,color:"#dc2626",fontFamily:"system-ui,sans-serif"}}>EMERGENCY / طارئ</strong>
                <p style={{fontSize:13,color:th.text,fontFamily:"system-ui,sans-serif",marginTop:2}}>{result.urgent}</p></div>
            </div>
          )}
          {result.ddx.map((item,i)=>{
            const p=pColors[item.probability]||pColors.low;
            return(
              <div key={i} style={{background:p.bg,border:`1.5px solid ${p.b}`,borderRadius:12,padding:"14px 16px",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <span style={{fontSize:18,fontWeight:700,color:p.c,fontFamily:"monospace"}}>{i+1}</span>
                  <div style={{flex:1}}>
                    <span style={{fontSize:15,fontWeight:700,color:th.text,fontFamily:"system-ui,sans-serif"}}>{item.diagnosis}</span>
                  </div>
                  <span style={{fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:5,background:p.b,color:p.c,fontFamily:"system-ui,sans-serif"}}>
                    {item.probability}
                  </span>
                </div>
                <p style={{fontSize:13,color:th.muted,fontFamily:"system-ui,sans-serif",marginBottom:8}}>{item.reasoning}</p>
                {item.keyFindings?.length>0&&(
                  <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:6}}>
                    {item.keyFindings.map((f,fi)=>(
                      <span key={fi} style={{fontSize:11,background:th.bg2,border:`1px solid ${th.border}`,
                        borderRadius:5,padding:"2px 7px",color:th.text,fontFamily:"system-ui,sans-serif"}}>{f}</span>
                    ))}
                  </div>
                )}
                {item.nextSteps&&<p style={{fontSize:12,color:p.c,fontFamily:"system-ui,sans-serif",fontWeight:600}}>→ {item.nextSteps}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Exam Mode (Режим осмотра) ───────────────────────────────────────────────
// Шаблоны структурированной записи осмотра
const EXAM_TEMPLATES=[
  {id:"primary",  label:"Primary Exam / الفحص الأولي",   icon:"🏥"},
  {id:"secondary",label:"Follow-up / متابعة",   icon:"🔄"},
  {id:"discharge",label:"Discharge / خروج",            icon:"🏠"},
  {id:"consult",  label:"Consultation / استشارة",       icon:"👨‍⚕️"},
  {id:"emergency",label:"Emergency / طوارئ",  icon:"🚑"},
];

// Промпты структурирования для каждого шаблона
const EXAM_PROMPT=(template,transcript)=>{
  const date=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"});
  const baseInstruction=`You are a medical scribe. Structure the following doctor dictation into a standard medical record format.
Correct slips, add punctuation, expand obvious abbreviations.
Preserve the language of the original dictation. Date: ${date}.

DOCTOR DICTATION:
${transcript}`;

  const formats={
    primary:`${baseInstruction}

Ответь в формате:
<CARD>
PRIMARY EXAMINATION
Дата: ${date}

COMPLAINTS:
[Жалобы пациента]

HISTORY OF PRESENT ILLNESS:
[История текущего заболевания]

PAST MEDICAL HISTORY:
[Перенесённые заболевания, операции, аллергии, вредные привычки]

OBJECTIVE STATUS:
General condition: [satisfactory/moderate/severe]
АД: [значение] мм рт.ст.  ЧСС: [значение] уд/мин  ЧДД: [значение] /мин  t°: [значение]°C
[Описание по системам органов]

PRELIMINARY DIAGNOSIS:
[Diagnosis with ICD-10 code]

INVESTIGATION PLAN:
[Ordered investigations]

TREATMENT PLAN:
[Prescriptions]

Doctor: _________________
</CARD>`,

    secondary:`${baseInstruction}

Ответь в формате:
<CARD>
FOLLOW-UP EXAMINATION
Дата: ${date}

CURRENT COMPLAINTS:
[Current complaints]

PROGRESS:
[Changes since last visit]

OBJECTIVE STATUS:
АД: [значение]  ЧСС: [значение]  t°: [значение]°C
[Examination findings]

TREATMENT EFFICACY:
[Response to treatment]

TREATMENT ADJUSTMENT:
[Changes to prescriptions or "Continue treatment"]

DIAGNOSIS:
[Refined diagnosis]

Doctor: _________________
</CARD>`,

    discharge:`${baseInstruction}

Ответь в формате:
<CARD>
DISCHARGE SUMMARY
Discharge date: ${date}

FINAL DIAGNOSIS:
[Diagnosis with ICD-10 code]

TREATMENT PROVIDED:
[Treatment during hospitalisation]

CONDITION AT DISCHARGE:
[Objective status]

INVESTIGATION RESULTS:
[Key lab and investigation findings]

RECOMMENDATIONS:
1. [Medications with doses and duration]
2. [Activity and diet]
3. [Specialist follow-up]
4. [Control investigations]

Follow-up: [date of next visit or "As needed"]

Doctor: _________________
</CARD>`,

    consult:`${baseInstruction}

Ответь в формате:
<CARD>
SPECIALIST CONSULTATION
Дата: ${date}

REASON FOR CONSULTATION:
[Reason for referral]

EXAMINATION FINDINGS:
[Objective status по профилю специальности]

CONCLUSION:
[Clinical conclusion and diagnosis]

RECOMMENDATIONS:
[Treatment and follow-up recommendations]

Specialist: _________________
</CARD>`,

    emergency:`${baseInstruction}

Ответь в формате:
<CARD>
EMERGENCY / ADMISSION RECORD
Date and time: ${date}

CHIEF COMPLAINT:
[Complaints / reason for call]

HISTORY:
[Circumstances and onset time]

OBJECTIVE:
Состояние: [satisfactory/moderate/severe/крайне тяжёлое]
АД: [значение]  ЧСС: [значение]  SpO2: [значение]%  ГКС: [значение]
[Examination findings]

DIAGNOSIS:
[Preliminary ICD-10 diagnosis]

TREATMENT PROVIDED:
[Procedures performed and medications given]

OUTCOME:
[Hospitalised / Discharged / Referred to...]

Doctor/Paramedic: _________________
</CARD>`,
  };
  return formats[template]||formats.primary;
};

const ExamSection=({th})=>{
  const [isRecording,setIsRecording]=useState(false);
  const [transcript,setTranscript]=useState("");     // накопленный текст диктовки
  const [interimText,setInterimText]=useState("");   // текущий нераспознанный фрагмент
  const [template,setTemplate]=useState("primary");
  const [structured,setStructured]=useState("");
  const [loading,setLoading]=useState(false);
  const [copied,setCopied]=useState(false);
  const [error,setError]=useState("");
  const [elapsed,setElapsed]=useState(0);            // секунды записи
  const [wordCount,setWordCount]=useState(0);

  const recognitionRef=useRef(null);
  const timerRef=useRef(null);
  const transcriptRef=useRef("");                    // всегда актуальный ref для onresult

  // Обновляем ref синхронно с state
  useEffect(()=>{transcriptRef.current=transcript;},[transcript]);
  useEffect(()=>{setWordCount(transcript.trim().split(/\s+/).filter(Boolean).length);},[transcript]);

  const startRecording=()=>{
    const R=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!R){setError("Your browser does not support speech recognition. Use Chrome or Edge.");return;}
    setError("");setStructured("");
    const r=new R();
    r.lang="ru-RU";
    r.continuous=true;           // непрерывная запись
    r.interimResults=true;       // промежуточные результаты в реальном времени
    r.maxAlternatives=1;

    r.onresult=e=>{
      let interim="";
      let newFinal="";
      for(let i=e.resultIndex;i<e.results.length;i++){
        if(e.results[i].isFinal){
          newFinal+=e.results[i][0].transcript+" ";
        }else{
          interim+=e.results[i][0].transcript;
        }
      }
      if(newFinal){
        setTranscript(prev=>{
          const updated=prev+newFinal;
          transcriptRef.current=updated;
          return updated;
        });
      }
      setInterimText(interim);
    };

    r.onerror=e=>{
      // network/no-speech — не останавливаем запись, просто логируем
      if(e.error==="no-speech")return;
      if(e.error==="network"){setError("Ошибка сети при распознавании. Проверьте подключение.");return;}
      setError("Ошибка распознавания: "+e.error);
      stopRecording();
    };

    r.onend=()=>{
      // Автоматически перезапускаем пока isRecording=true (SpeechRecognition останавливается каждые ~60с)
      if(recognitionRef.current&&isRecordingRef.current){
        try{recognitionRef.current.start();}catch{}
      }
    };

    recognitionRef.current=r;
    isRecordingRef.current=true;
    r.start();
    setIsRecording(true);
    setElapsed(0);
    timerRef.current=setInterval(()=>setElapsed(p=>p+1),1000);
  };

  // ref для isRecording чтобы onend мог его читать без stale closure
  const isRecordingRef=useRef(false);

  const stopRecording=()=>{
    isRecordingRef.current=false;
    if(recognitionRef.current){try{recognitionRef.current.stop();}catch{}}
    recognitionRef.current=null;
    clearInterval(timerRef.current);
    setIsRecording(false);
    setInterimText("");
  };

  // Cleanup on unmount
  useEffect(()=>()=>{stopRecording();},[]);

  const structureText=async()=>{
    if(!transcript.trim()||loading)return;
    setLoading(true);setStructured("");
    try{
      const raw=await callAI({
        maxTokens:2000,
        messages:[{role:"user",content:EXAM_PROMPT(template,transcript)}],
      });
      const match=raw.match(/<CARD>([\s\S]*?)<\/CARD>/i);
      setStructured(match?match[1].trim():raw.trim());
    }catch(e){setError("Ошибка структурирования: "+(e?.message||"неизвестная"));}
    finally{setLoading(false);}
  };

  const copyResult=()=>{
    navigator.clipboard.writeText(structured)
      .then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2500);});
  };

  const clearAll=()=>{
    stopRecording();
    setTranscript("");setInterimText("");setStructured("");setError("");setElapsed(0);setWordCount(0);
  };

  const fmtTime=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  return(
    <div style={{maxWidth:800,margin:"0 auto",paddingTop:20,paddingBottom:40}}>

      {/* Header */}
      <h2 style={{fontSize:18,fontWeight:700,color:th.text,marginBottom:6,fontFamily:"Georgia,serif"}}>
        🎙️ Exam Mode / وضع الفحص
      </h2>
      <p style={{fontSize:13,color:th.muted,marginBottom:20,fontFamily:"system-ui,sans-serif",lineHeight:1.6}}>
        Диктуйте во время осмотра — система слушает непрерывно, затем одним нажатием
        структурирует сказанное в готовый шаблон карты для вклейки в МИС.
      </p>

      {/* Template selector */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,color:th.muted,textTransform:"uppercase",
          letterSpacing:".5px",marginBottom:8,fontFamily:"system-ui,sans-serif"}}>Шаблон записи</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {EXAM_TEMPLATES.map(t=>(
            <button key={t.id} onClick={()=>{if(!isRecording){setTemplate(t.id);setStructured("");}}}
              disabled={isRecording}
              style={{padding:"6px 12px",borderRadius:8,cursor:isRecording?"not-allowed":"pointer",
                fontSize:12,fontWeight:600,
                background:template===t.id?"#8A1538":th.bg2,
                color:template===t.id?"white":th.muted,
                border:`1px solid ${template===t.id?"#8A1538":th.border}`,
                fontFamily:"system-ui,sans-serif",opacity:isRecording?.6:1,transition:"all .15s"}}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Record button + timer */}
      <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>
        <button onClick={isRecording?stopRecording:startRecording}
          style={{display:"flex",alignItems:"center",gap:10,padding:"13px 24px",
            borderRadius:12,border:"none",cursor:"pointer",fontSize:15,fontWeight:700,
            fontFamily:"system-ui,sans-serif",transition:"all .2s",
            background:isRecording?"#dc2626":"#16a34a",color:"white",
            boxShadow:isRecording?"0 0 0 4px rgba(220,38,38,.25)":"0 0 0 4px rgba(22,163,74,.15)"}}>
          {isRecording?(
            <>
              <span style={{width:14,height:14,borderRadius:2,background:"white",display:"inline-block"}}/>
              Stop Recording / إيقاف
            </>
          ):(
            <>
              <span style={{width:14,height:14,borderRadius:"50%",background:"white",display:"inline-block"}}/>
              Start Dictation / ابدأ
            </>
          )}
        </button>

        {isRecording&&(
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {/* Пульс-индикатор */}
            <div style={{display:"flex",gap:3}}>
              {[0,1,2,3].map(i=>(
                <div key={i} style={{width:4,borderRadius:2,background:"#dc2626",
                  height:10+Math.sin(i)*8,
                  animation:`bd 1.2s ease-in-out ${i*0.15}s infinite`}}/>
              ))}
            </div>
            <span style={{fontSize:14,fontWeight:700,color:"#dc2626",fontFamily:"monospace"}}>
              {fmtTime(elapsed)}
            </span>
            <span style={{fontSize:11.5,color:th.muted,fontFamily:"system-ui,sans-serif"}}>
              · {wordCount} слов
            </span>
          </div>
        )}

        {!isRecording&&(transcript||structured)&&(
          <button onClick={clearAll}
            style={{padding:"7px 14px",borderRadius:8,border:`1px solid ${th.border}`,
              background:"none",cursor:"pointer",fontSize:12,color:th.muted,
              fontFamily:"system-ui,sans-serif"}}>
            🗑 Очистить
          </button>
        )}
      </div>

      {error&&(
        <div style={{background:th.riskHiBg,border:"1px solid #fca5a5",borderRadius:8,
          padding:"10px 14px",marginBottom:14,fontSize:12.5,color:"#dc2626",
          fontFamily:"system-ui,sans-serif"}}>⚠️ {error}</div>
      )}

      {/* Live transcript */}
      <div style={{marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
          <div style={{fontSize:11,fontWeight:700,color:th.muted,textTransform:"uppercase",
            letterSpacing:".5px",fontFamily:"system-ui,sans-serif"}}>
            Dictation {wordCount>0&&`· ${wordCount} words`}
          </div>
          {transcript&&!isRecording&&(
            <span style={{fontSize:11,color:"#16a34a",fontFamily:"system-ui,sans-serif",fontWeight:600}}>
              ✓ Запись завершена
            </span>
          )}
        </div>
        <div
          onClick={()=>{if(!isRecording&&!transcript)startRecording();}}
          style={{minHeight:120,background:th.bg2,border:`1.5px solid ${isRecording?"#dc2626":th.border}`,
            borderRadius:12,padding:"14px 16px",fontSize:13.5,color:th.text,
            fontFamily:"system-ui,sans-serif",lineHeight:1.75,whiteSpace:"pre-wrap",
            transition:"border-color .2s",wordBreak:"break-word",
            cursor:!transcript&&!isRecording?"pointer":"default"}}>
          {transcript?(
            <>
              {transcript}
              {interimText&&(
                <span style={{color:th.muted,fontStyle:"italic"}}>{interimText}</span>
              )}
            </>
          ):isRecording?(
            <span style={{color:th.muted,fontStyle:"italic"}}>
              {interimText||"Speak… system is listening"}
            </span>
          ):(
            <span style={{color:th.muted,fontStyle:"italic"}}>
              Нажмите «Start Dictation / ابدأ» или кликните сюда
            </span>
          )}
        </div>
      </div>

      {/* Ручное редактирование транскрипта */}
      {transcript&&!isRecording&&(
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:th.muted,fontFamily:"system-ui,sans-serif",marginBottom:4}}>
            Edit the text before structuring if needed:
          </div>
          <textarea value={transcript} onChange={e=>setTranscript(e.target.value)}
            style={{width:"100%",background:th.bg,border:`1px solid ${th.border}`,borderRadius:8,
              padding:"10px 12px",fontSize:13,color:th.text,fontFamily:"system-ui,sans-serif",
              resize:"vertical",minHeight:80,outline:"none",lineHeight:1.6}}/>
        </div>
      )}

      {/* Structure button */}
      {transcript&&!isRecording&&(
        <button onClick={structureText} disabled={loading}
          style={{width:"100%",background:loading?"#ccc":"#8A1538",color:"white",
            border:"none",borderRadius:10,padding:"12px",cursor:loading?"not-allowed":"pointer",
            fontSize:14,fontWeight:700,fontFamily:"system-ui,sans-serif",
            marginBottom:20,transition:"all .15s",opacity:loading?.6:1}}>
          {loading
            ?"⏳ Structuring…"
            :`📋 Structure → ${EXAM_TEMPLATES.find(t=>t.id===template)?.label}`}
        </button>
      )}

      {/* Structured result */}
      {structured&&(
        <div style={{background:th.bg,border:`1px solid ${th.border}`,borderRadius:14,overflow:"hidden"}}>
          {/* Result header */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
            padding:"12px 16px",borderBottom:`1px solid ${th.border}`,
            background:th.bg2}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:15}}>{EXAM_TEMPLATES.find(t=>t.id===template)?.icon}</span>
              <span style={{fontSize:13,fontWeight:700,color:th.text,fontFamily:"Georgia,serif"}}>
                {EXAM_TEMPLATES.find(t=>t.id===template)?.label}
              </span>
              <span style={{fontSize:10.5,color:th.muted,fontFamily:"system-ui,sans-serif"}}>
                · ready to paste
              </span>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>{
                  // Скачать как .txt
                  const blob=new Blob([structured],{type:"text/plain;charset=utf-8"});
                  const url=URL.createObjectURL(blob);
                  const a=document.createElement("a");
                  a.href=url;a.download=`osmotr_${new Date().toISOString().slice(0,10)}.txt`;
                  a.click();URL.revokeObjectURL(url);
                }}
                style={{background:"none",border:`1px solid ${th.border}`,borderRadius:6,
                  padding:"5px 10px",cursor:"pointer",fontSize:11,color:th.muted,
                  fontFamily:"system-ui,sans-serif"}}>
                ⬇️ TXT
              </button>
              <button onClick={copyResult}
                style={{background:copied?"#16a34a":"#8A1538",color:"white",border:"none",
                  borderRadius:6,padding:"5px 14px",cursor:"pointer",fontSize:12,fontWeight:700,
                  fontFamily:"system-ui,sans-serif",transition:"background .2s"}}>
                {copied?"✅ Copied":"📋 Copy to HIS"}
              </button>
            </div>
          </div>

          {/* Result text */}
          <pre style={{margin:0,padding:"16px 18px",fontSize:13,color:th.text,
            fontFamily:"monospace",lineHeight:1.8,whiteSpace:"pre-wrap",
            wordBreak:"break-word",overflowX:"auto"}}>
            {structured}
          </pre>
        </div>
      )}

      {/* Browser compatibility note */}
      <div style={{marginTop:20,padding:"10px 14px",background:th.bg2,border:`1px solid ${th.border}`,
        borderRadius:8,fontSize:11.5,color:th.muted,fontFamily:"system-ui,sans-serif",lineHeight:1.6}}>
        🌐 Dictation works in <strong>Chrome</strong> и <strong>Edge</strong>.
        Safari and Firefox do not support continuous speech recognition.
        Microphone must be allowed in browser settings.
      </div>
    </div>
  );
};

// ─── Document Analysis ────────────────────────────────────────────────────────
// Режимы анализа — каждый режим формирует свой специализированный промпт
const DOC_MODES=[
  {id:"summary",    icon:"📋", label:"Brief Summary",       desc:"Document essence in 30 seconds"},
  {id:"diagnoses",  icon:"🔬", label:"Diagnoses & ICD",       desc:"All diagnoses with ICD-10 codes"},
  {id:"meds",       icon:"💊", label:"Prescriptions",            desc:"Medications, doses, regimens"},
  {id:"dynamics",   icon:"📈", label:"Clinical Progress",    desc:"Changes during treatment"},
  {id:"risks",      icon:"⚠️", label:"Risks & Red Flags", desc:"Alarming findings and risks"},
  {id:"epicrisis",  icon:"📝", label:"Auto-Discharge Summary",          desc:"Structured discharge summary for the record"},
];

const DOC_PROMPTS={
  summary: t=>`Ты — опытный клиницист. Проанализируй медицинский документ и дай структурированное резюме.

ДОКУМЕНТ:
${t}

Ответь строго на русском языке в формате:

<PATIENT>Пациент: возраст, пол, ключевые характеристики (если указаны).</PATIENT>
<MAINDIAG>Основной диагноз (диагнозы) с кодом МКБ-10.</MAINDIAG>
<KEYFINDINGS>3–5 ключевых клинических находок (анализы, симптомы, данные осмотра).</KEYFINDINGS>
<TREATMENT>Проводимое или рекомендованное лечение (кратко).</TREATMENT>
<OUTCOME>Результат госпитализации / исход визита / состояние при выписке.</OUTCOME>
<RECOMMENDATIONS>Рекомендации при выписке или план дальнейшего ведения.</RECOMMENDATIONS>
<FLAGS>Важные находки, требующие внимания (если есть); иначе — «Тревожных флагов не выявлено».</FLAGS>`,

  diagnoses: t=>`Ты — клинический кодировщик МКБ-10. Извлеки все диагнозы из документа.

ДОКУМЕНТ:
${t}

Ответь строго на русском языке в формате JSON внутри тега:
<DIAGNOSES>
[
  {
    "type": "основной/сопутствующий/осложнение",
    "name": "Название диагноза",
    "icd10": "Код МКБ-10",
    "evidence": "Строка из документа, подтверждающая диагноз",
    "status": "активный/анамнез/под вопросом"
  }
]
</DIAGNOSES>
<SUMMARY>1–2 предложения о диагностической картине в целом.</SUMMARY>`,

  meds: t=>`Ты — клинический фармаколог. Извлеки все лекарственные назначения из документа.

ДОКУМЕНТ:
${t}

Ответь строго на русском языке в формате JSON внутри тега:
<MEDS>
[
  {
    "name": "МНН (бренд)",
    "dose": "доза и форма",
    "route": "путь введения",
    "frequency": "кратность",
    "duration": "длительность или «постоянно»",
    "indication": "показание (кратко)"
  }
]
</MEDS>
<INTERACTIONS>Потенциальные значимые взаимодействия (если выявлены); иначе — «Значимых взаимодействий не выявлено».</INTERACTIONS>`,

  dynamics: t=>`Ты — лечащий врач. Опиши динамику состояния пациента по медицинскому документу.

ДОКУМЕНТ:
${t}

Ответь строго на русском языке в формате:

<INITIAL>Состояние при поступлении / начале наблюдения.</INITIAL>
<VITALS_TREND>Динамика витальных показателей (АД, ЧСС, температура, SpO2 и др.).</VITALS_TREND>
<LABS_TREND>Динамика ключевых лабораторных показателей.</LABS_TREND>
<CLINICAL_TREND>Общая клиническая динамика (улучшение / стабилизация / ухудшение).</CLINICAL_TREND>
<FINAL>Состояние на момент выписки / последнего осмотра.</FINAL>`,

  risks: t=>`Ты — клиницист с фокусом на безопасности пациента. Выяви все риски и тревожные флаги.

ДОКУМЕНТ:
${t}

Ответь строго на русском языке в формате JSON внутри тега:
<RISKS>
[
  {
    "category": "клинический/медикаментозный/диагностический/организационный",
    "severity": "высокий/средний/низкий",
    "description": "Описание риска",
    "recommendation": "Рекомендуемое действие"
  }
]
</RISKS>
<SUMMARY>Общий вывод о профиле риска пациента.</SUMMARY>`,

  epicrisis: t=>`Ты — опытный клиницист. Сформируй структурированный выписной эпикриз по медицинскому документу.

ДОКУМЕНТ:
${t}

Напиши выписной эпикриз в стандартном формате для вклейки в медицинскую карту. Строго на русском языке:

<EPICRISIS>
DISCHARGE SUMMARY

Пациент: [ФИО если есть / «Данные не указаны»], [возраст], [пол]
Период лечения: [даты если есть]
Отделение: [если указано]

ОСНОВНОЙ DIAGNOSIS:
[Diagnosis with ICD-10 code]

СОПУТСТВУЮЩИЕ ЗАБОЛЕВАНИЯ:
[Перечень или «Не указаны»]

ЖАЛОБЫ ПРИ ПОСТУПЛЕНИИ:
[Жалобы]

HISTORY OF PRESENT ILLNESS:
[Краткий анамнез]

ОБЪЕКТИВНЫЙ СТАТУС ПРИ ПОСТУПЛЕНИИ:
[Examination findings, витальные показатели]

INVESTIGATION RESULTS:
[Ключевые лабораторные и инструментальные данные]

TREATMENT PROVIDED:
[Prescriptions, процедуры]

ДИНАМИКА И РЕЗУЛЬТАТ ЛЕЧЕНИЯ:
[Clinical Progress]

CONDITION AT DISCHARGE:
[Статус]

RECOMMENDATIONS:
[Рекомендации по лечению, наблюдению, ограничениям]

Doctor: _________________ / _________________
</EPICRISIS>`,
};

// Парсер результатов для каждого режима
const parseDocResult=(mode,text)=>{
  const get=tag=>{const m=text.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`,"i"));return m?m[1].trim():"";};
  const getJson=tag=>{
    try{
      const raw=get(tag);
      const clean=raw.replace(/^```(?:json)?|```$/gm,"").replace(/,\s*([}\]])/g,"$1").trim();
      return JSON.parse(clean);
    }catch{return null;}
  };

  if(mode==="summary") return{
    type:"summary",
    patient:get("PATIENT"),maindiag:get("MAINDIAG"),keyfindings:get("KEYFINDINGS"),
    treatment:get("TREATMENT"),outcome:get("OUTCOME"),recommendations:get("RECOMMENDATIONS"),
    flags:get("FLAGS"),
  };
  if(mode==="diagnoses") return{type:"diagnoses",items:getJson("DIAGNOSES")||[],summary:get("SUMMARY")};
  if(mode==="meds")      return{type:"meds",items:getJson("MEDS")||[],interactions:get("INTERACTIONS")};
  if(mode==="dynamics")  return{
    type:"dynamics",
    initial:get("INITIAL"),vitalsTrend:get("VITALS_TREND"),labsTrend:get("LABS_TREND"),
    clinicalTrend:get("CLINICAL_TREND"),final:get("FINAL"),
  };
  if(mode==="risks")  return{type:"risks",items:getJson("RISKS")||[],summary:get("SUMMARY")};
  if(mode==="epicrisis") return{type:"epicrisis",text:get("EPICRISIS")||text};
  return{type:"raw",text};
};

// Рендер результата
const DocResultView=({result,th})=>{
  const [copied,setCopied]=useState(false);
  const copy=t=>{navigator.clipboard.writeText(t).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});};

  const Section=({title,children,icon})=>(
    <div style={{marginBottom:12}}>
      <div style={{fontSize:10.5,fontWeight:700,color:th.muted,textTransform:"uppercase",
        letterSpacing:".5px",marginBottom:6,fontFamily:"system-ui,sans-serif"}}>{icon} {title}</div>
      <div style={{fontSize:13,color:th.text,fontFamily:"system-ui,sans-serif",lineHeight:1.7,
        background:th.bg2,border:`1px solid ${th.border}`,borderRadius:8,padding:"10px 13px",
        whiteSpace:"pre-wrap"}}>{children}</div>
    </div>
  );

  if(result.type==="summary") return(
    <div>
      <Section title="Пациент" icon="👤">{result.patient||"—"}</Section>
      <Section title="Основной диагноз" icon="🔬">{result.maindiag||"—"}</Section>
      <Section title="Ключевые находки" icon="🔑">{result.keyfindings||"—"}</Section>
      <Section title="Лечение" icon="💊">{result.treatment||"—"}</Section>
      <Section title="Исход" icon="📊">{result.outcome||"—"}</Section>
      <Section title="Рекомендации" icon="📋">{result.recommendations||"—"}</Section>
      {result.flags&&result.flags!=="Тревожных флагов не выявлено"&&(
        <div style={{background:th.riskHiBg,border:"1.5px solid #fca5a5",borderRadius:10,
          padding:"12px 14px",display:"flex",gap:8}}>
          <span style={{fontSize:18}}>🚨</span>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:"#dc2626",fontFamily:"system-ui,sans-serif",marginBottom:4}}>
              ТРЕВОЖНЫЕ ФЛАГИ
            </div>
            <div style={{fontSize:13,color:th.text,fontFamily:"system-ui,sans-serif",lineHeight:1.6,whiteSpace:"pre-wrap"}}>
              {result.flags}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if(result.type==="diagnoses") return(
    <div>
      {result.items.map((d,i)=>{
        const sev={основной:th.riskHiBg,сопутствующий:th.mzBg,осложнение:th.riskMidBg}[d.type]||th.bg2;
        const sevB={основной:"#fca5a5",сопутствующий:th.mzBorder,осложнение:"#fde68a"}[d.type]||th.border;
        return(
          <div key={i} style={{background:sev,border:`1.5px solid ${sevB}`,borderRadius:11,
            padding:"12px 15px",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
              <span style={{fontSize:16,fontWeight:700,color:th.text,fontFamily:"monospace",
                background:th.bg,border:`1px solid ${th.border}`,borderRadius:5,
                padding:"2px 8px"}}>{d.icd10||"—"}</span>
              <span style={{fontSize:13,fontWeight:700,color:th.text,fontFamily:"system-ui,sans-serif",flex:1}}>{d.name}</span>
              <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:4,
                background:th.bg,border:`1px solid ${th.border}`,color:th.muted,
                fontFamily:"system-ui,sans-serif"}}>{d.type}</span>
              {d.status&&<span style={{fontSize:10,color:th.muted,fontFamily:"system-ui,sans-serif"}}>{d.status}</span>}
            </div>
            {d.evidence&&<div style={{fontSize:11.5,color:th.muted,fontFamily:"system-ui,sans-serif",
              fontStyle:"italic",lineHeight:1.5}}>«{d.evidence}»</div>}
          </div>
        );
      })}
      {result.summary&&<div style={{fontSize:13,color:th.muted,fontFamily:"system-ui,sans-serif",
        marginTop:8,padding:"8px 12px",background:th.bg2,borderRadius:8,border:`1px solid ${th.border}`}}>
        {result.summary}</div>}
    </div>
  );

  if(result.type==="meds") return(
    <div>
      {result.items.length===0&&<div style={{color:th.muted,fontFamily:"system-ui,sans-serif",fontSize:13,padding:"20px 0",textAlign:"center"}}>Назначений не найдено</div>}
      {result.items.map((m,i)=>(
        <div key={i} style={{background:th.bg2,border:`1px solid ${th.border}`,borderRadius:10,
          padding:"11px 14px",marginBottom:8,display:"flex",gap:10,alignItems:"flex-start"}}>
          <div style={{width:28,height:28,borderRadius:6,background:"#8A1538",color:"white",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,
            fontWeight:700,flexShrink:0,fontFamily:"monospace"}}>{i+1}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13.5,fontWeight:700,color:th.text,fontFamily:"system-ui,sans-serif",marginBottom:3}}>{m.name}</div>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              {m.dose&&<span style={{fontSize:11.5,color:th.muted,fontFamily:"system-ui,sans-serif"}}>💊 {m.dose}</span>}
              {m.route&&<span style={{fontSize:11.5,color:th.muted,fontFamily:"system-ui,sans-serif"}}>🔁 {m.route}</span>}
              {m.frequency&&<span style={{fontSize:11.5,color:th.muted,fontFamily:"system-ui,sans-serif"}}>⏱ {m.frequency}</span>}
              {m.duration&&<span style={{fontSize:11.5,color:th.muted,fontFamily:"system-ui,sans-serif"}}>📅 {m.duration}</span>}
            </div>
            {m.indication&&<div style={{fontSize:11,color:th.muted,fontFamily:"system-ui,sans-serif",
              marginTop:4,fontStyle:"italic"}}>Показание: {m.indication}</div>}
          </div>
        </div>
      ))}
      {result.interactions&&result.interactions!=="Значимых взаимодействий не выявлено"&&(
        <div style={{background:th.riskMidBg,border:"1px solid #fde68a",borderRadius:9,padding:"10px 13px",marginTop:4}}>
          <strong style={{fontSize:12,color:"#92400e",fontFamily:"system-ui,sans-serif"}}>⚠️ Interactions: </strong>
          <span style={{fontSize:12.5,color:th.text,fontFamily:"system-ui,sans-serif"}}>{result.interactions}</span>
        </div>
      )}
    </div>
  );

  if(result.type==="dynamics") return(
    <div>
      {[
        ["При поступлении","🏥",result.initial],
        ["Витальные показатели","❤️",result.vitalsTrend],
        ["Лабораторные данные","🧪",result.labsTrend],
        ["Клиническая динамика","📈",result.clinicalTrend],
        ["При выписке","🏠",result.final],
      ].map(([title,icon,val])=>(
        <Section key={title} title={title} icon={icon}>{val||"—"}</Section>
      ))}
    </div>
  );

  if(result.type==="risks") return(
    <div>
      {result.items.length===0&&<div style={{color:th.muted,fontFamily:"system-ui,sans-serif",fontSize:13,padding:"20px 0",textAlign:"center"}}>Рисков не выявлено</div>}
      {result.items.map((r,i)=>{
        const sv={высокий:th.riskHiBg,средний:th.riskMidBg,низкий:th.riskLoBg}[r.severity]||th.bg2;
        const sb={высокий:"#fca5a5",средний:"#fde68a",низкий:"#86efac"}[r.severity]||th.border;
        const sc={высокий:"#dc2626",средний:"#d97706",низкий:"#16a34a"}[r.severity]||th.muted;
        return(
          <div key={i} style={{background:sv,border:`1.5px solid ${sb}`,borderRadius:11,padding:"12px 14px",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
              <span style={{fontSize:10.5,fontWeight:700,padding:"2px 8px",borderRadius:5,
                background:"transparent",border:`1.5px solid ${sb}`,color:sc,
                fontFamily:"system-ui,sans-serif"}}>{r.severity}</span>
              <span style={{fontSize:10,color:th.muted,fontFamily:"system-ui,sans-serif"}}>{r.category}</span>
            </div>
            <p style={{fontSize:13,color:th.text,fontFamily:"system-ui,sans-serif",lineHeight:1.65,marginBottom:6}}>{r.description}</p>
            {r.recommendation&&<div style={{fontSize:12,color:sc,fontWeight:600,fontFamily:"system-ui,sans-serif"}}>→ {r.recommendation}</div>}
          </div>
        );
      })}
      {result.summary&&<div style={{fontSize:13,color:th.muted,fontFamily:"system-ui,sans-serif",
        padding:"8px 12px",background:th.bg2,borderRadius:8,border:`1px solid ${th.border}`,marginTop:4}}>
        {result.summary}</div>}
    </div>
  );

  if(result.type==="epicrisis") return(
    <div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8,gap:6}}>
        <button onClick={()=>copy(result.text)}
          style={{background:copied?"#16a34a":"#8A1538",color:"white",border:"none",borderRadius:7,
            padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:700,
            fontFamily:"system-ui,sans-serif",transition:"background .2s"}}>
          {copied?"✅ Copied":"📋 Copy to HIS"}
        </button>
      </div>
      <pre style={{fontSize:12.5,color:th.text,fontFamily:"monospace",lineHeight:1.7,
        background:th.bg2,border:`1px solid ${th.border}`,borderRadius:10,padding:"16px",
        whiteSpace:"pre-wrap",wordBreak:"break-word",margin:0}}>{result.text}</pre>
    </div>
  );

  return <pre style={{fontSize:12,color:th.text,fontFamily:"monospace",whiteSpace:"pre-wrap",lineHeight:1.6}}>{result.text}</pre>;
};

const DocAnalysisSection=({th,pdfReady})=>{
  const [file,setFile]=useState(null);
  const [text,setText]=useState("");       // extracted PDF text
  const [extracting,setExtracting]=useState(false);
  const [mode,setMode]=useState("summary");
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState(null);
  const [error,setError]=useState("");
  const [manualText,setManualText]=useState("");
  const [inputMode,setInputMode]=useState("pdf"); // "pdf" | "text"
  const [pageCount,setPageCount]=useState(0);
  const dropRef=useRef(null);
  const inputRef=useRef(null);

  const loadFile=async f=>{
    if(!f)return;
    // Accept PDF or plain text
    if(f.type==="application/pdf"||f.name.endsWith(".pdf")){
      if(!pdfReady){setError("PDF.js ещё загружается. Подождите секунду и повторите.");return;}
      setExtracting(true);setError("");setText("");setResult(null);setFile(f);
      try{
        const buf=await f.arrayBuffer();
        const pdf=await window.pdfjsLib.getDocument({data:buf}).promise;
        setPageCount(pdf.numPages);
        let t="";
        // Extract up to 100 pages — достаточно для большинства выписок
        const pages=Math.min(pdf.numPages,100);
        for(let i=1;i<=pages;i++){
          const p=await pdf.getPage(i);
          const c=await p.getTextContent();
          t+=c.items.map(x=>x.str).join(" ")+"\n";
        }
        setText(t.trim());
      }catch(e){setError("Не удалось прочитать PDF: "+e.message);}
      finally{setExtracting(false);}
    }else if(f.type.startsWith("text/")||f.name.endsWith(".txt")){
      const t=await f.text();
      setText(t.trim());setFile(f);setPageCount(0);setResult(null);setError("");
    }else{
      setError("Supported formats: PDF, TXT");
    }
  };

  const analyze=async()=>{
    const src=inputMode==="pdf"?text:manualText.trim();
    if(!src||loading)return;
    setLoading(true);setResult(null);setError("");
    try{
      // Ограничиваем контекст — 12 000 символов (~3 000 токенов) достаточно для выписки
      const truncated=src.length>12000?src.slice(0,12000)+"…[текст обрезан]":src;
      const raw=await callAI({
        maxTokens:2000,
        messages:[{role:"user",content:DOC_PROMPTS[mode](truncated)}],
      });
      setResult(parseDocResult(mode,raw));
    }catch(e){setError("Ошибка анализа: "+(e?.message||"неизвестная"));}
    finally{setLoading(false);}
  };

  const srcReady=inputMode==="pdf"?text.length>0:manualText.trim().length>0;

  return(
    <div style={{maxWidth:780,margin:"0 auto",paddingTop:20,paddingBottom:40}}>
      <h2 style={{fontSize:18,fontWeight:700,color:th.text,marginBottom:6,fontFamily:"Georgia,serif"}}>
        📂 AI Document Analysis / تحليل الوثائق الطبية
      </h2>
      <p style={{fontSize:13,color:th.muted,marginBottom:20,fontFamily:"system-ui,sans-serif",lineHeight:1.6}}>
        Upload a discharge letter, medical history, or protocol — the system generates a structured summary,
        extracting diagnoses, medications, clinical progress, and risks.
      </p>

      {/* Input mode toggle */}
      <div style={{display:"flex",gap:6,marginBottom:16}}>
        {[["pdf","📄 PDF / TXT file"],["text","✏️ Paste text"]].map(([id,label])=>(
          <button key={id} onClick={()=>{setInputMode(id);setResult(null);setError("");}}
            style={{padding:"7px 14px",borderRadius:8,cursor:"pointer",fontSize:12.5,fontWeight:600,
              background:inputMode===id?"#8A1538":th.bg2,color:inputMode===id?"white":th.muted,
              border:`1px solid ${inputMode===id?"#8A1538":th.border}`,fontFamily:"system-ui,sans-serif"}}>
            {label}
          </button>
        ))}
      </div>

      {/* PDF drop zone */}
      {inputMode==="pdf"&&(
        <div
          ref={dropRef}
          onDragOver={e=>{e.preventDefault();dropRef.current.style.borderColor="#8A1538";}}
          onDragLeave={()=>{dropRef.current.style.borderColor=th.border;}}
          onDrop={e=>{e.preventDefault();dropRef.current.style.borderColor=th.border;
            const f=e.dataTransfer.files[0];if(f)loadFile(f);}}
          onClick={()=>inputRef.current?.click()}
          style={{border:`2px dashed ${th.border}`,borderRadius:12,padding:"28px 20px",
            textAlign:"center",cursor:"pointer",background:th.bg2,marginBottom:14,
            transition:"border-color .15s"}}>
          <input ref={inputRef} type="file" accept=".pdf,.txt" style={{display:"none"}}
            onChange={e=>{const f=e.target.files[0];if(f)loadFile(f);e.target.value="";}}/>
          {extracting?(
            <div style={{color:th.muted,fontFamily:"system-ui,sans-serif"}}>
              <div style={{fontSize:24,marginBottom:6}}>⏳</div>
              <div style={{fontSize:13,fontWeight:600}}>Extracting text from PDF…</div>
            </div>
          ):file&&text?(
            <div style={{color:th.text,fontFamily:"system-ui,sans-serif"}}>
              <div style={{fontSize:24,marginBottom:6}}>✅</div>
              <div style={{fontSize:13,fontWeight:700,marginBottom:3}}>{file.name}</div>
              <div style={{fontSize:11.5,color:th.muted}}>
                {pageCount>0?`${pageCount} стр. · `:""}{text.length.toLocaleString("ru-RU")} символов
              </div>
              <div style={{fontSize:11,color:"#8A1538",marginTop:6,fontWeight:600}}>
                Click to load another file
              </div>
            </div>
          ):(
            <div style={{color:th.muted,fontFamily:"system-ui,sans-serif"}}>
              <div style={{fontSize:28,marginBottom:8}}>📂</div>
              <div style={{fontSize:13,fontWeight:600,color:th.text,marginBottom:4}}>
                Drag PDF or click to select
              </div>
              <div style={{fontSize:11.5}}>Supported: PDF, TXT · up to 100 pages</div>
            </div>
          )}
        </div>
      )}

      {/* Manual text input */}
      {inputMode==="text"&&(
        <textarea value={manualText} onChange={e=>setManualText(e.target.value)}
          placeholder="Paste discharge summary, examination record, or medical history…"
          style={{width:"100%",background:th.bg2,border:`1.5px solid ${th.border}`,borderRadius:10,
            padding:"12px 14px",fontSize:13,color:th.text,fontFamily:"system-ui,sans-serif",
            resize:"vertical",minHeight:180,outline:"none",lineHeight:1.6,marginBottom:14}}/>
      )}

      {error&&(
        <div style={{background:th.riskHiBg,border:"1px solid #fca5a5",borderRadius:8,
          padding:"10px 14px",marginBottom:14,fontSize:12.5,color:"#dc2626",
          fontFamily:"system-ui,sans-serif"}}>
          ⚠️ {error}
        </div>
      )}

      {/* Mode selector */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:th.muted,textTransform:"uppercase",
          letterSpacing:".5px",marginBottom:8,fontFamily:"system-ui,sans-serif"}}>
          Analysis type
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
          {DOC_MODES.map(m=>(
            <button key={m.id} onClick={()=>{setMode(m.id);setResult(null);}}
              style={{padding:"9px 10px",borderRadius:9,cursor:"pointer",textAlign:"left",
                background:mode===m.id?th.bg3:th.bg2,
                border:`1.5px solid ${mode===m.id?"#8A1538":th.border}`,
                transition:"all .15s"}}>
              <div style={{fontSize:13,marginBottom:2}}>{m.icon}</div>
              <div style={{fontSize:11.5,fontWeight:700,color:mode===m.id?"#8A1538":th.text,
                fontFamily:"system-ui,sans-serif"}}>{m.label}</div>
              <div style={{fontSize:10.5,color:th.muted,fontFamily:"system-ui,sans-serif",lineHeight:1.3}}>{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Analyze button */}
      <button onClick={analyze} disabled={!srcReady||loading||extracting}
        style={{width:"100%",background:!srcReady||loading?"#ccc":"#8A1538",color:"white",
          border:"none",borderRadius:10,padding:"12px",cursor:!srcReady||loading?"not-allowed":"pointer",
          fontSize:14,fontWeight:700,fontFamily:"system-ui,sans-serif",marginBottom:20,
          transition:"all .15s",opacity:!srcReady||loading?.6:1}}>
        {loading?"⏳ Analysing…":extracting?"⏳ Reading PDF…":`🔍 Run Analysis — ${DOC_MODES.find(m=>m.id===mode)?.label}`}
      </button>

      {/* Result */}
      {result&&(
        <div style={{background:th.bg,border:`1px solid ${th.border}`,borderRadius:14,padding:"18px 20px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,
            paddingBottom:12,borderBottom:`1px solid ${th.border}`}}>
            <span style={{fontSize:16}}>{DOC_MODES.find(m=>m.id===mode)?.icon}</span>
            <span style={{fontSize:14,fontWeight:700,color:th.text,fontFamily:"Georgia,serif"}}>
              {DOC_MODES.find(m=>m.id===mode)?.label}
            </span>
            {file&&<span style={{fontSize:11,color:th.muted,fontFamily:"system-ui,sans-serif",
              marginLeft:"auto"}}>{file.name}</span>}
          </div>
          <DocResultView result={result} th={th}/>
        </div>
      )}
    </div>
  );
};

// ─── MZ Sync Panel ────────────────────────────────────────────────────────────
// This panel shows the REAL status of the server-side MOPH guideline index.
// Backed by /docgrade-server (src/services/mophSync.js + mophSearch.js), which:
//   1. Crawls MOPH's clinical guidelines listing page for PDF links
//   2. Falls back to an admin-curated manual-drop directory when the crawler
//      is blocked (confirmed in testing: MOPH's portal returns HTTP 403 to
//      automated requests — see mophSync.js comments for the full story)
//   3. Extracts text via pdftotext, chunks it, stores chunks in SQLite
//   4. Serves TF-IDF retrieval over those chunks via GET /api/moph/search
//   5. Runs automatically on a cron schedule (see MOPH_CRON in .env) and can
//      also be triggered manually with the button below
const MZSyncSection=({th,L})=>{
  const [status,setStatus]=useState(null);
  const [info,setInfo]=useState({lastSync:null,docCount:null,chunkCount:null,schedule:null,message:"Loading…"});
  const [loading,setLoading]=useState(false);

  const fetchStatus=async()=>{
    try{
      const res=await fetch(`${API_BASE_URL}/api/mzsync`);
      if(!res.ok)throw new Error(`HTTP ${res.status}`);
      const data=await res.json();
      setInfo({
        lastSync:data.lastSync?.finished_at||data.lastSync?.started_at||null,
        docCount:data.docCount,
        chunkCount:data.chunkCount,
        schedule:data.schedule,
        message:data.lastSync?.error_message||null,
      });
      if(data.lastSync)setStatus(data.lastSync.status==="ok"?"ok":"error");
    }catch(e){
      setInfo({lastSync:null,docCount:null,chunkCount:null,schedule:null,
        message:`Could not reach backend at ${API_BASE_URL}. Is /docgrade-server running? (${e.message})`});
      setStatus("error");
    }
  };

  useEffect(()=>{fetchStatus();},[]);

  const triggerSync=async()=>{
    if(loading)return; setLoading(true); setStatus("syncing");
    try{
      const res=await fetch(`${API_BASE_URL}/api/mzsync`,{method:"POST"});
      const data=await res.json();
      if(!res.ok)throw new Error(data?.error?.message||`HTTP ${res.status}`);
      setStatus(data.status==="ok"?"ok":"error");
      setInfo(p=>({...p,
        lastSync:new Date().toISOString(),
        docCount:(data.docsFound!=null)?data.docsFound:p.docCount,
        message:data.errorMessage||null,
      }));
      // docCount/chunkCount above reflect this run's findings immediately;
      // re-fetch the authoritative totals from storage right after.
      await fetchStatus();
    }catch(e){
      setStatus("error");
      setInfo(p=>({...p,message:e.message}));
    }finally{
      setLoading(false);
    }
  };

  const statusColor={syncing:"#d97706",ok:"#16a34a",error:"#dc2626"}[status]||th.muted;
  const statusLabel={syncing:"⏳ Syncing…",ok:"✅ Index updated",error:"❌ Update error"}[status]||"";

  return(
    <div style={{maxWidth:700,margin:"0 auto",paddingTop:20}}>
      <h2 style={{fontSize:18,fontWeight:700,color:th.text,marginBottom:6,fontFamily:"Georgia,serif"}}>🔵 {L.mophSyncTitle}</h2>
      <p style={{fontSize:13,color:th.muted,marginBottom:20,fontFamily:"system-ui,sans-serif",lineHeight:1.6}}>
        {L.mophSyncSub}{" "}
        <a href={MOPH_URL} target="_blank" rel="noopener noreferrer" style={{color:"#8B1A2B",fontWeight:600}}>moph.gov.qa ↗</a>
      </p>

      {/* Status card */}
      <div style={{background:th.mzBg,border:`1.5px solid ${th.mzBorder}`,borderRadius:13,padding:"16px 20px",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <MOPHIcon s={18}/>
          <span style={{fontSize:15,fontWeight:700,color:th.mzText,fontFamily:"system-ui,sans-serif"}}>MOPH Qatar Index</span>
          {statusLabel&&<span style={{fontSize:11,fontWeight:700,color:statusColor,fontFamily:"system-ui,sans-serif"}}>{statusLabel}</span>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
          {[
            ["📅 Last updated", info?.lastSync?new Date(info.lastSync).toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"}):"—"],
            ["📄 Documents in index", info?.docCount!=null?`${info.docCount.toLocaleString()} guidelines`:"—"],
            ["🔄 Update schedule", "Weekly (cron)"],
            ["🗄️ Vector store", "pgvector / Pinecone"],
          ].map(([label,val])=>(
            <div key={label} style={{background:th.bg,border:`1px solid ${th.mzBorder}`,borderRadius:9,padding:"10px 13px"}}>
              <div style={{fontSize:10.5,color:th.muted,fontFamily:"system-ui,sans-serif",marginBottom:3}}>{label}</div>
              <div style={{fontSize:13,fontWeight:600,color:th.text,fontFamily:"system-ui,sans-serif"}}>{val}</div>
            </div>
          ))}
        </div>
        {info?.message&&(
          <div style={{fontSize:12,color:th.muted,fontFamily:"system-ui,sans-serif",marginBottom:12,
            background:th.bg2,border:`1px solid ${th.border}`,borderRadius:7,padding:"8px 12px"}}>
            ℹ️ {info.message}
          </div>
        )}
        <button onClick={triggerSync} disabled={loading}
          style={{background:loading?"#ccc":"#8B1A2B",color:"white",border:"none",borderRadius:9,
            padding:"9px 18px",cursor:loading?"not-allowed":"pointer",fontSize:13,fontWeight:700,
            fontFamily:"system-ui,sans-serif",opacity:loading?.6:1,transition:"all .15s"}}>
          {loading?L.syncing:L.syncBtn}
        </button>
      </div>

      {/* Architecture note */}
      <div style={{background:th.bg2,border:`1px solid ${th.border}`,borderRadius:11,padding:"14px 16px"}}>
        <div style={{fontSize:11.5,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:".5px",
          marginBottom:10,fontFamily:"system-ui,sans-serif"}}>Server RAG Architecture</div>
        {[
          ["1. Parsing",    "Server crawls moph.gov.qa, downloads current PDFs by ICD-10 category"],
          ["2. Chunking",   "PDFs split into overlapping 800-token chunks (overlap 150)"],
          ["3. Embeddings", "Each chunk → vector via text-embedding-3-small (OpenAI) or e5-large-v2"],
          ["4. Storage",    "Vectors → pgvector (Postgres) or Pinecone; metadata: ICD-10, year, link"],
          ["5. Retrieval",  "Doctor's query → cosine similarity + BM25 fusion → top-5 chunks → context for Claude"],
          ["6. Updates",    "Weekly cron checks for changes; only modified documents are re-indexed"],
        ].map(([step,desc])=>(
          <div key={step} style={{display:"flex",gap:10,marginBottom:8,alignItems:"flex-start"}}>
            <span style={{fontSize:11,fontWeight:700,color:"#8B1A2B",background:th.mzBg,border:`1px solid ${th.mzBorder}`,
              borderRadius:5,padding:"2px 7px",flexShrink:0,fontFamily:"system-ui,sans-serif"}}>{step}</span>
            <span style={{fontSize:12,color:th.text,fontFamily:"system-ui,sans-serif",lineHeight:1.5}}>{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
const SavedList=({items,title,icon,emptyText,th,onAsk})=>{
  const [q,setQ]=useState("");
  const filtered=items.filter(it=>(it.query||"").toLowerCase().includes(q.toLowerCase()));
  return(
    <div style={{maxWidth:750,margin:"0 auto",paddingTop:20}}>
      <h2 style={{fontSize:18,fontWeight:700,color:th.text,marginBottom:12,fontFamily:"Georgia,serif"}}>{icon} {title}</h2>
      {items.length>0&&(
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search / بحث / Поиск…"
          style={{width:"100%",background:th.bg2,border:`1px solid ${th.border}`,borderRadius:8,
            padding:"8px 12px",fontSize:13,color:th.text,fontFamily:"system-ui,sans-serif",outline:"none",marginBottom:12}}/>
      )}
      {filtered.length===0
        ?<div style={{textAlign:"center",color:th.muted,fontFamily:"system-ui,sans-serif",padding:"40px 0",fontSize:14}}>{emptyText}</div>
        :filtered.map((it,i)=>(
          <div key={i} style={{background:th.bg2,border:`1px solid ${th.border}`,borderRadius:10,padding:"12px 14px",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13.5,fontWeight:600,color:th.text,fontFamily:"system-ui,sans-serif",marginBottom:3}}>{it.query}</div>
                <div style={{fontSize:11,color:th.muted,fontFamily:"system-ui,sans-serif"}}>{it.date}</div>
              </div>
              <button onClick={()=>onAsk(it.query)}
                style={{background:"#8A1538",color:"white",border:"none",borderRadius:7,padding:"5px 10px",
                  cursor:"pointer",fontSize:11.5,fontWeight:600,fontFamily:"system-ui,sans-serif",flexShrink:0}}>
                Repeat / إعادة
              </button>
            </div>
          </div>
        ))
      }
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN APP ────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function App(){
  const [dark,setDark]=useState(false); const th=T[dark?"dark":"light"];
  const [lang,setLang]=useState("ar"); // "ar" | "en" | "ru"
  const L=I18N[lang]||I18N.en;
  const isRTL=lang==="ar";
  const POPULATIONS=L.pop;
  const NAV=NAV_IDS.map(n=>({...n,label:L[NAV_LABEL_KEY[n.id]]||n.id}));
  const SUGGESTED=SUGGESTED_BY_LANG[lang]||SUGGESTED_BY_LANG.en;
  const [tab,setTab]=useState("chat");
  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [status,setStatus]=useState(null);
  const [openSrc,setOpenSrc]=useState(null);
  const [guidelines,setGuidelines]=useState([]);
  const [pdfReady,setPdfReady]=useState(false);
  const [uploading,setUploading]=useState(false);
  const [showPDF,setShowPDF]=useState(false);
  const [drag,setDrag]=useState(false);
  const [favorites,setFavorites]=useState(()=>{try{return JSON.parse(localStorage.getItem("dg_favorites")||"[]");}catch{return[];}});
  const [history,setHistory]=useState(()=>{try{return JSON.parse(localStorage.getItem("dg_history")||"[]");}catch{return[];}});
  const [settings,setSettings]=useState({quick:false,population:"Общая",yearMin:"2015",showSettings:false});
  const [listening,setListening]=useState(false);
  const [misExportMsg,setMisExportMsg]=useState(null); // message to export to MIS
  const bottomRef=useRef(null);
  const inputRef=useRef(null);
  const fileRef=useRef(null);
  const inFlight=useRef(false);
  // AbortController stored in a ref — one per component instance, safe in StrictMode
  const abortRef=useRef(null);
  // Mirror of messages state — always up-to-date, avoids stale closures in send()
  const messagesRef=useRef([]);

  useEffect(()=>{
    // Guard 1: library already loaded in memory
    if(window.pdfjsLib){setPdfReady(true);return;}
    // Guard 2: script tag already injected (prevents duplicate nodes on remount)
    const PDFJS_SRC="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
    if(document.querySelector(`script[src="${PDFJS_SRC}"]`)){
      const existing=document.querySelector(`script[src="${PDFJS_SRC}"]`);
      // Script tag exists — check if it already finished loading between mounts
      if(window.pdfjsLib){setPdfReady(true);return;}
      existing.addEventListener("load",()=>{
        // Guard: set workerSrc only once (idempotent — не вызывать дважды при повторном монтировании)
        if(!window.pdfjsLib.GlobalWorkerOptions.workerSrc){
          window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
        }
        setPdfReady(true);
      },{once:true});
      return;
    }
    const s=document.createElement("script");
    s.src=PDFJS_SRC;
    s.onload=()=>{
      if(!window.pdfjsLib.GlobalWorkerOptions.workerSrc){
        window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
      }
      setPdfReady(true);
    };
    s.onerror=()=>console.error("DocGrade: не удалось загрузить PDF.js с CDN. Загрузка PDF недоступна.");
    document.head.appendChild(s);
  },[]);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages,loading]);
  useEffect(()=>{try{localStorage.setItem("dg_favorites",JSON.stringify(favorites));}catch{}},[favorites]);
  useEffect(()=>{try{localStorage.setItem("dg_history",JSON.stringify(history));}catch{}},[history]);

  // Stable message counter — used as key to avoid React re-mounting on array shifts
  const msgIdRef=useRef(0);
  const mkId=()=>++msgIdRef.current;
  // Keeping the mutation outside the updater avoids side-effects inside setState,
  // which React StrictMode and Concurrent features explicitly prohibit.
  const setMsg=useCallback(updater=>{
    const next=typeof updater==="function"?updater(messagesRef.current):updater;
    messagesRef.current=next;
    setMessages(next);
  },[]);

  // Voice input
  const startVoice=()=>{
    const R=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!R){alert("Ваш браузер не поддерживает голосовой ввод");return;}
    const r=new R();r.lang="ru-RU";r.interimResults=false;
    r.onstart=()=>setListening(true);
    r.onend=()=>setListening(false);
    r.onresult=e=>setInput(e.results[0][0].transcript);
    r.start();
  };

  // PDF handling
  const handleFiles=useCallback(async files=>{
    if(!pdfReady){alert("PDF.js загружается, подождите…");return;}
    setUploading(true);
    const added=[];
    for(const f of files){
      if(!f.name.endsWith(".pdf"))continue;
      // Skip duplicates already loaded
      if(guidelines.some(g=>g.name===f.name)){console.info(`DocGrade: "${f.name}" уже загружен, пропуск`);continue;}
      try{const txt=await extractPDF(f,window.pdfjsLib);
        const chunks=chunkText(txt).map(t=>({text:t,file:f.name}));
        added.push({name:f.name,chunks,size:f.size});}catch(e){console.warn(e);}
    }
    setGuidelines(p=>[...p,...added]);setUploading(false);
  },[pdfReady,guidelines]);
  const removeGuide=i=>setGuidelines(p=>p.filter((_,j)=>j!==i));

  // Send
  const send=async text=>{
    const q=text.trim();if(!q||inFlight.current)return;
    inFlight.current=true;
    // Cancel any previous in-flight network requests
    if(abortRef.current){abortRef.current.abort();}
    abortRef.current=new AbortController();
    const {signal}=abortRef.current;
    setInput(""); setLoading(true); tab!=="chat"&&setTab("chat");
    setMsg(p=>[...p,{role:"user",content:q,_id:mkId()}]);
    const ts=new Date().toLocaleDateString("ru-RU",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
    setHistory(p=>[{query:q,date:ts},...p.slice(0,49)]);
    let pm=[],co=[],rag=[],moph=[],pubCtx="",coCtx="",ragCtx="",mophCtx="";
    // aborted flag prevents showing an error bubble when user cancels intentionally
    let aborted=false;
    try{
      setStatus("pubmed");
      const pmids=await searchPubMed(q,5,settings.yearMin,signal);
      const[sums,abs]=await Promise.all([fetchPMSummaries(pmids,signal),fetchPMAbstracts(pmids,signal)]);
      pm=sums;if(sums.length){pubCtx=sums.map((s,i)=>`[${i+1}] ${s.authors} (${s.year}). "${s.title}". ${s.journal}. PMID:${s.pmid}`).join("\n")+"\n\n"+abs;}
    }catch(e){
      if(e?.name==="AbortError"){aborted=true;}
      else console.warn(e);
    }
    if(!aborted)try{
      setStatus("cochrane");
      co=await searchCochrane(q,4,signal);
      if(co.length)coCtx=co.map((s,i)=>`[C${i+1}] ${s.authors} (${s.year}). "${s.title}". ${s.journal}.\n${s.abstract}`).join("\n\n");
    }catch(e){
      if(e?.name==="AbortError"){aborted=true;}
      else console.warn(e);
    }
    if(!aborted)try{
      // Real server-side MOPH guideline index (TF-IDF over crawled + manually
      // dropped PDFs — see /docgrade-server/src/services/mophSearch.js).
      // This replaces relying solely on whatever PDFs the user happens to have
      // uploaded locally in this session.
      setStatus("moph");
      const mophRes=await fetch(`${API_BASE_URL}/api/moph/search?q=${encodeURIComponent(q)}&n=5`,{signal});
      if(mophRes.ok){
        const mophData=await mophRes.json();
        moph=mophData.results||[];
        if(moph.length)mophCtx=moph.map((c,i)=>`[MOPH-${i+1}] (${c.title}):\n${c.text}`).join("\n\n---\n\n");
      }
    }catch(e){
      if(e?.name==="AbortError"){aborted=true;}
      else console.warn("MOPH index search failed (non-fatal):",e);
    }
    if(!aborted)try{
      setStatus("rag");
      if(guidelines.length){const all=guidelines.flatMap(g=>g.chunks);rag=ragSearch(q,all,5);
        if(rag.length)ragCtx=rag.map((c,i)=>`[PDF-${i+1}] (${c.file}):\n${c.text}`).join("\n\n---\n\n");}
    }catch(e){console.warn(e);}
    if(!aborted)try{
      setStatus("claude");
      const hist=[...messagesRef.current,{role:"user",content:q}];
      const raw=await callAI({maxTokens:2000,signal,
        system:buildPrompt(pubCtx,coCtx,[mophCtx,ragCtx].filter(Boolean).join("\n\n---\n\n"),settings.quick,settings.population,lang),
        messages:hist.map(m=>({
          role:m.role==="user"?"user":"assistant",
          content:m.role==="user"
            ?m.content
            :(m.raw||m.intro||[m.minzdrav,m.world,m.compare].filter(Boolean).join("\n\n")||"…"),
        }))});
      const parsed=settings.quick?{raw,intro:"",minzdrav:"",world:"",compare:"",sources:[],disclaimer:"",grades:{}}:parseAI(raw);
      setMsg(p=>[...p,{role:"assistant",...parsed,meta:{pubmed:pm,cochrane:co,rag,moph},_id:mkId()}]);
    }catch(e){
      if(e?.name==="AbortError"){aborted=true;}
      else{
        const errMsg=e?.message||"Неизвестная ошибка";
        setMsg(p=>[...p,{role:"assistant",raw:`⚠️ ${errMsg}. Попробуйте снова.`,intro:"",minzdrav:"",world:"",compare:"",sources:[],disclaimer:"",grades:{},meta:{pubmed:[],cochrane:[],rag:[]},_id:mkId()}]);
      }
    }
    // finally ALWAYS runs — resets UI regardless of abort or error
    finally{setLoading(false);setStatus(null);inFlight.current=false;}
  };

  const toggleFav=(msg,query)=>{
    const ts=new Date().toLocaleDateString("ru-RU",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
    // Store only the fields needed for display / re-rendering — not meta (pubmed/cochrane/rag chunks)
    // which can be several MB per message and would quickly exhaust the 5 MB localStorage quota
    const slim={intro:msg.intro||"",minzdrav:msg.minzdrav||"",world:msg.world||"",
      compare:msg.compare||"",disclaimer:msg.disclaimer||"",
      sources:msg.sources||[],grades:msg.grades||{},raw:msg.raw||""};
    setFavorites(p=>p.some(f=>f.query===query)?p.filter(f=>f.query!==query):[{query,date:ts,msg:slim},...p]);
  };
  const isFav=q=>favorites.some(f=>f.query===q);
  const isHome=messages.length===0;

  // Settings panel
  const SP=settings.showSettings;

  return(
    <div style={{display:"flex",height:"100vh",background:th.bg,overflow:"hidden"}}>
      {misExportMsg&&<MISExportModal msg={misExportMsg} onClose={()=>setMisExportMsg(null)} th={th}/>}
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:${th.border};border-radius:3px}
        @keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bd{0%,60%,100%{transform:translateY(0);opacity:.35}30%{transform:translateY(-5px);opacity:1}}
        @keyframes pulse2{0%,100%{opacity:.4;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .mi{animation:fu .3s ease forwards}
        .navbtn:hover{background:${th.bg3}!important}
        .sndbtn:hover:not(:disabled){background:#c94e1c!important}
        .sndbtn:disabled{opacity:.4;cursor:not-allowed}
        textarea:focus{outline:none}input:focus{outline:none}
        .col-panel{transition:box-shadow .2s}.col-panel:hover{box-shadow:0 4px 16px rgba(0,0,0,.1)!important}
        .lrow:hover{background:${th.bg3}!important}
        a{text-decoration:none}
        .pdf-dz:hover{border-color:#9F7AEA!important}
      `}</style>

      {/* ── Sidebar ── */}
      <aside style={{width:200,background:th.sidebar,borderRight:`1px solid ${th.sborder}`,
        display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden"}}>
        {/* Logo */}
        <div style={{padding:"14px 16px",borderBottom:`1px solid ${th.sborder}`,
          display:"flex",alignItems:"center",gap:8}}>
          <DGLogo/>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:th.text,fontFamily:"Georgia,serif"}}>DocGrade</div>
            <div style={{fontSize:9.5,color:"#8A1538",fontWeight:700,fontFamily:"system-ui,sans-serif",letterSpacing:".3px"}}>BETA · AI</div>
          </div>
        </div>
        {/* Nav */}
        <nav style={{flex:1,padding:"8px 8px",overflow:"auto"}}>
          {NAV.map(n=>(
            <button key={n.id} className="navbtn" onClick={()=>setTab(n.id)}
              style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 10px",
                borderRadius:8,border:"none",cursor:"pointer",textAlign:"left",marginBottom:2,
                background:tab===n.id?"#8A1538":th.sidebar,transition:"background .15s"}}>
              <span style={{fontSize:15}}>{n.icon}</span>
              <span style={{fontSize:12.5,fontWeight:tab===n.id?700:500,
                color:tab===n.id?"white":th.muted,fontFamily:"system-ui,sans-serif"}}>{n.label}</span>
              {n.id==="fav"&&favorites.length>0&&(
                <span style={{marginLeft:"auto",fontSize:10,fontWeight:700,background:"#8A1538",color:"white",
                  borderRadius:"50%",width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {favorites.length>9?"9+":favorites.length}</span>
              )}
            </button>
          ))}
        </nav>
        {/* Bottom: lang + theme + settings */}
        <div style={{padding:"10px 10px",borderTop:`1px solid ${th.sborder}`,display:"flex",gap:4,flexWrap:"wrap"}}>
          {/* Language switcher */}
          {[["ar","عر"],["en","EN"],["ru","RU"]].map(([l,label])=>(
            <button key={l} onClick={()=>setLang(l)}
              style={{flex:1,padding:"5px 2px",borderRadius:7,border:`1px solid ${lang===l?"#8A1538":th.border}`,
                cursor:"pointer",background:lang===l?"#8A1538":th.bg2,color:lang===l?"white":th.muted,
                fontSize:11,fontWeight:700,fontFamily:"system-ui,sans-serif",minWidth:0}}>
              {label}
            </button>
          ))}
          <button onClick={()=>setDark(v=>!v)}
            style={{flex:1,padding:"7px",borderRadius:8,border:`1px solid ${th.border}`,
              cursor:"pointer",background:th.bg2,color:th.muted,fontSize:13,fontFamily:"system-ui,sans-serif"}}>
            {dark?"☀️":"🌙"}
          </button>
          <button onClick={()=>setSettings(s=>({...s,showSettings:!s.showSettings}))}
            style={{flex:1,padding:"7px",borderRadius:8,border:`1px solid ${SP?"#8A1538":th.border}`,
              cursor:"pointer",background:SP?th.accentBg:th.bg2,color:SP?"#8A1538":th.muted,
              fontSize:13,fontFamily:"system-ui,sans-serif"}}>
            ⚙️
          </button>
        </div>
        {/* Settings panel */}
        {SP&&(
          <div style={{padding:"10px 12px",borderTop:`1px solid ${th.sborder}`,background:th.bg2}}>
            <div style={{fontSize:11,fontWeight:700,color:th.muted,textTransform:"uppercase",
              letterSpacing:".5px",marginBottom:8,fontFamily:"system-ui,sans-serif"}}>{L.settings}</div>
            <label style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,cursor:"pointer"}}>
              <input type="checkbox" checked={settings.quick} onChange={e=>setSettings(s=>({...s,quick:e.target.checked}))} style={{accentColor:"#8A1538"}}/>
              <span style={{fontSize:11.5,color:th.text,fontFamily:"system-ui,sans-serif"}}>{L.quickMode}</span>
            </label>
            <div style={{fontSize:11,color:th.muted,marginBottom:4,fontFamily:"system-ui,sans-serif"}}>{L.population}</div>
            <select value={settings.population} onChange={e=>setSettings(s=>({...s,population:e.target.value}))}
              style={{width:"100%",background:th.bg,border:`1px solid ${th.border}`,borderRadius:6,
                padding:"5px 7px",fontSize:11.5,color:th.text,fontFamily:"system-ui,sans-serif",marginBottom:8}}>
              {POPULATIONS.map(p=><option key={p}>{p}</option>)}
            </select>
            <div style={{fontSize:11,color:th.muted,marginBottom:4,fontFamily:"system-ui,sans-serif"}}>{L.pubmedSince} {settings.yearMin}</div>
            <input type="number" min="2000" max={new Date().getFullYear()} value={settings.yearMin}
              onChange={e=>setSettings(s=>({...s,yearMin:e.target.value}))}
              style={{width:"100%",background:th.bg,border:`1px solid ${th.border}`,borderRadius:6,
                padding:"5px 7px",fontSize:12,color:th.text,fontFamily:"system-ui,sans-serif"}}/>
          </div>
        )}
      </aside>

      {/* ── Content ── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>

        {/* Header */}
        <header style={{height:48,borderBottom:`1px solid ${th.sborder}`,background:th.bg,
          display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",flexShrink:0}}>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {/* Source badges */}
            {[{Icon:()=><PMIcon s={11}/>,l:"PubMed",c:"#326599",bg:th.srcPmBg,b:th.srcPmB},
              {Icon:()=><CoIcon s={11}/>,l:"Cochrane",c:"#C41F3E",bg:th.srcCoBg,b:th.srcCoB},
              {Icon:()=><MOPHIcon s={11}/>,l:L.mophLabel,c:"#8B1A2B",bg:"#fff5f5",b:"#f5b8c0",href:MOPH_URL},
            ].map((it,i)=>{
              const inner=(
                <div style={{display:"flex",alignItems:"center",gap:4,fontSize:10.5,fontWeight:700,
                  color:it.c,background:it.bg,border:`1px solid ${it.b}`,borderRadius:5,padding:"3px 7px",fontFamily:"system-ui,sans-serif"}}>
                  <it.Icon/>{it.l}<span style={{width:5,height:5,borderRadius:"50%",background:"#22c55e"}}/>
                </div>
              );
              return it.href?<a key={i} href={it.href} target="_blank" rel="noopener noreferrer">{inner}</a>:<div key={i}>{inner}</div>;
            })}
            {guidelines.length>0&&(
              <div style={{display:"flex",alignItems:"center",gap:4,fontSize:10.5,fontWeight:700,
                color:"#6B46C1",background:th.srcPdfBg,border:`1px solid ${th.srcPdfB}`,borderRadius:5,padding:"3px 7px",fontFamily:"system-ui,sans-serif"}}>
                <PDFIcon s={11}/>{guidelines.length} PDF
              </div>
            )}
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {/* PDF toggle */}
            <button onClick={()=>setShowPDF(v=>!v)}
              style={{display:"flex",alignItems:"center",gap:4,fontSize:11,fontWeight:700,
                color:showPDF?"#6B46C1":th.muted,background:showPDF?th.srcPdfBg:th.bg2,
                border:`1px solid ${showPDF?"#C4B5FD":th.border}`,borderRadius:6,
                padding:"4px 8px",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>
              <PDFIcon s={11}/>PDF-гайдлайны
            </button>
            {settings.population!=="Общая"&&(
              <span style={{fontSize:10.5,fontWeight:700,color:"#7C3AED",background:th.srcPdfBg,
                border:`1px solid ${th.srcPdfB}`,borderRadius:5,padding:"3px 7px",fontFamily:"system-ui,sans-serif"}}>
                👤 {settings.population}
              </span>
            )}
            {settings.quick&&(
              <span style={{fontSize:10.5,fontWeight:700,color:"#8A1538",background:th.accentBg,
                border:`1px solid ${th.accentBorder}`,borderRadius:5,padding:"3px 7px",fontFamily:"system-ui,sans-serif"}}>
                ⚡ Краткий
              </span>
            )}
          </div>
        </header>

        {/* PDF Panel */}
        {showPDF&&(
          <div style={{background:th.pdfPanelBg,borderBottom:`1.5px solid #C4B5FD`,
            padding:"12px 16px",display:"flex",gap:10,alignItems:"flex-start",flexWrap:"wrap",flexShrink:0}}>
            <div className="pdf-dz"
              onDragOver={e=>{e.preventDefault();setDrag(true);}}
              onDragLeave={()=>setDrag(false)}
              onDrop={e=>{e.preventDefault();setDrag(false);handleFiles([...e.dataTransfer.files]);}}
              onClick={()=>fileRef.current?.click()}
              onMouseEnter={e=>e.currentTarget.style.background=th.pdfPanelBg}
              onMouseLeave={e=>e.currentTarget.style.background=th.bg}
              style={{width:140,minHeight:70,border:`2px dashed ${drag?"#9F7AEA":"#C4B5FD"}`,
                borderRadius:10,display:"flex",flexDirection:"column",alignItems:"center",
                justifyContent:"center",gap:4,cursor:"pointer",background:th.bg,padding:"10px"}}>
              <span style={{fontSize:20}}>{uploading?"⏳":"📂"}</span>
              <span style={{fontSize:11,color:"#7C3AED",fontWeight:600,fontFamily:"system-ui,sans-serif",textAlign:"center"}}>
                {uploading?"Processing…":"Upload PDF"}
              </span>
              <input ref={fileRef} type="file" accept=".pdf" multiple style={{display:"none"}} onChange={e=>handleFiles([...e.target.files])}/>
            </div>
            <div style={{flex:1,display:"flex",flexWrap:"wrap",gap:7,alignItems:"center"}}>
              {guidelines.map((g,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:6,background:th.bg,
                  border:`1px solid ${th.srcPdfB}`,borderRadius:8,padding:"6px 10px",maxWidth:220}}>
                  <PDFIcon s={14}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,fontWeight:600,color:th.dark?"#a78bfa":"#4C1D95",fontFamily:"system-ui,sans-serif",
                      whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{g.name}</div>
                    <div style={{fontSize:9.5,color:th.muted,fontFamily:"system-ui,sans-serif"}}>{g.chunks.length} фрагм.</div>
                  </div>
                  <button onClick={()=>removeGuide(i)} style={{background:"none",border:"none",cursor:"pointer",
                    color:"#c4b5fd",fontSize:14,padding:2,display:"flex",alignItems:"center"}}>✕</button>
                </div>
              ))}
              {guidelines.length===0&&<span style={{fontSize:12,color:"#a78bfa",fontFamily:"system-ui,sans-serif"}}>Upload PDF guidelines for RAG search…</span>}
            </div>
          </div>
        )}

        {/* Main scrollable area */}
        <div style={{flex:1,overflow:"auto",padding:"0 16px"}}>
          {tab==="calc"&&<CalculatorsSection th={th}/>}
          {tab==="drugs"&&<DrugSection th={th}/>}
          {tab==="ddx"&&<DDxSection th={th}/>}
          {tab==="exam"&&<ExamSection th={th}/>}
          {tab==="docanalysis"&&<DocAnalysisSection th={th} pdfReady={pdfReady}/>}
          {tab==="mzsync"&&<MZSyncSection th={th} L={L}/>}
          {tab==="fav"&&<SavedList items={favorites} title="Избранное" icon="⭐" emptyText="Сохраняйте ответы с помощью ⭐" th={th} onAsk={q=>{setTab("chat");send(q);}}/>}
          {tab==="history"&&<SavedList items={history} title="История запросов" icon="📜" emptyText="История запросов пуста" th={th} onAsk={q=>{setTab("chat");send(q);}}/>}

          {tab==="chat"&&(
            isHome?(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",
                justifyContent:"center",minHeight:"calc(100vh - 200px)",gap:20,paddingBottom:40}}>
                <div style={{textAlign:"center"}}>
                  <div style={{marginBottom:12,display:"flex",justifyContent:"center"}}><DGLogo/></div>
                  <h1 style={{fontSize:28,fontWeight:700,color:th.text,letterSpacing:"-0.5px",lineHeight:1.2,marginBottom:8,fontFamily:"Georgia,serif",direction:isRTL?"rtl":"ltr"}}>
                    {L.heroTitle}
                  </h1>
                  <p style={{fontSize:14,color:th.muted,fontFamily:"system-ui,sans-serif",lineHeight:1.6,maxWidth:500,margin:"0 auto",direction:isRTL?"rtl":"ltr"}}>
                    {L.heroSub}
                  </p>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center"}}>
                  {[{icon:"📄",l:"PubMed",c:"#326599",bg:th.srcPmBg},{icon:"🔴",l:"Cochrane",c:"#C41F3E",bg:th.srcCoBg},
                    {icon:"🟣",l:"PDF RAG",c:"#6B46C1",bg:th.srcPdfBg},{icon:"🔴",l:"MOPH Qatar",c:"#8B1A2B",bg:"#fff5f5"}]
                    .map((it,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:5,background:it.bg,
                        borderRadius:8,padding:"6px 11px",fontSize:11.5,fontWeight:600,color:it.c,fontFamily:"system-ui,sans-serif"}}>
                        {it.icon} {it.l}
                      </div>
                    ))
                  }
                </div>
                <SearchInput input={input} setInput={setInput} loading={loading} onSend={()=>send(input)}
                  onVoice={startVoice} listening={listening} inputRef={inputRef} th={th} large
                  placeholderIdle={L.inputPlaceholder} placeholderListen={L.voicePlaceholder}/>
                <div style={{width:"100%",maxWidth:600}}>
                  <p style={{fontSize:10.5,color:th.muted,textTransform:"uppercase",letterSpacing:".7px",
                    marginBottom:8,fontFamily:"system-ui,sans-serif",fontWeight:600}}>{L.suggestionsLabel}</p>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {SUGGESTED.map((s,i)=>(
                      <button key={i} onClick={()=>send(s)}
                        style={{background:th.bg2,border:`1px solid ${th.border}`,borderRadius:9,
                          padding:"9px 13px",textAlign:"left",cursor:"pointer",fontSize:13,
                          color:th.text,fontFamily:"system-ui,sans-serif",lineHeight:1.4,transition:"all .15s"}}
                        onMouseOver={e=>e.currentTarget.style.borderColor="#8A1538"}
                        onMouseOut={e=>e.currentTarget.style.borderColor=th.border}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>
            ):(
              <div style={{paddingTop:16,paddingBottom:120}}>
                {messages.map((msg,i)=>(
                  <div key={msg._id??i} className="mi" style={{marginBottom:20}}>
                    {msg.role==="user"?(
                      <div style={{display:"flex",justifyContent:"flex-end"}}>
                        <div style={{background:"#8A1538",borderRadius:"16px 16px 4px 16px",
                          padding:"10px 14px",maxWidth:"72%",fontSize:14,color:"white",
                          lineHeight:1.6,fontFamily:"system-ui,sans-serif"}}>{msg.content}</div>
                      </div>
                    ):(
                      <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                        <div style={{flexShrink:0,marginTop:2}}><DGLogo/></div>
                        <div style={{flex:1,minWidth:0}}>

                          {/* Literature strip */}
                          {(msg.meta?.pubmed?.length>0||msg.meta?.cochrane?.length>0||msg.meta?.rag?.length>0)&&(
                            <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
                              {[
                                {items:msg.meta?.pubmed,icon:<PMIcon s={11}/>,label:"PubMed",c:"#326599",bg:th.srcPmBg,b:th.srcPmB,dotC:"#326599"},
                                {items:msg.meta?.cochrane,icon:<CoIcon s={11}/>,label:"Cochrane",c:"#C41F3E",bg:th.srcCoBg,b:th.srcCoB,dotC:"#C41F3E"},
                              ].filter(x=>x.items?.length>0).map((src,si)=>(
                                <div key={si} style={{flex:1,minWidth:180,background:src.bg,border:`1px solid ${src.b}`,borderRadius:9,padding:"9px 11px"}}>
                                  <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:6}}>
                                    {src.icon}<span style={{fontSize:11,fontWeight:700,color:src.c,fontFamily:"system-ui,sans-serif"}}>{src.label} · {src.items.length}</span>
                                  </div>
                                  {src.items.map((a,ai)=>(
                                    <a key={ai} href={a.url} target="_blank" rel="noopener noreferrer"
                                      className="lrow" style={{display:"flex",gap:5,padding:"3px 5px",borderRadius:5,
                                        transition:"background .15s",alignItems:"flex-start",marginBottom:2}}>
                                      <span style={{minWidth:14,height:14,borderRadius:3,background:src.dotC,color:"white",
                                        fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",
                                        flexShrink:0,marginTop:1}}>{ai+1}</span>
                                      <div style={{minWidth:0}}>
                                        <div style={{fontSize:10.5,fontWeight:600,color:src.c,fontFamily:"system-ui,sans-serif",
                                          whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{a.title}</div>
                                        <div style={{fontSize:9.5,color:th.muted,fontFamily:"system-ui,sans-serif"}}>{a.year} · {a.journal?.slice(0,30)} ↗</div>
                                      </div>
                                    </a>
                                  ))}
                                </div>
                              ))}
                              {msg.meta?.rag?.length>0&&(
                                <div style={{flex:1,minWidth:160,background:th.srcPdfBg,border:`1px solid ${th.srcPdfB}`,borderRadius:9,padding:"9px 11px"}}>
                                  <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:6}}>
                                    <PDFIcon s={11}/><span style={{fontSize:11,fontWeight:700,color:"#6B46C1",fontFamily:"system-ui,sans-serif"}}>PDF · {msg.meta.rag.length} фрагм.</span>
                                  </div>
                                  {msg.meta.rag.map((r,ri)=>(
                                    <div key={ri} style={{display:"flex",gap:5,padding:"3px 5px",alignItems:"flex-start",marginBottom:2}}>
                                      <span style={{minWidth:14,height:14,borderRadius:3,background:"#6B46C1",color:"white",
                                        fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>P{ri+1}</span>
                                      <div>
                                        <div style={{fontSize:10,fontWeight:600,color:th.dark?"#a78bfa":"#4C1D95",fontFamily:"system-ui,sans-serif"}}>{r.file}</div>
                                        <div style={{fontSize:9.5,color:th.muted,fontFamily:"system-ui,sans-serif",lineHeight:1.3,marginTop:1,
                                          display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{r.text.slice(0,100)}…</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Quick / Intro */}
                          {(msg.raw||msg.intro)&&(
                            <p style={{fontSize:14,color:th.text,lineHeight:1.7,fontFamily:"system-ui,sans-serif",
                              marginBottom:msg.minzdrav?12:0,whiteSpace:"pre-wrap"}}>
                              {renderInline(msg.raw||msg.intro,msg.sources,th)}
                            </p>
                          )}

                          {/* Split columns */}
                          {(msg.minzdrav||msg.world)&&(
                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                              <div className="col-panel" style={{background:th.mzBg,border:`1.5px solid ${th.mzBorder}`,
                                borderRadius:13,padding:"13px 14px",boxShadow:"0 2px 8px rgba(139,26,43,.05)"}}>
                                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:9,
                                  paddingBottom:7,borderBottom:`1px solid ${th.mzSubBorder}`}}>
                                  <MOPHIcon s={13}/><span style={{fontSize:10.5,fontWeight:700,color:th.mzText,
                                    textTransform:"uppercase",letterSpacing:".5px",fontFamily:"system-ui,sans-serif",flex:1}}>{L.mophLabel}</span>
                                  <a href={MOPH_URL} target="_blank" rel="noopener noreferrer"
                                    style={{fontSize:9,color:th.mzText,background:th.mzBorder,padding:"1px 5px",borderRadius:3,fontWeight:700,fontFamily:"system-ui,sans-serif"}}>↗</a>
                                </div>
                                <div style={{fontSize:13,color:th.text,lineHeight:1.75,fontFamily:"system-ui,sans-serif",
                                  whiteSpace:"pre-wrap",wordBreak:"break-word"}}>
                                  {renderInline((msg.minzdrav||"").replace(/\[Grade [ABCD]\]/g,""),msg.sources,th)}
                                  {msg.grades?.minzdrav?.map((g,gi)=><GradeBadge key={gi} g={g} th={th} lang={lang}/>)}
                                </div>
                              </div>
                              <div className="col-panel" style={{background:th.worldBg,border:`1.5px solid ${th.worldBorder}`,
                                borderRadius:13,padding:"13px 14px",boxShadow:"0 2px 8px rgba(26,122,53,.05)"}}>
                                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:9,
                                  paddingBottom:7,borderBottom:`1px solid ${th.worldBorder}`}}>
                                  <GlobeIcon s={13} c={th.worldText}/><span style={{fontSize:10.5,fontWeight:700,color:th.worldText,
                                    textTransform:"uppercase",letterSpacing:".5px",fontFamily:"system-ui,sans-serif",flex:1}}>{L.worldLabel}</span>
                                  <div style={{display:"flex",gap:3}}>
                                    {msg.meta?.pubmed?.length>0&&<span style={{fontSize:8.5,background:th.srcPmBg,color:"#326599",padding:"1px 4px",borderRadius:3,fontWeight:700,fontFamily:"system-ui,sans-serif"}}>PM</span>}
                                    {msg.meta?.cochrane?.length>0&&<span style={{fontSize:8.5,background:th.srcCoBg,color:"#C41F3E",padding:"1px 4px",borderRadius:3,fontWeight:700,fontFamily:"system-ui,sans-serif"}}>Co</span>}
                                  </div>
                                </div>
                                <div style={{fontSize:13,color:th.text,lineHeight:1.75,fontFamily:"system-ui,sans-serif",
                                  whiteSpace:"pre-wrap",wordBreak:"break-word"}}>
                                  {renderInline((msg.world||"").replace(/\[Grade [ABCD]\]/g,""),msg.sources,th)}
                                  {msg.grades?.world?.map((g,gi)=><GradeBadge key={gi} g={g} th={th} lang={lang}/>)}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Compare */}
                          {msg.compare&&(
                            <div style={{display:"flex",gap:8,alignItems:"flex-start",
                              background:th.cmpBg,
                              border:`1px solid ${th.cmpBorder}`,borderRadius:9,padding:"9px 13px",marginBottom:12}}>
                              <span>⚖️</span>
                              <div>
                                <span style={{fontSize:10.5,fontWeight:700,color:th.cmpLabel,textTransform:"uppercase",
                                  letterSpacing:".5px",fontFamily:"system-ui,sans-serif"}}>{L.compareLabel}</span>
                                <p style={{fontSize:13,color:th.text,lineHeight:1.6,marginTop:2,fontFamily:"system-ui,sans-serif"}}>{msg.compare}</p>
                              </div>
                            </div>
                          )}

                          {/* Action buttons */}
                          <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
                            <button onClick={()=>toggleFav(msg,messages[i-1]?.content||"")}
                              style={{background:"none",border:`1px solid ${th.border}`,borderRadius:6,
                                padding:"4px 9px",cursor:"pointer",fontSize:11.5,fontFamily:"system-ui,sans-serif",
                                color:isFav(messages[i-1]?.content||"")?"#8A1538":th.muted}}>
                              {isFav(messages[i-1]?.content||"")?L.saved:L.save}
                            </button>
                            {(msg.intro||msg.minzdrav)&&(
                              <button onClick={()=>setMisExportMsg(msg)}
                                style={{background:"none",border:`1px solid ${th.border}`,borderRadius:6,
                                  padding:"4px 9px",cursor:"pointer",fontSize:11.5,fontFamily:"system-ui,sans-serif",color:th.muted}}>
                                {L.exportHis}
                              </button>
                            )}
                          </div>

                          {/* Sources */}
                          {msg.sources?.length>0&&(
                            <div>
                              <button className="stog" onClick={()=>setOpenSrc(openSrc===i?null:i)}
                                style={{background:"none",border:"none",cursor:"pointer",fontSize:11,
                                  color:th.muted,fontWeight:600,display:"flex",alignItems:"center",gap:4,
                                  padding:0,fontFamily:"system-ui,sans-serif",textTransform:"uppercase",letterSpacing:".5px"}}
                                onMouseOver={e=>e.currentTarget.style.color="#8A1538"}
                                onMouseOut={e=>e.currentTarget.style.color=th.muted}>
                                {openSrc===i?"▾":"▸"} {msg.sources.length} {L.sources}
                                {msg.meta?.pubmed?.length>0&&` · ${msg.meta.pubmed.length} PubMed`}
                                {msg.meta?.cochrane?.length>0&&` · ${msg.meta.cochrane.length} Cochrane`}
                                {msg.meta?.moph?.length>0&&` · ${msg.meta.moph.length} MOPH`}
                              </button>
                              {openSrc===i&&(
                                <div style={{marginTop:8,display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                                  {msg.sources.map((src,si)=>{
                                    const typeC={
                                      minzdrav:{bg:th.srcMzBg,b:th.srcMzB,dot:"#003791"},
                                      pubmed:  {bg:th.srcPmBg,b:th.srcPmB,dot:"#326599"},
                                      cochrane:{bg:th.srcCoBg,b:th.srcCoB,dot:"#C41F3E"},
                                      pdf:     {bg:th.srcPdfBg,b:th.srcPdfB,dot:"#6B46C1"},
                                    }[src.type||"pubmed"]||{bg:th.bg2,b:th.border,dot:"#888"};
                                    return(
                                      <div key={si} style={{background:typeC.bg,border:`1px solid ${typeC.b}`,
                                        borderRadius:8,padding:"8px 10px",display:"flex",gap:7,alignItems:"flex-start"}}>
                                        <span style={{minWidth:18,height:18,borderRadius:4,background:typeC.dot,color:"white",
                                          fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",
                                          fontFamily:"monospace",flexShrink:0}}>{si+1}</span>
                                        <div>
                                          <div style={{fontSize:11,fontWeight:600,color:th.text,marginBottom:2,fontFamily:"system-ui,sans-serif"}}>
                                            {src.url?<a href={src.url} target="_blank" rel="noopener noreferrer" style={{color:typeC.dot}}>{src.source} ↗</a>:src.source}
                                          </div>
                                          <div style={{fontSize:10,color:th.muted,lineHeight:1.5,fontFamily:"system-ui,sans-serif"}}>{src.snippet}</div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}

                          {msg.disclaimer&&(
                            <div style={{marginTop:10,padding:"8px 11px",background:th.bg2,
                              border:`1px solid ${th.border}`,borderRadius:7,fontSize:10.5,
                              color:th.muted,fontFamily:"system-ui,sans-serif",lineHeight:1.5}}>
                              ⚠️ {msg.disclaimer}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {loading&&(
                  <div className="mi" style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                    <div style={{flexShrink:0,marginTop:2}}><DGLogo/></div>
                    <div style={{flex:1}}>
                      <StatusBar step={status} th={th}/>
                      <div style={{background:th.bg2,border:`1px solid ${th.border}`,borderRadius:"4px 14px 14px 14px",display:"inline-block"}}><Dots/></div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef}/>
              </div>
            )
          )}
        </div>

        {/* Sticky input (chat only) */}
        {tab==="chat"&&!isHome&&(
          <div style={{background:`linear-gradient(to top,${th.bg} 65%,transparent)`,
            padding:"10px 16px 14px",flexShrink:0}}>
            <SearchInput input={input} setInput={setInput} loading={loading} onSend={()=>send(input)}
              onVoice={startVoice} listening={listening} inputRef={inputRef} th={th}
              placeholderIdle={L.inputPlaceholder} placeholderListen={L.voicePlaceholder}/>
            <p style={{textAlign:"center",fontSize:10,color:th.muted,marginTop:5,fontFamily:"system-ui,sans-serif"}}>
              PubMed · Cochrane · <a href={MOPH_URL} target="_blank" rel="noopener noreferrer"
                style={{color:"#8B1A2B",fontWeight:600}}>{L.mophLabel}</a>
              {guidelines.length>0&&` · ${guidelines.length} PDF`} · {L.footerDisclaimer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchInput({input,setInput,loading,onSend,onVoice,listening,inputRef,th,large,placeholderIdle,placeholderListen}){
  const ph = listening ? (placeholderListen||"Speak…") : (placeholderIdle||"Ask a clinical question…");
  return(
    <div style={{width:"100%",maxWidth:large?640:"100%",margin:large?"0 auto":"",
      background:th.bg,border:`1.5px solid ${th.border}`,borderRadius:13,
      display:"flex",alignItems:"flex-end",gap:7,padding:"9px 11px",
      boxShadow:"0 2px 12px rgba(0,0,0,.07)",transition:"border-color .15s"}}
      onFocus={e=>e.currentTarget.style.borderColor="#8A1538"}
      onBlur={e=>e.currentTarget.style.borderColor=th.border}>
      <button onClick={onVoice} title="Голосовой ввод"
        style={{background:"none",border:"none",cursor:"pointer",padding:"2px 3px",flexShrink:0,
          display:"flex",alignItems:"center",color:listening?"#dc2626":"#8A1538",transition:"color .2s"}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="22"/>
          <line x1="8" y1="22" x2="16" y2="22"/>
        </svg>
      </button>
      <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
        onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();onSend();}}}
        placeholder={ph}
        rows={1} style={{flex:1,border:"none",background:"transparent",resize:"none",
          fontSize:large?15:13.5,color:th.text,fontFamily:"system-ui,sans-serif",
          lineHeight:1.5,maxHeight:100,overflowY:"auto",padding:"2px 0"}}
        onInput={e=>{e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,100)+"px";}}/>
      <button className="sndbtn" onClick={onSend} disabled={!input.trim()||loading}
        style={{background:"#8A1538",border:"none",borderRadius:8,width:32,height:32,
          cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
          flexShrink:0,transition:"background .15s"}}>
        {loading
          ?<div style={{width:14,height:14,border:"2px solid white",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
          :<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>}
      </button>
    </div>
  );
}

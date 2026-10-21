// Gedeelde helpers voor index.html en kalender.html. De data zelf staat in data.js.
const KIND={les:"les",deadline:"indienen",examen:"examen",opdracht:"opdracht"};
const $=s=>document.querySelector(s);
const fmt=o=>new Intl.DateTimeFormat("nl-BE",o);
const fTime=fmt({hour:"2-digit",minute:"2-digit"}), fMonth=fmt({month:"long",year:"numeric"});
const fShort=fmt({weekday:"short",day:"numeric",month:"short"}), fLong=fmt({weekday:"long",day:"numeric",month:"long"});
const ALL=ITEMS.map(i=>{
  const dt=new Date(i.d), end=new Date(dt);
  if(i.e){const [h,m]=i.e.split(":");end.setHours(+h,+m,0,0);}
  return {...i,dt,end};
}).sort((a,b)=>a.dt-b.dt);
const isDue=i=>i.k==="deadline"||i.k==="examen";
function daysUntil(dt){const a=new Date();a.setHours(0,0,0,0);const b=new Date(dt);b.setHours(0,0,0,0);return Math.round((b-a)/864e5);}
function countLabel(n){if(n<0)return "voorbij";if(n===0)return "vandaag";if(n===1)return "morgen";return "nog "+n+" dagen";}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
const pad=n=>String(n).padStart(2,"0");
const dayKey=dt=>`${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`;
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
function timeLabel(i){
  if(i.noTime)return "uur n.t.b.";
  const s=fTime.format(i.dt);
  if(i.e)return s+"–"+i.e;
  return i.k==="deadline"?"tegen "+s:i.k==="examen"?"vanaf "+s:s;
}
const details=(...xs)=>xs.filter(Boolean).map(x=>`<span class="nw">${esc(x)}</span>`).join(" · ");
const badge=v=>`<span class="badge ${v}">${esc(COURSES[v].abbr)}</span>`;
const kind=k=>`<span class="kind ${k}">${KIND[k]}</span>`;

const row=i=>`<article class="row ${i.v} k-${i.k}">
  <div class="r-time">${esc(timeLabel(i))}</div>
  <div class="r-main"><div class="r-tags">${badge(i.v)}${kind(i.k)}</div>
    <h4>${esc(i.t)}</h4>${i.p?`<p>${esc(i.p)}</p>`:""}${i.n?`<p class="note"><b>Let op:</b> ${esc(i.n)}</p>`:""}</div>
  <div class="r-room">${esc(i.r||"")}</div>
</article>`;

function groupByDay(items){
  const days=[];
  for(const i of items){
    const last=days[days.length-1], key=dayKey(i.dt);
    if(last&&last.key===key)last.items.push(i);
    else days.push({key,dt:i.dt,items:[i]});
  }
  return days;
}
function dayBlock(d){
  const n=daysUntil(d.dt), soon=n>=0&&n<=7&&d.items.some(isDue);
  return `<section class="day${n<0?" past":""}" id="d-${d.key}">
    <header class="dh"><span>${fLong.format(d.dt)}</span><span class="rel${soon?" soon":""}">${countLabel(n)}</span></header>
    ${d.items.map(row).join("")}</section>`;
}
const todayMarker=()=>`<div class="today" role="separator">Vandaag · ${fShort.format(new Date())}</div>`;

document.querySelectorAll(".checked").forEach(el=>{el.textContent=CHECKED;});

const root=document.documentElement, mq=matchMedia("(prefers-color-scheme: dark)");
const theme=()=>root.getAttribute("data-theme")||(mq.matches?"dark":"light");
function themeLabel(){$("#theme").textContent=theme()==="dark"?"Licht thema":"Donker thema";}
$("#theme").addEventListener("click",()=>{
  const t=theme()==="dark"?"light":"dark"; root.setAttribute("data-theme",t);
  try{localStorage.setItem("theme",t)}catch(e){} themeLabel();
});
if(mq.addEventListener)mq.addEventListener("change",themeLabel);
themeLabel();

// Gedeelde helpers voor index.html en kalender.html. De data zelf staat in data.js.
const KIND={les:"les",deadline:"indienen",examen:"examen",opdracht:"opdracht"};
const STALE_DAYS=14;
const $=s=>document.querySelector(s);
const fmt=o=>new Intl.DateTimeFormat("nl-BE",o);
const fTime=fmt({hour:"2-digit",minute:"2-digit"}), fMonth=fmt({month:"long",year:"numeric"}), fDate=fmt({day:"numeric",month:"long",year:"numeric"});
const fShort=fmt({weekday:"short",day:"numeric",month:"short"}), fLong=fmt({weekday:"long",day:"numeric",month:"long"});
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}

const ALL=ITEMS.map(i=>{
  const dt=new Date(i.d), end=new Date(dt);
  if(i.e){const [h,m]=i.e.split(":");end.setHours(+h,+m,0,0);}
  return {...i,dt,end};
}).sort((a,b)=>a.dt-b.dt);
const isDue=i=>i.k==="deadline"||i.k==="examen";
function daysUntil(dt){const a=new Date();a.setHours(0,0,0,0);const b=new Date(dt);b.setHours(0,0,0,0);return Math.round((b-a)/864e5);}
function countLabel(n){if(n<0)return "voorbij";if(n===0)return "vandaag";if(n===1)return "morgen";return "nog "+n+" dagen";}
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

// Animatiehulpjes. Bij "minder beweging" (systeeminstelling) zet style.css alles stil.
const reduceMotion=matchMedia("(prefers-reduced-motion: reduce)");
// Zet het schuivende blokje van een .seg onder de actieve knop.
function syncSeg(seg,animate){
  const b=seg&&seg.querySelector('[aria-pressed="true"]'); if(!b)return;
  if(!animate)seg.classList.add("no-anim");
  seg.style.setProperty("--x",b.offsetLeft+"px");
  seg.style.setProperty("--w",b.offsetWidth+"px");
  if(!animate){void seg.offsetWidth;seg.classList.remove("no-anim");}
}
const syncAllSegs=()=>document.querySelectorAll(".seg").forEach(s=>syncSeg(s,false));
addEventListener("resize",syncAllSegs);
if(document.fonts)document.fonts.ready.then(syncAllSegs);
// Gespreide binnenkomst, geteld vanaf het eerste blok dat in beeld is (niet vanaf de top van de lijst),
// zodat je na filteren terwijl je gescrold bent niet naar een lege plek kijkt.
function stagger(list){
  let j=0;
  for(const el of list.children)el.style.setProperty("--i",el.getBoundingClientRect().bottom<0?0:Math.min(j++,12));
}
// Speel een CSS-animatieklasse (opnieuw) af.
function replay(el,cls){
  el.classList.remove("in-next","in-prev","chips-in");
  void el.offsetWidth;
  el.classList.add(cls);
}
// Klik op het tabblad waar je al bent: niets doen in plaats van de pagina te herladen.
// Ctrl/Cmd/Shift-klik blijft gewoon een nieuw tabblad of venster openen.
const plainClick=e=>e.button===0&&!(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey);
document.querySelectorAll('.tabs a[aria-current="page"]').forEach(a=>a.addEventListener("click",e=>{if(plainClick(e))e.preventDefault();}));
if(document.documentElement.dataset.page==="lijst")$(".brand").addEventListener("click",e=>{
  if(!plainClick(e))return;
  e.preventDefault();scrollTo({top:0,behavior:reduceMotion.matches?"auto":"smooth"});
});

// "Nagekeken op ..." met leeftijd. Na STALE_DAYS dagen wordt het een waarschuwing.
(function(){
  const dt=new Date(CHECKED+"T00:00"), age=-daysUntil(dt);
  document.querySelectorAll(".checked").forEach(el=>{
    if(isNaN(dt)){el.textContent="nagekeken op "+CHECKED;return;}
    const when=fDate.format(dt);
    if(age>STALE_DAYS){
      el.classList.add("stale");
      el.textContent=`Al ${age} dagen niet nagekeken (laatst op ${when}). Check zeker Toledo.`;
    }else el.textContent=`nagekeken op ${when} (${age<=0?"vandaag":age===1?"gisteren":age+" dagen geleden"})`;
  });
})();

// Agendabestand (.ics) met alle komende deadlines en examens, met herinneringen 3 dagen en 1 dag vooraf.
const icsText=s=>String(s).replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\r?\n/g,"\\n");
const icsUtc=d=>d.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"");
const slug=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40);
function icsFold(line){
  const enc=new TextEncoder();
  let out="",cur="",len=0;
  for(const ch of line){
    const b=enc.encode(ch).length;
    if(len+b>(out?74:75)){out+=(out?"\r\n ":"")+cur;cur="";len=0;}
    cur+=ch;len+=b;
  }
  return out?out+"\r\n "+cur:cur;
}
function buildICS(){
  const stamp=icsUtc(new Date());
  const alarm=(t,trigger)=>["BEGIN:VALARM","ACTION:DISPLAY",`DESCRIPTION:${icsText(t)}`,`TRIGGER:${trigger}`,"END:VALARM"];
  const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//STUWER Ortho//Deadlines 2026-27//NL","CALSCALE:GREGORIAN","METHOD:PUBLISH","X-WR-CALNAME:Deadlines STUWER Ortho 26-27"];
  for(const i of ALL.filter(i=>isDue(i)&&daysUntil(i.dt)>=0)){
    const c=COURSES[i.v].abbr;
    lines.push("BEGIN:VEVENT",
      `UID:${i.d.replace(/\D/g,"")}-${i.v}-${slug(i.t)}@stuwer-ortho-deadlines`,
      `DTSTAMP:${stamp}`,
      i.noTime?`DTSTART;VALUE=DATE:${dayKey(i.dt).replace(/-/g,"")}`:`DTSTART:${icsUtc(i.dt)}`,
      `SUMMARY:${icsText(i.k==="deadline"?`${c} indienen: ${i.t}`:`${c}: ${i.t}`)}`,
      `DESCRIPTION:${icsText([i.p,i.n&&"Let op: "+i.n,"Onofficieel overzicht. Check altijd Toledo."].filter(Boolean).join("\n\n"))}`,
      ...(i.r?[`LOCATION:${icsText(i.r)}`]:[]),
      ...alarm(i.t,"-P3D"),...alarm(i.t,"-P1D"),
      "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(icsFold).join("\r\n")+"\r\n";
}
const icsBtn=$("#ics");
if(icsBtn)icsBtn.addEventListener("click",()=>{
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([buildICS()],{type:"text/calendar;charset=utf-8"}));
  a.download="deadlines-stuwer-ortho.ics";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),2000);
  const label=icsBtn.querySelector("span"), old=label.textContent;
  label.textContent="Gedownload ✓"; setTimeout(()=>{label.textContent=old;},3000);
});

// Thema
const root=document.documentElement, mq=matchMedia("(prefers-color-scheme: dark)");
const theme=()=>root.getAttribute("data-theme")||(mq.matches?"dark":"light");
function themeLabel(){$("#theme").textContent=theme()==="dark"?"Licht thema":"Donker thema";}
$("#theme").addEventListener("click",()=>{
  const t=theme()==="dark"?"light":"dark";
  const apply=()=>{root.setAttribute("data-theme",t);themeLabel();};
  try{localStorage.setItem("theme",t)}catch(e){}
  if(document.startViewTransition&&!reduceMotion.matches)document.startViewTransition(apply);else apply();
});
if(mq.addEventListener)mq.addEventListener("change",themeLabel);
themeLabel();

// Eenmalige tip om de site op het beginscherm te zetten, met uitleg voor iOS of Android.
(function(){
  const ua=navigator.userAgent;
  const ios=/iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1), android=/Android/.test(ua);
  const standalone=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
  if(!(ios||android)||standalone)return;
  try{if(localStorage.getItem("installTip"))return;}catch(e){return;}

  let deferred=null;
  addEventListener("beforeinstallprompt",e=>{
    e.preventDefault(); deferred=e;
    const b=$("#sheet-install"); if(b)b.hidden=false;
  });
  const share=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M7 10H5v11h14V10h-2"/></svg>`;
  const steps=ios
    ?[`Tik op het deel-icoon ${share} (in Safari onderaan, op een iPad bovenaan).`,"Scroll naar beneden en kies <b>Zet op beginscherm</b>.","Tik rechtsboven op <b>Voeg toe</b>."]
    :["Tik rechtsboven op het menu <b>⋮</b>.","Kies <b>App installeren</b> of <b>Toevoegen aan startscherm</b>.","Bevestig met <b>Installeren</b> of <b>Toevoegen</b>."];
  const fine=ios?"Lukt het niet? Open de site dan eerst in Safari.":"Gebruik je Samsung Internet? Kies dan in het menu ≡ voor <b>Pagina toevoegen aan</b> → <b>Startscherm</b>.";

  const show=()=>{
    try{if(localStorage.getItem("installTip"))return;localStorage.setItem("installTip","1");}catch(e){return;}
    const el=document.createElement("div");
    el.className="sheet"; el.setAttribute("role","dialog"); el.setAttribute("aria-labelledby","sheet-t");
    el.innerHTML=`<div class="sheet-in">
      <button class="sheet-x" type="button" aria-label="Sluiten">×</button>
      <div class="label">Tip</div>
      <h2 id="sheet-t">Zet deze site op je beginscherm</h2>
      <p>Dan open je je deadlines met één tik, net als een app.</p>
      <ol>${steps.map(s=>`<li><span>${s}</span></li>`).join("")}</ol>
      <p class="fine">${fine}</p>
      <div class="sheet-act"><button class="btn primary" id="sheet-install" type="button"${deferred?"":" hidden"}>Installeren</button><button class="btn" id="sheet-ok" type="button">Begrepen</button></div>
    </div>`;
    document.body.appendChild(el);
    const close=()=>{
      removeEventListener("keydown",onKey);
      if(reduceMotion.matches){el.remove();return;}
      el.classList.add("out");
      setTimeout(()=>el.remove(),220);
    };
    const onKey=e=>{if(e.key==="Escape")close();};
    addEventListener("keydown",onKey);
    el.querySelector(".sheet-x").addEventListener("click",close);
    $("#sheet-ok").addEventListener("click",close);
    $("#sheet-install").addEventListener("click",async()=>{if(deferred){deferred.prompt();await deferred.userChoice;deferred=null;}close();});
  };
  // Een vooraf geladen (prerender) pagina toont de tip pas als je ze echt opent.
  const start=()=>setTimeout(show,1500);
  if(document.prerendering)document.addEventListener("prerenderingchange",start,{once:true});else start();
})();

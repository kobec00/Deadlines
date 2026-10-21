// Alle data van de site. index.html (lijst) en kalender.html lezen allebei dit bestand.
// Voor lessen (datum, uur, lokaal) is het lesrooster in TimeEdit de meest actuele bron.
// d = start (JJJJ-MM-DDTUU:MM), e = einduur (lessen), r = lokaal, p = uitleg, n = "let op"-melding.
// CHECKED = datum waarop alles laatst is nagekeken (JJJJ-MM-DD). Na 14 dagen toont de site een waarschuwing.
const CHECKED="2026-10-21";
const COURSES={
  feh:{abbr:"F&EH",name:"Filosofisch & ethisch handelen"},
  dsh:{abbr:"DSH",name:"Divers-sensitief handelen"},
  soi:{abbr:"SO&I",name:"Sociaal ondernemen & innoveren"},
};
const SOI_TBC="Het lesrooster vermeldt geen programma. Volgens de SO&I-planning komen er nog een sessie ‘leren pitchen’ en een sessie proefpresentaties.";
const ITEMS = [
  {d:"2026-10-08T17:00", e:"21:30", v:"feh", k:"les", t:"Filosofisch & ethisch handelen", r:"STH 1.07"},
  {d:"2026-10-15T16:00", e:"19:00", v:"soi", k:"les", t:"Sociaal ondernemen & innoveren", r:"STH 0.07"},
  {d:"2026-10-22T17:00", e:"20:30", v:"feh", k:"les", t:"Werksessie Ethisch Dilemma, stap 1–3", r:"STH 1.07", p:"Lees vooraf het ‘stappenplan Ethisch Dilemma’ (Toledo, Leermateriaal)."},
  {d:"2026-10-29T17:00", e:"20:30", v:"dsh", k:"les", t:"Les + feedbackmoment over je boekkeuze", r:"STH 1.07", p:"Thema's: superdiversiteit, armoede, racisme/discriminatie."},
  {d:"2026-10-29T23:59", v:"dsh", k:"deadline", t:"Titel van je gekozen boek", p:"Opdracht ‘titel keuze van je boek’ op Toledo."},
  {d:"2026-11-11T23:59", v:"feh", k:"deadline", t:"Casus Ethisch Dilemma", p:"Opdracht ‘Casus Ethisch Dilemma’ op Toledo.", n:"Deze deadline staat alleen op Toledo en niet in het planningsdocument."},
  {d:"2026-11-12T17:00", e:"21:30", v:"feh", k:"les", t:"Werksessie Ethisch Dilemma, stap 4–7", r:"STH 1.07"},
  {d:"2026-11-19T17:00", e:"20:30", v:"soi", k:"les", t:"Sociaal ondernemen & innoveren", r:"STH 1.07", p:SOI_TBC},
  {d:"2026-12-03T17:00", e:"20:00", v:"dsh", k:"les", t:"Maatschappelijke realiteit + implementatie van de concepten", r:"STH 1.07", p:"Verplaatst van 26/11 naar 3/12."},
  {d:"2026-12-10T16:00", e:"17:00", v:"feh", k:"les", t:"Info & algemeenheden: Taal en ICT", r:"STH 0.02", p:"Gezamenlijke sessie voor meerdere vakken, waaronder F&EH. Met Karen De Loenen en Greet van der Wielen."},
  {d:"2026-12-10T17:00", e:"19:00", v:"feh", k:"les", t:"Responsiecollege: presentaties Ethisch Dilemma", r:"STH 1.07"},
  {d:"2026-12-10T19:30", e:"21:30", v:"dsh", k:"les", t:"Responsiecollege (vragen over de leerstof)", r:"STH 1.07", p:"Bereid je vragen voor, want hier wordt ook het mondeling examen toegelicht."},
  {d:"2026-12-17T17:00", e:"20:30", v:"soi", k:"les", t:"Sociaal ondernemen & innoveren", r:"STH 1.08", p:SOI_TBC},
  {d:"2026-12-24T12:00", v:"dsh", k:"deadline", t:"Opdracht boek (30%)", p:"Max. 3 pagina's: samenvatting (1 A4), kritische bespreking (max. 2 A4) en 2 stellingen.", n:"De deadline is om 12:00 's middags, niet om middernacht."},
  {d:"2027-01-06T23:59", v:"feh", k:"deadline", t:"Eindportfolio Ethisch Dilemma (per groep)", p:"Eén persoon per groep dient in en mailt daarna de docent en de andere groepsleden."},
  {d:"2027-01-06T23:59", v:"feh", k:"deadline", t:"Werkje over Verhaeghe", p:"Je vragen over ‘Over normaliteit en andere afwijkingen’, max. 2 A4.", n:"Staat in het werkboek, maar op Toledo is hiervoor nog geen aparte indienmap."},
  {d:"2027-01-12T09:45", v:"dsh", k:"examen", t:"Mondeling examen DSH (dag 1)", p:"Max. 20 min per persoon. Je tijdslot vind je in ‘Volgorde examen DSH’ op Toledo."},
  {d:"2027-01-14T09:00", v:"feh", k:"examen", t:"Examen F&EH: 14/01 of 21/01", noTime:true, p:"Mogelijk komen er extra momenten op 12/01 en/of 19/01.", n:"Het planningsdocument zegt ‘mondeling’, het werkboek zegt ‘schriftelijk’ (meerkeuze + open vragen). Vraag dit na bij de docent."},
  {d:"2027-01-14T16:30", v:"dsh", k:"examen", t:"Mondeling examen DSH (dag 2)", p:"Max. 20 min per persoon. Je tijdslot vind je in ‘Volgorde examen DSH’ op Toledo."},
];
// Items zonder datum. De bullets zijn bewust HTML (voor <em>/<strong>).
const UNDATED = [
  {v:"soi", k:"examen", t:"Examen SO&I: groepspitch + persoonlijke reflectie (filmpje)", li:[
    "Pitch over je small business project (10 punten) en een persoonlijke reflectie als filmpje of ingesproken ppt (10 punten).",
    "Indienen via de map <em>Examen</em> op Toledo. De einddatum daar staat nog op 22/01/<strong>2026</strong>, dus die is van vorig jaar en nog niet aangepast.",
    "De duur van de pitch is onduidelijk: de richtlijnen (versie 24-25) zeggen max. 10 min, het document van sessie 3 zegt max. 15 min.",
    "Volgens de planning komen er nog een sessie \"leren pitchen\" en een sessie proefpresentaties. In het lesrooster staan nog SO&amp;I-lessen op 19/11 en 17/12."]},
  {v:"dsh", k:"opdracht", t:"Digitale oefening ZIEDET", li:[
    "Staat in de planning tussen de lessen van 29/10 en 3/12, zonder vaste deadline."]},
];

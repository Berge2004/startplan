(function () {
"use strict";
var START_W=102, GOAL_W=85, KCAL=2000, PRO=180, NFOCUS=5, NSESS=3;
var START_D=new Date(2026,7,31), END_D=new Date(2027,3,1);
var MILES=[100,95,90,85], DAY=86400000;
var TOT_WEEKS=(END_D-START_D)/(7*DAY);
var TOT_WI=Math.ceil(TOT_WEEKS);
var TABS=['oversikt','mat','trening','helse','progresjon'];
var SESSK=['mon','wed','fri'], SESSN={mon:'Mandag',wed:'Onsdag',fri:'Fredag'};
var K={ w:'ab-weight-v2', days:'sp.days.v1', focus:'sp.focusdays.v1', shop:'sp.shop.v1',
tab:'ab-plan-tab-v2', hero:'sp.hero.v1', sess:'sp.sessweek.v1' };
var OLDW='ab-weight-v1';
var OLD={ day:'ab-day-v1', focus:'sp.focus.v1', shop:'andreas-shop-sept-2026' };
var OLD_SHOP=['Karbonadedeig 5–6 %, 1,2 kg','Kjøttdeig 5 %, 1 kg','Kyllingfilet, storpakk 1,2 kg','Kokt skinke, 3 pakker','Egg, 24 stk (str. L)','Norvegia Redusert Fett, 2 pk','Tine Styrke Protein, 5–7 stk','Toro Jasmin Boil in Bag, 1 kg','Poteter, 3 kg','Grovbrød, 2 stk (frys det ene)','Tortilla medium + store','Pasta, 1 pk','Grove hamburgerbrød','Frossen grønnsaksblanding, 2 pk','Frossen wokblanding, 1 pk','Hakkede tomater, 4 bokser','Mais, 2 bokser','Løk og paprika','Banan, 7 stk','Melon eller ananas','Agurk og cherrytomat','Salsa, 2 glass','Taco-krydder','Sukkerfri ketchup','Soyasaus og sriracha','Toro brun saus','Stekespray eller olje','Sukkerfri brus','Lett mikropopcorn'];
var MON=['januar','februar','mars','april','mai','juni','juli','august','september','oktober','november','desember'];
var MS=['jan','feb','mar','apr','mai','jun','jul','aug','sep','okt','nov','des'];
var DOW=['søndag','mandag','tirsdag','onsdag','torsdag','fredag','lørdag'];
var mem={}, storageOk=true;
function rg(k){ try{ var v=localStorage.getItem(k); return v===null?(k in mem?mem[k]:null):v; }catch(e){ return (k in mem)?mem[k]:null; } }
function rs(k,v){ mem[k]=v; try{ localStorage.setItem(k,v); return localStorage.getItem(k)===v; }catch(e){ return false; } }
function ld(k,fb){ var r=rg(k); if(r==null) return fb; try{ var q=JSON.parse(r); return q==null?fb:q; }catch(e){ return fb; } }
function sv(k,v){ return rs(k,JSON.stringify(v)); }
function $(id){ return document.getElementById(id); }
function tx(id,v){ var e=$(id); if(e) e.textContent=v; }
function wd(id,q){ var e=$(id); if(e) e.style.width=Math.max(0,Math.min(100,q))+'%'; }
function nb(n,d){ d=(d===undefined?1:d); var m=Math.pow(10,d); return (Math.round(n*m)/m).toFixed(d).replace('.',','); }
function sg(n,d){ return (n<=0?nb(n,d):'+'+nb(n,d)); }
function th(n){ return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,' '); }
function iso(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function pi(x){ var q=String(x).split('-'); return new Date(+q[0],(+q[1])-1,+q[2]); }
function today(){ return iso(new Date()); }
function sd(x){ var d=pi(x); return d.getDate()+'. '+MS[d.getMonth()]; }
function mondayOf(d){ var t=new Date(d.getFullYear(),d.getMonth(),d.getDate()); t.setDate(t.getDate()-((t.getDay()+6)%7)); return t; }
function weekNo(d){ return Math.max(1,Math.round((mondayOf(d)-START_D)/(7*DAY))+1); }
function p2(n){ return String(n).padStart(2,'0'); }
function past(){ return new Date() > END_D; }
var S={ weights:[], days:{}, focus:{}, shop:{}, sess:{} };
function normW(list){
var m={};
(list||[]).forEach(function(x){
if(!x || !isFinite(+x.kg) || !x.d) return;
var d=String(x.d), wk=x.wk?String(x.wk):iso(mondayOf(pi(d)));
m[wk]={ wk:wk, d:d, kg:+x.kg };
});
var out=[]; for(var k in m) if(m.hasOwnProperty(k)) out.push(m[k]);
out.sort(function(p1,p2){ return p1.wk<p2.wk?-1:(p1.wk>p2.wk?1:0); });
return out;
}
function hydrate(){
storageOk = rs('sp.probe','1');
var w=ld(K.w,null);
if(!Array.isArray(w)) w=ld(OLDW,[]);
S.weights=normW(w);
if(S.weights.length) sv(K.w,S.weights);
var dd=ld(K.days,null);
if(dd && typeof dd==='object' && !Array.isArray(dd)) S.days=dd;
else { S.days={}; var od=ld(OLD.day,null);
if(od && od.date){ S.days[od.date]={ e:Array.isArray(od.entries)?od.entries:[] }; sv(K.days,S.days); } }
var fd=ld(K.focus,null);
if(fd && typeof fd==='object' && !Array.isArray(fd)) S.focus=fd;
else { S.focus={}; var of2=ld(OLD.focus,null);
if(of2 && of2.date && of2.done){ S.focus[of2.date]=of2.done; sv(K.focus,S.focus); } }
var se=ld(K.sess,null);
S.sess=(se && typeof se==='object' && !Array.isArray(se))?se:{};
var sh=ld(K.shop,null);
if(sh && typeof sh==='object' && !Array.isArray(sh)) S.shop=sh;
else { S.shop={}; var lg=ld(OLD.shop,null);
if(Array.isArray(lg)){ lg.forEach(function(c,i){ if(c && OLD_SHOP[i]) S.shop[OLD_SHOP[i]]=true; }); sv(K.shop,S.shop); } }
}
function dayObj(){ var t=today(); if(!S.days[t]) S.days[t]={e:[]}; if(!S.days[t].e) S.days[t].e=[]; return S.days[t]; }
function focObj(){ var t=today(); if(!S.focus[t]) S.focus[t]={}; return S.focus[t]; }
function sessObj(mk){ mk=mk||iso(mondayOf(new Date())); if(!S.sess[mk]) S.sess[mk]={}; return S.sess[mk]; }
function saveDays(){ return sv(K.days,S.days); }
function saveFocus(){ return sv(K.focus,S.focus); }
function saveSess(){ return sv(K.sess,S.sess); }
function saveW(){ return sv(K.w,S.weights); }
function saveShop(){ return sv(K.shop,S.shop); }
function last(){ return S.weights.length?S.weights[S.weights.length-1]:null; }
function prev(){ return S.weights.length>1?S.weights[S.weights.length-2]:null; }
function curW(){ var l=last(); return l?l.kg:START_W; }
function planAt(t){ var f=(t-START_D)/(END_D-START_D); return START_W-(START_W-GOAL_W)*Math.min(1,Math.max(0,f)); }
function dayTot(o){ var k=0,q=0; (o.e||[]).forEach(function(e){ k+=(+e.k||0); q+=(+e.p||0); }); return {k:k,p:q}; }
function devAvg(n){
var L=S.weights; if(!L.length) return null;
var k=Math.min(n||3,L.length), sum=0;
for(var i=L.length-k;i<L.length;i++) sum+=(L[i].kg-planAt(pi(L[i].wk)));
return sum/k;
}
function avgWeekly(){
var L=S.weights; if(!L.length) return null;
var b=L[L.length-1];
if(L.length===1){ var g0=(pi(b.wk)-START_D)/(7*DAY); return g0>=1?(b.kg-START_W)/g0:null; }
var a0=L[0], g=(pi(b.wk)-pi(a0.wk))/(7*DAY);
return g>0?(b.kg-a0.kg)/g:null;
}
function weekStats(mk){
var m=pi(mk), k=0,q=0,n=0;
for(var i=0;i<7;i++){
var d=new Date(m.getFullYear(),m.getMonth(),m.getDate()+i), o=S.days[iso(d)];
if(o && o.e && o.e.length){ var t=dayTot(o); k+=t.k; q+=t.p; n++; }
}
return { k:n?k/n:0, p:n?q/n:0, n:n };
}
function sessCount(mk){ var o=S.sess[mk]||{}, n=0; SESSK.forEach(function(x){ if(o[x]) n++; }); return n; }
function stats(){
var now=new Date();
var dl=Math.max(0,Math.ceil((END_D-now)/DAY));
var wks=Math.max(0.2,dl/7);
var w=curW(), left=Math.max(0,w-GOAL_W);
return { now:now, dl:dl, wks:wks, w:w, left:left, over:past(),
rate:past()?null:left/wks, dev:devAvg(3), avgw:avgWeekly(),
pct:Math.min(100,Math.max(0,(START_W-w)/(START_W-GOAL_W)*100)), lost:START_W-w };
}
function statusOf(st){
if(st.over){
return { lvl:(st.w<=GOAL_W+0.5?'green':'yellow'), tag:'Måldato nådd',
t:'Måldatoen 1. april 2027 er passert.',
b:'Start 102,0 kg · nå '+nb(st.w)+' kg · totalt ned '+nb(st.lost)+' kg. Opprinnelig mål var 85,0 kg. Si ifra når du vil sette et nytt mål, så regner vi ut en ny kurve.' };
}
if(!S.weights.length) return { lvl:'idle', tag:'Oppstart', t:'Legg inn din første mandagsvekt',
b:'Vei deg mandag morgen og lagre tallet. Da får du grønt, gult eller rødt lys på om du ligger an til 85 kg til 1. april.' };
if(st.left<=0) return { lvl:'green', tag:'I mål', t:'Du er i mål — 85 kg er nådd.',
b:'Nå handler alt om å holde det. Vedlikehold, styrke og form fremfor nye kutt.' };
var d=st.dev, aw=st.avgw, lvl, tag, t;
if(d<=-0.5){ lvl='green'; tag='Foran plan'; t='Du ligger '+nb(-d)+' kg foran plankurven.'; }
else if(d<=0.5){ lvl='green'; tag='På plan'; t='Du ligger på plan mot 85 kg.'; }
else if(d<=1.0){ lvl='yellow'; tag='Litt bak'; t='Du ligger '+nb(d)+' kg bak plankurven.'; }
else { lvl='red'; tag='Bak plan'; t='Du ligger '+nb(d)+' kg bak plankurven.'; }
if(aw!==null && S.weights.length>1){
if(aw>0.25 && lvl!=='red'){ lvl='red'; tag='Feil vei'; t='Vekta har gått oppover de siste ukene.'; }
else if(aw>0.05 && lvl==='green'){ lvl='yellow'; tag='Flat trend'; t='Vekta står stille eller kryper oppover.'; }
}
var bits=[];
bits.push('Du trenger '+nb(st.rate,2)+' kg i uka de neste '+nb(st.wks)+' ukene.');
if(aw!==null) bits.push('Faktisk snitt så langt: '+sg(aw,2)+' kg per uke.');
if(S.weights.length===1) bits.push('Én veiing er ikke en trend — vi vurderer først etter tre.');
if(lvl==='green') bits.push('Fortsett akkurat som nå — ingenting skal endres.');
else if(lvl==='yellow') bits.push('Stram opp loggingen og skrittene først. Ikke rør kaloriene ennå.');
else bits.push('Sjekk loggingen i to uker før vi endrer noe — så justerer vi kalorier eller dato.');
return { lvl:lvl, tag:tag, t:t, b:bits.join(' ') };
}
function nextWeighIn(){
if(past()) return { due:false, txt:'Måldatoen er passert' };
var now=new Date(), t0=new Date(now.getFullYear(),now.getMonth(),now.getDate());
var mk=iso(mondayOf(now)), logged=false;
for(var i=0;i<S.weights.length;i++) if(S.weights[i].wk===mk){ logged=true; break; }
if(!logged) return { due:true, txt: now.getDay()===1?'Innveiing i dag — mandag':'Mangler innveiing denne uka' };
var nx=new Date(pi(mk).getTime()); nx.setDate(nx.getDate()+7);
var dd=Math.round((nx-t0)/DAY);
return { due:false, txt:'Neste innveiing: mandag '+sd(iso(nx))+(dd===1?' · i morgen':' · om '+dd+' dager') };
}
function rHead(st){
var d=st.now;
tx('heroToday', DOW[d.getDay()].charAt(0).toUpperCase()+DOW[d.getDay()].slice(1)+' '+d.getDate()+'. '+MON[d.getMonth()]);
tx('heroPhase', past()?'Perioden er over':('Uke '+Math.min(TOT_WI,weekNo(d))+' / '+TOT_WI));
tx('brandSub', nb(st.w)+' kg → 85 kg');
}
function rStatus(st){
var o=statusOf(st), box=$('statBox');
if(box) box.className='status '+o.lvl;
tx('statTitle',o.t); tx('statBody',o.b); tx('statTag',o.tag);
var warn=$('storeWarn');
if(!storageOk && !warn && box && box.parentNode){
warn=document.createElement('div'); warn.id='storeWarn'; warn.className='status red';
warn.innerHTML='<span class="sdot"></span><div style="flex:1;min-width:0"><div class="stt">Denne visningen kan ikke lagre</div><div class="sbd">Nettleseren blokkerer lagring her, så alt forsvinner når du lukker siden. Åpne appen på sin egen adresse i stedet for inni en annen app.</div></div>';
box.parentNode.insertBefore(warn,box);
}
}
function rWeight(st){
var L=last(), P=prev();
tx('qwNow', nb(st.w));
if(L){
var lbl='Mandagsvekt uke '+weekNo(pi(L.wk));
if(L.d!==L.wk) lbl+=' — registrert '+DOW[pi(L.d).getDay()]+' '+sd(L.d);
else lbl+=' · '+sd(L.d);
tx('qwMeta', lbl+(past()?'':' · '+st.dl+' dager igjen'));
} else tx('qwMeta','Startvekt · ingen innveiing lagret ennå');
tx('qwAvg', L?nb(L.kg):'—');
tx('qwLost', nb(st.lost));
tx('qwLeft', nb(st.left));
wd('qwBar',st.pct); tx('qwPct',nb(st.pct,1)+' %');
var nx=nextWeighIn(), np=$('wkNext');
if(np){ np.className='nextw'+(nx.due?' due':''); np.textContent=nx.txt; }
var tr=$('qwTrend'), t='';
if(tr) tr.className='trend';
if(st.over){ if(tr) tr.className='trend sky'; t='Måldatoen er passert'; }
else if(st.left<=0){ t='Målet er nådd'; }
else if(!L){ if(tr) tr.className='trend sky'; t='Legg inn første mandagsvekt'; }
else {
var d=st.dev;
if(d<=-0.5) t='Foran plan · '+nb(-d)+' kg';
else if(d<=0.5) t='På plan';
else if(d<=1.0){ if(tr) tr.className='trend warn'; t='Litt bak plan · '+nb(d)+' kg'; }
else { if(tr) tr.className='trend hot'; t='Bak plan · '+nb(d)+' kg'; }
if(P) t+=' · '+sg(L.kg-P.kg)+' kg siste uke';
}
tx('qwTrendTxt',t);
tx('mLeft',nb(st.left));
tx('mWeeks',past()?'0':String(st.dl));
tx('mDays',past()?'måldato passert':nb(st.wks)+' uker');
tx('mRate',past()?'—':nb(st.rate,2));
var nm=null; for(var i=0;i<MILES.length;i++){ if(st.w-MILES[i]>0.05){ nm=MILES[i]; break; } }
if(nm===null){ tx('mMile','✓'); tx('mMileSub','alle delmål passert'); }
else { var tg=st.w-nm, uk=(!past()&&st.rate>0.01)?Math.max(1,Math.round(tg/st.rate)):0;
tx('mMile',nm); tx('mMileSub',nb(tg)+' kg unna'+(uk?' · ~'+uk+(uk===1?' uke':' uker'):'')); }
var h=$('motHead'), sb=$('motSub');
if(st.over){
if(h) h.textContent='Måldato nådd · 1. april 2027';
if(sb) sb.textContent='Start 102,0 kg · nå '+nb(st.w)+' kg · totalt ned '+nb(st.lost)+' kg. Opprinnelig mål 85,0 kg.';
} else if(st.left<=0){
if(h) h.textContent='Du er i mål. Nå handler det om å holde det.';
if(sb) sb.textContent='Fokuset flyttes fra vektnedgang til vedlikehold, styrke og form.';
} else {
if(h) h.textContent=nb(st.left)+' kg igjen på '+nb(st.wks)+' uker.';
if(sb) sb.textContent = st.rate<=0.75
? 'Det holder med '+nb(st.rate,2)+' kg i uka. Fullt innen rekkevidde med planen du allerede har.'
: (st.rate<=1.0 ? 'Krever '+nb(st.rate,2)+' kg i uka. Det går, men marginen for slappe uker er liten.'
: 'Det krever '+nb(st.rate,2)+' kg i uka. Bedre å flytte datoen litt enn å sulte seg gjennom vinteren.');
}
}
function rDay(){
var o=dayObj(), t=dayTot(o), left=KCAL-t.k;
var el=$('kcalLeft');
if(el){ el.textContent=left<0?'+'+th(-left):th(left); el.classList.toggle('over',left<0); }
tx('kcalSum', th(t.k)+' kcal spist så langt'+(left<0?' — over målet':''));
tx('kcalTxt', th(t.k)+' / '+th(KCAL)+' kcal'); wd('kcalBar', t.k/KCAL*100);
tx('proTxt', Math.round(t.p)+' / '+PRO+' g'); wd('proBar', t.p/PRO*100);
var log=$('kcalLog');
if(log){
log.innerHTML='';
if(!o.e.length) log.innerHTML='<div class="empty">Ingenting logget ennå.</div>';
else o.e.forEach(function(e,i){
var r=document.createElement('div'); r.className='e';
var sp=document.createElement('span'); sp.className='ec';
sp.textContent=th(e.k)+' kcal'+(e.p?' · '+Math.round(e.p)+' g protein':'');
var bt=document.createElement('button'); bt.type='button'; bt.textContent='×'; bt.setAttribute('aria-label','Fjern');
bt.addEventListener('click',function(){ o.e.splice(i,1); saveDays(); render(); });
r.appendChild(sp); r.appendChild(bt); log.appendChild(r);
});
}
var f=focObj(), fl=$('focusList'), done=0;
if(fl) [].forEach.call(fl.querySelectorAll('input[data-focus]'),function(cb){
var on=!!f[cb.getAttribute('data-focus')]; cb.checked=on; if(on) done++;
});
tx('focusCount', done+' av '+NFOCUS+' gjort');
tx('focusPct', Math.round(done/NFOCUS*100)+' %');
wd('focusBar', done/NFOCUS*100);
}
function rSess(){
var mk=iso(mondayOf(new Date())), o=S.sess[mk]||{}, n=0, sl=$('sessList');
if(sl) [].forEach.call(sl.querySelectorAll('input[data-sess]'),function(cb){
var on=!!o[cb.getAttribute('data-sess')]; cb.checked=on; if(on) n++;
});
tx('sessCount', n+' av '+NSESS+' gjort');
wd('sessBar', n/NSESS*100);
}
function trendLine(){
var L=S.weights; if(L.length<2) return null;
var k=Math.min(4,L.length), pts=[];
for(var i=L.length-k;i<L.length;i++) pts.push({ x:pi(L[i].wk).getTime(), y:L[i].kg });
var n=pts.length, sx=0,sy=0,sxx=0,sxy=0;
pts.forEach(function(q){ sx+=q.x; sy+=q.y; sxx+=q.x*q.x; sxy+=q.x*q.y; });
var den=n*sxx-sx*sx; if(!den) return null;
var m=(n*sxy-sx*sy)/den, c=(sy-m*sx)/n;
return { at:function(t){ return m*t+c; }, x0:pts[0].x };
}
function chart(){
var svg=$('wChart'); if(!svg) return;
var W=640,H=210,pl=44,pr=18,pt=16,pb=28;
var t0=START_D.getTime(), te=END_D.getTime();
var vals=[START_W,GOAL_W]; S.weights.forEach(function(x){ vals.push(x.kg); });
var mx=Math.max.apply(null,vals)+1.2, mn=Math.min.apply(null,vals)-1.2, sp=Math.max(1,mx-mn);
function x(t){ return pl+(t-t0)/(te-t0)*(W-pl-pr); }
function y(v){ return pt+(mx-v)/sp*(H-pt-pb); }
var s2='';
[0,.5,1].forEach(function(f){
var v=mx-f*sp, yy=y(v);
s2+='<line class="gl" x1="'+pl+'" y1="'+yy.toFixed(1)+'" x2="'+(W-pr)+'" y2="'+yy.toFixed(1)+'"/>';
s2+='<text x="6" y="'+(yy+4).toFixed(1)+'">'+Math.round(v)+'</text>';
});
s2+='<path class="plan" d="M'+x(t0).toFixed(1)+' '+y(START_W).toFixed(1)+' L'+x(te).toFixed(1)+' '+y(GOAL_W).toFixed(1)+'"/>';
var gy=y(GOAL_W);
if(gy>pt&&gy<H-pb){
s2+='<line class="goal" x1="'+pl+'" y1="'+gy.toFixed(1)+'" x2="'+(W-pr)+'" y2="'+gy.toFixed(1)+'"/>';
s2+='<text x="'+(W-pr-52)+'" y="'+(gy-7).toFixed(1)+'">mål 85 kg</text>';
}
var tl=trendLine();
if(tl){
var ya=tl.at(tl.x0), yb=tl.at(te);
yb=Math.max(mn,Math.min(mx,yb));
s2+='<path class="raw" stroke-dasharray="4 4" d="M'+x(tl.x0).toFixed(1)+' '+y(ya).toFixed(1)+' L'+x(te).toFixed(1)+' '+y(yb).toFixed(1)+'"/>';
}
var pts=[{wk:iso(START_D),kg:START_W}].concat(S.weights);
if(pts.length>1){
var d=pts.map(function(q,i){ return (i?'L':'M')+x(pi(q.wk).getTime()).toFixed(1)+' '+y(q.kg).toFixed(1); }).join(' ');
var lx=x(pi(pts[pts.length-1].wk).getTime()).toFixed(1);
s2+='<path class="area" d="'+d+' L'+lx+' '+(H-pb)+' L'+x(t0).toFixed(1)+' '+(H-pb)+' Z"/>';
s2+='<path class="avg" d="'+d+'"/>';
}
pts.forEach(function(q,i){
var lst=i===pts.length-1;
s2+='<circle class="'+(lst?'last':'dot')+'" cx="'+x(pi(q.wk).getTime()).toFixed(1)+'" cy="'+y(q.kg).toFixed(1)+'" r="'+(lst?5.5:3.2)+'"/>';
});
s2+='<text x="'+pl+'" y="'+(H-8)+'">31. aug 2026</text>';
s2+='<text x="'+(W-pr-62)+'" y="'+(H-8)+'">1. apr 2027</text>';
var nowX=x(Math.min(te,Math.max(t0,Date.now())));
s2+='<line x1="'+nowX.toFixed(1)+'" y1="'+pt+'" x2="'+nowX.toFixed(1)+'" y2="'+(H-pb)+'" stroke="#D4CDB8" stroke-width="1" stroke-dasharray="2 3"/>';
svg.innerHTML='<defs><linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6FAC4E" stop-opacity=".22"/><stop offset="1" stop-color="#6FAC4E" stop-opacity="0"/></linearGradient></defs>'+s2;
}
function rProg(st){
var L=last(), P=prev();
wd('pBar',st.pct); tx('pPct',nb(st.pct,1)+' % fullført');
tx('pNow', nb(st.w)+' kg');
tx('pNowDate', L?('Sist veid '+sd(L.d)):'Ingen innveiing lagret ennå');
tx('pLost', (st.lost<0?'+'+nb(-st.lost):nb(st.lost))+' kg');
tx('pDeadline', past()?'1. april 2027 · passert':('1. april 2027 · '+st.dl+' dager'));
tx('aNow', L?nb(L.kg)+' kg':'—');
tx('aNowSub', L?('Uke '+weekNo(pi(L.wk))+' · '+sd(L.d)):'Legg inn en innveiing for å starte');
tx('aPrev', P?nb(P.kg)+' kg':'—');
tx('aPrevSub', P?('Uke '+weekNo(pi(P.wk))+' · '+sd(P.d)):'Trenger to uker med data');
tx('aDelta', st.avgw===null?'—':sg(st.avgw,2)+' kg');
tx('aDeltaSub', st.avgw===null?'kg per uke så langt':'plan: −0,56 kg per uke');
var mk=iso(mondayOf(new Date()));
var pkD=new Date(pi(mk).getTime()-7*DAY), pk=iso(pkD);
var early=pkD<START_D;
var ws=early?{k:0,p:0,n:0}:weekStats(pk), sc=early?0:sessCount(pk);
if(early){
var f1=new Date(START_D.getTime()+7*DAY);
tx('ciHead','Første check-in mandag '+sd(iso(f1))+' — etter din første hele uke');
} else {
tx('ciHead','Uke '+weekNo(pi(mk))+' · check-in for uka '+sd(pk)+'–'+sd(iso(new Date(pi(pk).getTime()+6*DAY))));
}
tx('ciAvg', L?nb(L.kg)+' kg':'______');
tx('ciPrev', P?nb(P.kg)+' kg':'______');
tx('ciDelta', (L&&P)?sg(L.kg-P.kg)+' kg':'______');
tx('ciTotal', L?nb(st.lost)+' kg':'______');
tx('ciRate', st.avgw===null?'______':sg(st.avgw,2)+' kg/uke');
tx('ciKcal', ws.n?th(ws.k)+' kcal':'______');
tx('ciPro', ws.n?Math.round(ws.p)+' g':'______');
tx('ciDays', ws.n?ws.n+' / 7 dager':'______');
tx('ciSess', early?'______':(sc+' / 3 økter'));
['ciAvg','ciPrev','ciDelta','ciTotal','ciRate','ciKcal','ciPro','ciDays','ciSess'].forEach(function(id){
var e=$(id); if(e) e.classList.toggle('fill', e.textContent!=='______');
});
var wl=$('wLog');
if(wl){
wl.innerHTML='';
if(!S.weights.length) wl.innerHTML='<div class="empty">Ingen innveiinger lagret ennå.</div>';
else S.weights.slice().reverse().forEach(function(x,ri){
var ix=S.weights.length-1-ri;
var r=document.createElement('div'); r.className='e';
var sp=document.createElement('span'); sp.className='ec';
sp.textContent='Uke '+weekNo(pi(x.wk))+' · '+nb(x.kg)+' kg'+(x.d!==x.wk?' ('+DOW[pi(x.d).getDay()]+' '+sd(x.d)+')':' ('+sd(x.d)+')');
var bt=document.createElement('button'); bt.type='button'; bt.textContent='×'; bt.setAttribute('aria-label','Slett innveiing');
bt.addEventListener('click',function(){ S.weights.splice(ix,1); saveW(); render(); });
r.appendChild(sp); r.appendChild(bt); wl.appendChild(r);
});
}
chart();
}
function rShop(){
var l=$('shoplist'); if(!l) return;
var bs=[].slice.call(l.querySelectorAll('input[type=checkbox]')), n=0;
bs.forEach(function(b){
var lb=b.nextElementSibling?b.nextElementSibling.textContent.trim():'';
b.setAttribute('data-item',lb); b.checked=!!S.shop[lb]; if(b.checked) n++;
});
tx('shopCount', n+' av '+bs.length+' krysset av');
}
function render(){
try{ var st=stats(); rHead(st); rStatus(st); rWeight(st); rDay(); rSess(); rProg(st); rShop(); }catch(e){}
}
var lastDay=today();
function tick(){
var now=new Date();
var mid=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,0,0,0,0);
var q=Math.max(0,Math.floor((mid-now)/1000));
var cd=p2(Math.floor(q/3600))+':'+p2(Math.floor(q/60)%60)+':'+p2(q%60);
tx('cdown', cd); tx('dayReset','nullstilles om '+cd);
if(today()!==lastDay){ lastDay=today(); dayObj(); focObj(); saveDays(); saveFocus(); render(); }
}
function showTab(name,push){
if(TABS.indexOf(name)<0) name='oversikt';
TABS.forEach(function(t){ var q=$('p-'+t); if(q) q.hidden=(t!==name); });
var q2=$('p-'+name);
if(q2){ q2.classList.remove('enter'); void q2.offsetWidth; q2.classList.add('enter'); }
[].forEach.call(document.querySelectorAll('[data-tab]'),function(b){
b.setAttribute('aria-selected', b.getAttribute('data-tab')===name?'true':'false');
});
rs(K.tab,name);
if(push && location.hash!=='#'+name){ try{ history.replaceState(null,'','#'+name); }catch(e){ location.hash=name; } }
if(name==='progresjon') chart();
}
var tt=null;
function toast(msg,which){
var t=$(which||'wToast'); if(!t) return;
t.textContent='✓ '+msg; t.classList.add('on');
if(tt) clearTimeout(tt);
tt=setTimeout(function(){ t.classList.remove('on'); },2600);
}
function saveWeight(inpId,toastId){
var inp=$(inpId); if(!inp) return;
var v=parseFloat(String(inp.value).replace(',','.'));
if(!isFinite(v)||v<40||v>250){ inp.focus(); if(inp.select) inp.select(); return; }
v=Math.round(v*10)/10;
var d=today(), wk=iso(mondayOf(new Date())), found=false;
for(var i=0;i<S.weights.length;i++){ if(S.weights[i].wk===wk){ S.weights[i].kg=v; S.weights[i].d=d; found=true; break; } }
if(!found) S.weights.push({wk:wk,d:d,kg:v});
S.weights=normW(S.weights);
var ok=saveW(); inp.value=''; render();
var extra=found?' (erstattet ukas veiing)':'';
toast(ok?(nb(v)+' kg lagret'+extra):(nb(v)+' kg lagret (kun denne økten)'), toastId);
}
function addEntry(){
var ik=$('inKcal'), ip=$('inPro');
var k=ik?parseFloat(ik.value):NaN, q=ip?parseFloat(ip.value):NaN;
if(!isFinite(k)&&!isFinite(q)){ if(ik) ik.focus(); return; }
dayObj().e.push({ k:isFinite(k)?Math.max(0,k):0, p:isFinite(q)?Math.max(0,q):0 });
saveDays(); if(ik) ik.value=''; if(ip) ip.value=''; render(); if(ik) ik.focus();
}
function backupJSON(){
return JSON.stringify({ v:2, at:new Date().toISOString(), weights:S.weights, days:S.days, focus:S.focus, sess:S.sess, shop:S.shop });
}
function doExport(){
var box=$('bBox'); if(!box) return;
box.hidden=false; box.value=backupJSON(); box.focus(); box.select();
try{ if(navigator.clipboard) navigator.clipboard.writeText(box.value); }catch(e){}
toast('Backup kopiert — lim den inn et trygt sted','bToast');
}
function doImport(){
var box=$('bBox'); if(!box) return;
if(box.hidden || !box.value.trim()){ box.hidden=false; box.value=''; box.focus();
toast('Lim inn backupen i feltet og trykk igjen','bToast'); return; }
try{
var o=JSON.parse(box.value);
if(o.weights) { S.weights=normW(o.weights); saveW(); }
if(o.days && typeof o.days==='object'){ S.days=o.days; saveDays(); }
if(o.focus && typeof o.focus==='object'){ S.focus=o.focus; saveFocus(); }
if(o.sess && typeof o.sess==='object'){ S.sess=o.sess; saveSess(); }
if(o.shop && typeof o.shop==='object'){ S.shop=o.shop; saveShop(); }
box.value=''; box.hidden=true; render();
toast('Backup importert','bToast');
}catch(e){ toast('Fant ikke gyldig backup i feltet','bToast'); }
}
function applyHero(){
var d=rg(K.hero), rm=$('heroRm'), t2=$('pickTxt');
if(d && d.indexOf('data:image')===0){
document.documentElement.style.setProperty('--heroimg','url("'+d+'")');
if(rm) rm.hidden=false; if(t2) t2.textContent='Bytt bilde';
} else {
document.documentElement.style.removeProperty('--heroimg');
if(rm) rm.hidden=true; if(t2) t2.textContent='Bakgrunnsbilde';
}
}
function pickHero(file){
if(!file) return;
var fr=new FileReader();
fr.onload=function(){
var img=new Image();
img.onload=function(){
try{
var mw=1400, sc=Math.min(1,mw/img.width);
var c=document.createElement('canvas');
c.width=Math.round(img.width*sc); c.height=Math.round(img.height*sc);
c.getContext('2d').drawImage(img,0,0,c.width,c.height);
var out=c.toDataURL('image/webp',0.62);
if(out.length>3400000) out=c.toDataURL('image/jpeg',0.55);
rs(K.hero,out); applyHero();
}catch(e){}
};
img.src=fr.result;
};
fr.readAsDataURL(file);
}
document.addEventListener('click',function(ev){
var tb=ev.target.closest?ev.target.closest('[data-tab]'):null;
if(tb){ showTab(tb.getAttribute('data-tab'),true); window.scrollTo({top:0,behavior:'smooth'}); return; }
var f=ev.target.closest?ev.target.closest('#mealFilters button'):null;
if(f){
var key=f.getAttribute('data-f');
[].forEach.call(document.querySelectorAll('#mealFilters button'),function(b){ b.setAttribute('aria-pressed', b===f?'true':'false'); });
[].forEach.call(document.querySelectorAll('#mealGrid .meal'),function(m){ m.hidden=!(key==='all'||(m.getAttribute('data-cat')||'').indexOf(key)!==-1); });
return;
}
var b=ev.target.closest?ev.target.closest('[data-act]'):null;
if(!b) return;
var a=b.getAttribute('data-act');
if(a==='save-weight') saveWeight('inWeight','wToast');
else if(a==='save-weight2') saveWeight('inWeight2','wToast2');
else if(a==='undo-weight'){ if(!S.weights.length){ toast('Ingen innveiinger å angre'); return; } var rm=S.weights.pop(); saveW(); render(); toast('Fjernet '+nb(rm.kg)+' kg'); }
else if(a==='go-progress'){ showTab('progresjon',true); window.scrollTo({top:0,behavior:'smooth'}); }
else if(a==='add-entry') addEntry();
else if(a==='clear-day'){ dayObj().e=[]; saveDays(); render(); }
else if(a==='clear-shop'){ S.shop={}; saveShop(); render(); }
else if(a==='export') doExport();
else if(a==='import') doImport();
else if(a==='hero-reset'){ try{ localStorage.removeItem(K.hero); }catch(e){} delete mem[K.hero]; applyHero(); }
});
document.addEventListener('keydown',function(ev){
if(ev.key!=='Enter') return;
var t=ev.target; if(!t||!t.id) return;
if(t.id==='inWeight'){ ev.preventDefault(); saveWeight('inWeight','wToast'); }
else if(t.id==='inWeight2'){ ev.preventDefault(); saveWeight('inWeight2','wToast2'); }
else if(t.id==='inKcal'||t.id==='inPro'){ ev.preventDefault(); addEntry(); }
});
document.addEventListener('change',function(ev){
var t=ev.target; if(!t||!t.matches) return;
if(t.id==='heroPick'){ pickHero(t.files&&t.files[0]); t.value=''; return; }
if(t.matches('#shoplist input[type=checkbox]')){
var lb=t.getAttribute('data-item')||(t.nextElementSibling?t.nextElementSibling.textContent.trim():'');
if(t.checked) S.shop[lb]=true; else delete S.shop[lb];
saveShop(); rShop();
} else if(t.matches('#focusList input[data-focus]')){
var f=focObj(), k=t.getAttribute('data-focus');
if(t.checked) f[k]=true; else delete f[k];
saveFocus(); rDay();
} else if(t.matches('#sessList input[data-sess]')){
var o=sessObj(), k2=t.getAttribute('data-sess');
if(t.checked) o[k2]=true; else delete o[k2];
saveSess(); rSess(); render();
}
});
window.addEventListener('hashchange',function(){ showTab((location.hash||'').replace('#',''),false); window.scrollTo({top:0,behavior:'smooth'}); });
window.addEventListener('storage',function(){ hydrate(); render(); });
window.addEventListener('focus',function(){ render(); tick(); });
window.addEventListener('resize',function(){ chart(); });
hydrate();
applyHero();
var start=(location.hash||'').replace('#','');
if(TABS.indexOf(start)<0) start=rg(K.tab)||'oversikt';
showTab(start,false);
render();
tick();
setInterval(tick,1000);
setInterval(render,60000);
})();

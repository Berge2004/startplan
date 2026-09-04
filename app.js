(function () {
"use strict";
var START_W=102, GOAL_W=85, DAILY=2000, WEEKLY=14000, NFOCUS=4, NSESS=3, PAYDAY=12;
var START_D=new Date(2026,7,31), END_D=new Date(2027,3,1);
var MILES=[100,95,90,85], DAY=86400000;
var TOT_WI=Math.ceil((END_D-START_D)/(7*DAY));
var TABS=['oversikt','mat','trening','budsjett','helse','progresjon'];
var SESSK=['mon','wed','fri'];
var K={ w:'sp.weights.v3', days:'sp.days.v2', focus:'sp.focusdays.v1', sess:'sp.sessweek.v1',
shop:'sp.shop.v1', budget:'sp.budget.v1', best:'sp.best.v1', hero:'sp.hero.v1', tab:'ab-plan-tab-v2' };
var OLD={ w2:'ab-weight-v2', w1:'ab-weight-v1', days1:'sp.days.v1' };
var MON=['januar','februar','mars','april','mai','juni','juli','august','september','oktober','november','desember'];
var MS=['jan','feb','mar','apr','mai','jun','jul','aug','sep','okt','nov','des'];
var DOW=['søndag','mandag','tirsdag','onsdag','torsdag','fredag','lørdag'];
var DS=['Man','Tir','Ons','Tor','Fre','Lør','Søn'];
var mem={}, storageOk=true, CD='–';
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
function widx(d){ return (d.getDay()+6)%7; }
function weekNo(d){ return Math.max(1,Math.round((mondayOf(d)-START_D)/(7*DAY))+1); }
function p2(n){ return String(n).padStart(2,'0'); }
function past(){ return new Date() > END_D; }
function weeksLeftFrom(d){ return Math.max(0.2,(END_D-d)/(7*DAY)); }
function needAt(kg,d){ return Math.max(0,kg-GOAL_W)/weeksLeftFrom(d); }
var S={ weights:[], days:{}, focus:{}, sess:{}, shop:{}, budget:{bal:0,res:0,at:0}, best:{cal:0,wt:0} };
function normW(list){
var m={};
(list||[]).forEach(function(x){
if(!x || !isFinite(+x.kg) || !x.d) return;
var d=String(x.d), wk=x.wk?String(x.wk):iso(mondayOf(pi(d)));
var tg=isFinite(+x.tg)?+x.tg:needAt(+x.kg,pi(wk));
m[wk]={ wk:wk, d:d, kg:+x.kg, tg:tg };
});
var out=[]; for(var k in m) if(m.hasOwnProperty(k)) out.push(m[k]);
out.sort(function(p1,p2){ return p1.wk<p2.wk?-1:(p1.wk>p2.wk?1:0); });
return out;
}
function normDays(o){
var out={};
if(!o || typeof o!=='object') return out;
for(var d in o){ if(!o.hasOwnProperty(d)) continue;
var v=o[d], arr=[];
if(Array.isArray(v)) arr=v;
else if(v && Array.isArray(v.e)) arr=v.e;
out[d]=arr.filter(function(e){ return e && isFinite(+e.k); })
.map(function(e){ return { t:e.t||'', k:Math.max(0,+e.k), n:String(e.n||'') }; });
}
return out;
}
function hydrate(){
storageOk = rs('sp.probe','1');
var w=ld(K.w,null);
if(!Array.isArray(w)) w=ld(OLD.w2,null);
if(!Array.isArray(w)) w=ld(OLD.w1,[]);
S.weights=normW(w);
if(S.weights.length) sv(K.w,S.weights);
var dd=ld(K.days,null);
if(!dd || typeof dd!=='object') dd=ld(OLD.days1,null);
S.days=normDays(dd);
if(Object.keys(S.days).length) sv(K.days,S.days);
var fd=ld(K.focus,null); S.focus=(fd&&typeof fd==='object'&&!Array.isArray(fd))?fd:{};
var se=ld(K.sess,null); S.sess=(se&&typeof se==='object'&&!Array.isArray(se))?se:{};
var sh=ld(K.shop,null); S.shop=(sh&&typeof sh==='object'&&!Array.isArray(sh))?sh:{};
var bg=ld(K.budget,null);
if(bg&&typeof bg==='object') S.budget={ bal:+bg.bal||0, res:+bg.res||0, at:+bg.at||0 };
var bs=ld(K.best,null);
if(bs&&typeof bs==='object') S.best={ cal:+bs.cal||0, wt:+bs.wt||0 };
}
function dayList(d){ d=d||today(); if(!S.days[d]) S.days[d]=[]; return S.days[d]; }
function dayTot(d){ var a=S.days[d]; if(!a) return 0; var t=0; a.forEach(function(e){ t+=e.k; }); return t; }
function dayTracked(d){ var a=S.days[d]; return !!(a && a.length); }
function focObj(){ var t=today(); if(!S.focus[t]) S.focus[t]={}; return S.focus[t]; }
function sessObj(mk){ mk=mk||iso(mondayOf(new Date())); if(!S.sess[mk]) S.sess[mk]={}; return S.sess[mk]; }
function saveDays(){ return sv(K.days,S.days); }
function saveFocus(){ return sv(K.focus,S.focus); }
function saveSess(){ return sv(K.sess,S.sess); }
function saveW(){ return sv(K.w,S.weights); }
function saveShop(){ return sv(K.shop,S.shop); }
function saveBudget(){ return sv(K.budget,S.budget); }
function saveBest(){ return sv(K.best,S.best); }
function weekSum(mk){
var m=pi(mk), total=0, tracked=0, per=[];
for(var i=0;i<7;i++){
var d=iso(new Date(m.getFullYear(),m.getMonth(),m.getDate()+i));
var t=dayTot(d); per.push({ d:d, k:t, on:dayTracked(d) });
total+=t; if(dayTracked(d)) tracked++;
}
return { total:total, tracked:tracked, per:per };
}
function calWeek(){
var now=new Date(), mk=iso(mondayOf(now)), i=widx(now);
var w=weekSum(mk);
var before=0, trk=0;
for(var j=0;j<i;j++) before+=w.per[j].k;
for(var j2=0;j2<=i;j2++) if(w.per[j2].on) trk++;
var daysLeft=7-i;
var remaining=WEEKLY-w.total;
return {
mk:mk, idx:i, daysLeft:daysLeft, total:w.total, per:w.per, tracked:w.tracked,
remaining:remaining,
avail:Math.max(0,remaining)/daysLeft,
dayFrame:Math.max(0,(WEEKLY-before))/daysLeft,
todayK:w.per[i].k,
pace:DAILY*trk-w.total, trk:trk
};
}
function completedWeeks(){
var out=[], m=new Date(START_D), cur=mondayOf(new Date());
var guard=0;
while(m<cur && guard++<400){ out.push(iso(m)); m=new Date(m.getFullYear(),m.getMonth(),m.getDate()+7); }
return out;
}
function calWeekOk(mk){ var w=weekSum(mk); return w.tracked===7 && w.total<=WEEKLY; }
function calStreak(){
var w=completedWeeks(), c=0;
for(var i=w.length-1;i>=0;i--){ if(calWeekOk(w[i])) c++; else break; }
return c;
}
function wtResults(){
var L=S.weights, out=[];
for(var i=1;i<L.length;i++){
var A=L[i-1], B=L[i];
var gap=Math.max(1,Math.round((pi(B.wk)-pi(A.wk))/(7*DAY)));
var need=(A.tg||0)*gap, loss=A.kg-B.kg;
out.push({ wk:B.wk, need:need, loss:loss, ok:loss>=need-0.0001 });
}
return out;
}
function wtStreak(){ var r=wtResults(), c=0; for(var i=r.length-1;i>=0;i--){ if(r[i].ok) c++; else break; } return c; }
function last(){ return S.weights.length?S.weights[S.weights.length-1]:null; }
function prev(){ return S.weights.length>1?S.weights[S.weights.length-2]:null; }
function curW(){ var l=last(); return l?l.kg:START_W; }
function planAt(t){ var f=(t-START_D)/(END_D-START_D); return START_W-(START_W-GOAL_W)*Math.min(1,Math.max(0,f)); }
function devAvg(){
var L=S.weights; if(!L.length) return null;
var k=Math.min(3,L.length), sum=0;
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
function stats(){
var now=new Date();
var dl=Math.max(0,Math.ceil((END_D-now)/DAY));
var w=curW(), left=Math.max(0,w-GOAL_W);
return { now:now, dl:dl, wks:weeksLeftFrom(now), w:w, left:left, over:past(),
need:past()?0:needAt(w,now), dev:devAvg(), avgw:avgWeekly(),
pct:Math.min(100,Math.max(0,(START_W-w)/(START_W-GOAL_W)*100)), lost:START_W-w };
}
function statusOf(st){
if(st.over) return { lvl:(st.w<=GOAL_W+0.5?'green':'yellow'), tag:'Måldato nådd',
t:'Måldatoen 1. april 2027 er passert.',
b:'Start 102,0 kg · nå '+nb(st.w)+' kg · totalt ned '+nb(st.lost)+' kg. Si ifra når du vil sette et nytt mål.' };
if(!S.weights.length) return { lvl:'idle', tag:'Oppstart', t:'Legg inn din første mandagsvekt',
b:'Vei deg mandag morgen og lagre tallet. Da får du grønt, gult eller rødt lys på om du ligger an til 85 kg til 1. april.' };
if(st.left<=0) return { lvl:'green', tag:'I mål', t:'Du er i mål — 85 kg er nådd.',
b:'Nå handler alt om å holde det. Vedlikehold, styrke og form fremfor nye kutt.' };
var d=st.dev, lvl, tag, t;
if(d<=-0.3){ lvl='green'; tag='På skjema'; t='På skjema · '+nb(-d)+' kg foran'; }
else if(d<=0.3){ lvl='green'; tag='På skjema'; t='På skjema'; }
else if(d<=1.0){ lvl='yellow'; tag='Litt bak'; t='Litt bak · '+nb(d)+' kg bak'; }
else { lvl='red'; tag='Bak plan'; t='Bak plan · '+nb(d)+' kg bak'; }
var bits=[];
bits.push('Du må ned '+nb(st.need,2)+' kg i uka de neste '+nb(st.wks)+' ukene for å nå 85 kg.');
if(st.avgw!==null) bits.push('Faktisk snitt så langt: '+sg(st.avgw,2)+' kg per uke.');
if(lvl==='green') bits.push('Fortsett akkurat som nå.');
else if(lvl==='yellow') bits.push('Stram opp loggingen og skrittene først.');
else bits.push('Sjekk loggingen i to uker før vi endrer kalorier eller dato.');
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
function nextPayday(){
var n=new Date(), y=n.getFullYear(), m=n.getMonth();
if(n.getDate()>=PAYDAY){ m++; if(m>11){ m=0; y++; } }
return new Date(y,m,PAYDAY);
}
function budget(){
var n=new Date(), t0=new Date(n.getFullYear(),n.getMonth(),n.getDate());
var pay=nextPayday();
var daysLeft=Math.max(1,Math.round((pay-t0)/DAY));
var prevPay=new Date(pay.getFullYear(),pay.getMonth()-1,PAYDAY);
var span=Math.max(1,Math.round((pay-prevPay)/DAY));
var free=Math.max(0,(S.budget.bal||0)-(S.budget.res||0));
return { pay:pay, daysLeft:daysLeft, span:span, free:free, perDay:free/daysLeft, isPayday:n.getDate()===PAYDAY };
}
function rHead(st){
var d=st.now;
tx('heroToday', DOW[d.getDay()].charAt(0).toUpperCase()+DOW[d.getDay()].slice(1)+' '+d.getDate()+'. '+MON[d.getMonth()]);
tx('heroPhase', past()?'Perioden er over':('Uke '+Math.min(TOT_WI,weekNo(d))+' / '+TOT_WI));
tx('brandSub', nb(st.w)+' kg → 85 kg');
}
function rStreaks(){
var c=calStreak(), w=wtStreak(), ch=false;
if(c>S.best.cal){ S.best.cal=c; ch=true; }
if(w>S.best.wt){ S.best.wt=w; ch=true; }
if(ch) saveBest();
tx('stkCalN', c+(c===1?' uke':' uker')); tx('stkCalB', S.best.cal);
tx('stkWtN', w+(w===1?' uke':' uker')); tx('stkWtB', S.best.wt);
var a=$('stkCal'), b=$('stkWt');
if(a) a.className='stk'+(c>0?' on':'');
if(b) b.className='stk'+(w>0?' on':'');
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
var L=last();
tx('qwNow', nb(st.w));
if(L){
var lbl='Mandagsvekt uke '+weekNo(pi(L.wk));
lbl += (L.d!==L.wk) ? (' — registrert '+DOW[pi(L.d).getDay()]+' '+sd(L.d)) : (' · '+sd(L.d));
tx('qwMeta', lbl);
} else tx('qwMeta','Startvekt · ingen innveiing lagret ennå');
tx('qwLost', nb(st.lost));
tx('qwLeft', nb(st.left));
tx('qwPct', nb(st.pct,0)+' %');
wd('qwBar',st.pct);
var nEl=$('needWk');
if(nEl) nEl.innerHTML=(st.over?'—':nb(st.need,2))+' <span>kg/uke</span>';
tx('needSub', st.over?'Måldatoen er passert':
(nb(st.left)+' kg igjen · '+st.dl+' dager · oppdateres ved hver ny vekt'));
var nx=nextWeighIn(), np=$('wkNext');
if(np){ np.className='nextw'+(nx.due?' due':''); np.textContent=nx.txt; }
tx('mWeeks',past()?'0':String(st.dl));
tx('mDays',past()?'måldato passert':nb(st.wks)+' uker');
var nm=null; for(var i=0;i<MILES.length;i++){ if(st.w-MILES[i]>0.05){ nm=MILES[i]; break; } }
if(nm===null){ tx('mMile','✓'); tx('mMileSub','alle delmål passert'); }
else { var tg=st.w-nm, uk=(!past()&&st.need>0.01)?Math.max(1,Math.round(tg/st.need)):0;
tx('mMile',nm); tx('mMileSub',nb(tg)+' kg unna'+(uk?' · ~'+uk+(uk===1?' uke':' uker'):'')); }
var h=$('motHead');
if(h){
if(st.over) h.textContent='Måldato nådd · totalt ned '+nb(st.lost)+' kg.';
else if(st.left<=0) h.textContent='Du er i mål. Nå handler det om å holde det.';
else h.textContent=nb(st.left)+' kg igjen på '+nb(st.wks)+' uker.';
}
}
function rWeekCal(){
var c=calWeek();
tx('wkAvail', th(c.avail));
tx('wkAvailSub', c.remaining<0 ? 'du ligger '+th(-c.remaining)+' kcal over ukas 14 000'
: 'snitt per dag de siste '+c.daysLeft+(c.daysLeft===1?' dagen':' dagene'));
tx('wkUsedTxt', th(c.total)+' / '+th(WEEKLY));
wd('wkBar', c.total/WEEKLY*100);
tx('wkLeft', th(Math.max(0,c.remaining)));
tx('wkDays', c.daysLeft);
tx('wkBal', c.trk?((c.pace<0?'−':'+')+th(Math.abs(c.pace))):'—');
var st=$('wkState');
if(st){
var cls='wkstate', msg;
if(c.remaining<0){ cls+=' hot'; msg='Over ukas 14 000 — ta det igjen neste uke, ikke i dag.'; }
else if(!c.trk){ msg='Ingenting logget denne uka ennå.'; }
else if(c.pace<-1400){ cls+=' warn'; msg='Litt over skjema · '+th(-c.pace)+' kcal å ta igjen resten av uka.'; }
else if(c.pace>=0){ msg='På skjema · '+th(c.pace)+' kcal til gode.'; }
else { msg='På skjema for uka.'; }
st.className=cls; st.textContent=msg;
}
var row=$('wkDayRow');
if(row){
row.innerHTML='';
c.per.forEach(function(d,i){
var e=document.createElement('div');
var cls=(d.on?(d.k>2600?'hi2':'ok'):'')+(i===c.idx?' now':'');
if(cls.trim()) e.className=cls.trim();
e.innerHTML=DS[i]+'<b>'+(d.on?th(d.k):'–')+'</b>';
row.appendChild(e);
});
}
return c;
}
function kcalLine(){
var c=calWeek(), t=c.todayK;
tx('kcalSum', th(t)+' av '+th(c.dayFrame)+' kcal spist · nullstilles om '+CD);
}
function rDay(){
var c=calWeek(), t=c.todayK, frame=c.dayFrame, left=frame-t;
var el=$('kcalLeft');
if(el){ el.textContent=left<0?'+'+th(-left):th(left); el.classList.toggle('over',left<0); }
kcalLine();
wd('kcalBar', frame>0?t/frame*100:0);
var log=$('kcalLog'), a=dayList();
if(log){
log.innerHTML='';
if(!a.length) log.innerHTML='<div class="empty">Ingenting logget ennå.</div>';
else a.forEach(function(e,i){
var r=document.createElement('div'); r.className='e';
var sp=document.createElement('span'); sp.className='ec';
sp.textContent=(e.n?e.n+' · ':'')+th(e.k)+' kcal'+(e.t?'  ('+e.t+')':'');
var bt=document.createElement('button'); bt.type='button'; bt.textContent='×'; bt.setAttribute('aria-label','Fjern');
bt.addEventListener('click',function(){ a.splice(i,1); saveDays(); render(); });
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
function rBudget(){
var b=budget();
tx('bgPerDay', th(b.perDay));
tx('bgBal', th(S.budget.bal||0));
tx('bgRes', th(S.budget.res||0));
tx('bgFree', th(b.free));
tx('bgDays', b.daysLeft);
tx('bgPay', 'til '+b.pay.getDate()+'. '+MS[b.pay.getMonth()]);
tx('bgSub', (S.budget.bal>0)
? ('Disponibelt '+th(b.free)+' kr fordelt på '+b.daysLeft+(b.daysLeft===1?' dag':' dager')+' fram til lønning')
: 'Legg inn saldoen din for å komme i gang');
wd('bgBar', (b.span-b.daysLeft)/b.span*100);
tx('bgStamp', S.budget.at ? ('Saldo sist oppdatert '+new Date(S.budget.at).toLocaleDateString('nb-NO')) : 'Ingen saldo lagret ennå');
var al=$('bgAlert'); if(al) al.hidden=!b.isPayday;
var ib=$('inBal'), ir=$('inRes');
if(ib && document.activeElement!==ib && !ib.value && S.budget.bal) ib.value=S.budget.bal;
if(ir && document.activeElement!==ir && !ir.value && S.budget.res) ir.value=S.budget.res;
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
var ya=tl.at(tl.x0), yb=Math.max(mn,Math.min(mx,tl.at(te)));
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
tx('aDeltaSub', st.avgw===null?'kg per uke så langt':'kravet nå: '+nb(st.need,2)+' kg per uke');
var mk=iso(mondayOf(new Date()));
var pkD=new Date(pi(mk).getTime()-7*DAY), pk=iso(pkD), early=pkD<START_D;
var ws=early?{total:0,tracked:0}:weekSum(pk);
var sc=0; if(!early){ var so=S.sess[pk]||{}; SESSK.forEach(function(x){ if(so[x]) sc++; }); }
if(early){
tx('ciHead','Første check-in mandag '+sd(iso(new Date(START_D.getTime()+7*DAY)))+' — etter din første hele uke');
} else {
tx('ciHead','Uke '+weekNo(pi(mk))+' · check-in for uka '+sd(pk)+'–'+sd(iso(new Date(pi(pk).getTime()+6*DAY))));
}
var r=wtResults(), lastR=r.length?r[r.length-1]:null;
tx('ciAvg', L?nb(L.kg)+' kg':'______');
tx('ciPrev', P?nb(P.kg)+' kg':'______');
tx('ciDelta', lastR?(sg(-lastR.loss)+' kg · krav '+nb(lastR.need,2)+' kg '+(lastR.ok?'✓':'✗')):'______');
tx('ciTotal', L?nb(st.lost)+' kg':'______');
tx('ciRate', st.avgw===null?'______':sg(st.avgw,2)+' kg/uke');
tx('ciKcal', ws.tracked?th(ws.total)+' kcal':'______');
tx('ciPro', ws.tracked?th(ws.total/7)+' kcal/dag':'______');
tx('ciDays', ws.tracked?ws.tracked+' / 7 dager':'______');
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
var row=document.createElement('div'); row.className='e';
var sp=document.createElement('span'); sp.className='ec';
sp.textContent='Uke '+weekNo(pi(x.wk))+' · '+nb(x.kg)+' kg  ('+sd(x.d)+')  · krav '+nb(x.tg||0,2)+' kg';
var bt=document.createElement('button'); bt.type='button'; bt.textContent='×'; bt.setAttribute('aria-label','Slett innveiing');
bt.addEventListener('click',function(){ S.weights.splice(ix,1); saveW(); render(); });
row.appendChild(sp); row.appendChild(bt); wl.appendChild(row);
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
try{
var st=stats();
rHead(st); rStreaks(); rStatus(st); rWeight(st); rWeekCal(); rDay(); rSess(); rBudget(); rProg(st); rShop();
}catch(e){}
}
var lastDay=today(), lastMk=iso(mondayOf(new Date()));
function tick(){
var now=new Date();
var mid=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,0,0,0,0);
var q=Math.max(0,Math.floor((mid-now)/1000));
CD=p2(Math.floor(q/3600))+':'+p2(Math.floor(q/60)%60)+':'+p2(q%60);
tx('cdown', CD); kcalLine();
var mk=iso(mondayOf(now));
if(today()!==lastDay || mk!==lastMk){ lastDay=today(); lastMk=mk; dayList(); focObj(); saveDays(); saveFocus(); render(); }
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
function saveWeight(){
var inp=$('inWeight'); if(!inp) return;
var v=parseFloat(String(inp.value).replace(',','.'));
if(!isFinite(v)||v<40||v>250){ inp.focus(); if(inp.select) inp.select(); return; }
v=Math.round(v*10)/10;
var d=today(), wk=iso(mondayOf(new Date())), found=false;
for(var i=0;i<S.weights.length;i++){
if(S.weights[i].wk===wk){
if(!confirm('Du har allerede lagret '+nb(S.weights[i].kg)+' kg for denne uka.\n\nErstatte den med '+nb(v)+' kg?')) return;
S.weights[i].kg=v; S.weights[i].d=d; S.weights[i].tg=needAt(v,pi(wk)); found=true; break;
}
}
if(!found) S.weights.push({ wk:wk, d:d, kg:v, tg:needAt(v,pi(wk)) });
S.weights=normW(S.weights);
var ok=saveW(); inp.value=''; render();
toast(ok?(nb(v)+' kg lagret'+(found?' (erstattet ukas vekt)':'')):(nb(v)+' kg lagret (kun denne økten)'),'wToast');
}
function addEntry(k,name,which){
if(!isFinite(k)||k<0) return false;
var n=new Date();
dayList().push({ t:p2(n.getHours())+':'+p2(n.getMinutes()), k:Math.round(k), n:String(name||'').slice(0,40) });
saveDays(); render(); toast(th(k)+' kcal lagt til', which||'dToast');
return true;
}
function addFromForm(){
var ik=$('inKcal'), inm=$('inName');
var k=ik?parseFloat(String(ik.value).replace(',','.')):NaN;
if(!isFinite(k)){ if(ik) ik.focus(); return; }
addEntry(k, inm?inm.value:'');
if(ik) ik.value=''; if(inm) inm.value='';
if(ik) ik.focus();
}
function scanCalc(){
var p1=parseFloat(String(($('inPer100')||{}).value||'').replace(',','.'));
var g=parseFloat(String(($('inGram')||{}).value||'').replace(',','.'));
var k=(isFinite(p1)&&isFinite(g))?p1*g/100:0;
tx('scanCalc', th(k));
return k;
}
function scanLookup(ean){
ean=String(ean||'').replace(/\D/g,'');
if(ean.length<8){ tx('scanMsg','Skriv inn en gyldig strekkode (8–13 siffer).'); return; }
tx('scanMsg','Søker opp '+ean+' …');
fetch('https://world.openfoodfacts.org/api/v2/product/'+ean+'.json?fields=product_name,brands,nutriments')
.then(function(r){ return r.json(); })
.then(function(j){
if(!j || j.status!==1 || !j.product){ tx('scanMsg','Fant ikke produktet. Skriv inn kcal per 100 g manuelt.'); return; }
var nut=j.product.nutriments||{};
var k=nut['energy-kcal_100g'];
if(!isFinite(k) && isFinite(nut['energy_100g'])) k=nut['energy_100g']/4.184;
var nm=(j.product.product_name||'')+(j.product.brands?' ('+String(j.product.brands).split(',')[0]+')':'');
if(!isFinite(k)){ tx('scanMsg', (nm||'Produkt')+' — mangler kalorier i databasen. Skriv inn kcal per 100 g manuelt.'); return; }
var f=$('inPer100'); if(f) f.value=Math.round(k);
var nf=$('inName'); if(nf && nm) nf.value=nm.trim().slice(0,40);
tx('scanMsg',(nm||'Produkt')+' · '+Math.round(k)+' kcal per 100 g. Skriv inn antall gram.');
scanCalc(); var g=$('inGram'); if(g) g.focus();
})
.catch(function(){ tx('scanMsg','Fikk ikke kontakt med matvaredatabasen. Skriv inn kcal per 100 g manuelt.'); });
}
var camStop=null;
function scanCam(){
var vid=$('scanVid');
if(camStop){ camStop(); return; }
if(!('BarcodeDetector' in window)){
tx('scanMsg','Kameraskanning støttes ikke i denne nettleseren (bl.a. Safari på iPhone). Skriv inn strekkoden i feltet i stedet.');
return;
}
if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ tx('scanMsg','Kamera er ikke tilgjengelig her.'); return; }
var det=new window.BarcodeDetector({ formats:['ean_13','ean_8','upc_a','upc_e'] });
navigator.mediaDevices.getUserMedia({ video:{ facingMode:'environment' } }).then(function(stream){
vid.hidden=false; vid.srcObject=stream; vid.play();
tx('scanMsg','Hold strekkoden foran kameraet …');
var timer=setInterval(function(){
det.detect(vid).then(function(codes){
if(codes && codes.length){ var v=codes[0].rawValue; camStop&&camStop(); var f=$('inEan'); if(f) f.value=v; scanLookup(v); }
}).catch(function(){});
},500);
camStop=function(){
clearInterval(timer); stream.getTracks().forEach(function(t){ t.stop(); });
vid.hidden=true; vid.srcObject=null; camStop=null;
};
}).catch(function(){ tx('scanMsg','Fikk ikke tilgang til kameraet. Skriv inn strekkoden manuelt.'); });
}
function backupJSON(){
return JSON.stringify({ v:3, at:new Date().toISOString(), weights:S.weights, days:S.days,
focus:S.focus, sess:S.sess, shop:S.shop, budget:S.budget, best:S.best });
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
if(o.weights){ S.weights=normW(o.weights); saveW(); }
if(o.days){ S.days=normDays(o.days); saveDays(); }
if(o.focus && typeof o.focus==='object'){ S.focus=o.focus; saveFocus(); }
if(o.sess && typeof o.sess==='object'){ S.sess=o.sess; saveSess(); }
if(o.shop && typeof o.shop==='object'){ S.shop=o.shop; saveShop(); }
if(o.budget && typeof o.budget==='object'){ S.budget={bal:+o.budget.bal||0,res:+o.budget.res||0,at:+o.budget.at||0}; saveBudget(); }
if(o.best && typeof o.best==='object'){ S.best={cal:+o.best.cal||0,wt:+o.best.wt||0}; saveBest(); }
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
var b=ev.target.closest?ev.target.closest('[data-act]'):null;
if(!b) return;
var a=b.getAttribute('data-act');
if(a==='save-weight') saveWeight();
else if(a==='add-entry') addFromForm();
else if(a==='clear-day'){ S.days[today()]=[]; saveDays(); render(); }
else if(a==='clear-shop'){ S.shop={}; saveShop(); render(); }
else if(a==='export') doExport();
else if(a==='import') doImport();
else if(a==='scan-open'){ var sb=$('scanBox'); if(sb){ sb.hidden=!sb.hidden; if(!sb.hidden){ var f=$('inEan'); if(f) f.focus(); } else if(camStop) camStop(); } }
else if(a==='scan-lookup') scanLookup(($('inEan')||{}).value);
else if(a==='scan-cam') scanCam();
else if(a==='scan-add'){
var k=scanCalc();
if(k>0){ addEntry(k, ($('inName')||{}).value || 'Skannet');
var g=$('inGram'); if(g) g.value=''; var nf=$('inName'); if(nf) nf.value=''; scanCalc(); }
}
else if(a==='save-budget'){
var ib=$('inBal'), ir=$('inRes');
var bal=parseFloat(String((ib&&ib.value)||'').replace(',','.'));
var res=parseFloat(String((ir&&ir.value)||'').replace(',','.'));
if(!isFinite(bal)){ if(ib) ib.focus(); return; }
S.budget={ bal:Math.max(0,bal), res:isFinite(res)?Math.max(0,res):0, at:Date.now() };
saveBudget(); render(); toast('Saldo lagret','bgToast');
}
else if(a==='hero-reset'){ try{ localStorage.removeItem(K.hero); }catch(e){} delete mem[K.hero]; applyHero(); }
});
document.addEventListener('keydown',function(ev){
if(ev.key!=='Enter') return;
var t=ev.target; if(!t||!t.id) return;
if(t.id==='inWeight'){ ev.preventDefault(); saveWeight(); }
else if(t.id==='inKcal'||t.id==='inName'){ ev.preventDefault(); addFromForm(); }
else if(t.id==='inEan'){ ev.preventDefault(); scanLookup(t.value); }
else if(t.id==='inBal'||t.id==='inRes'){ ev.preventDefault(); var btn=document.querySelector('[data-act="save-budget"]'); if(btn) btn.click(); }
});
document.addEventListener('input',function(ev){
var t=ev.target; if(!t||!t.id) return;
if(t.id==='inPer100'||t.id==='inGram') scanCalc();
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
saveSess(); rSess();
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

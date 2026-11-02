import {auth,db} from './firebase-config.js';
import {$,esc,fmt,money,UNIT} from './common.js';
import {signInAnonymously,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {collection,doc,setDoc,onSnapshot,query,where} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
const S={bikes:[],busy:[],mine:[],set:{},tab:'book'};
const isBusy=(id,s,e)=>S.busy.some(k=>k.bikeId===id&&['pending','approved'].includes(k.status)&&k.start<e&&k.end>s);
const bike=id=>S.bikes.find(b=>b.id===id);
function nav(){$('#nav').innerHTML=[['book','Book a bike'],['mine','My bookings']].map(([k,l])=>`<button class="${S.tab===k?'on':''}" data-t="${k}">${l}</button>`).join('');}
$('#nav').onclick=e=>{if(e.target.dataset.t){S.tab=e.target.dataset.t;draw();}};
function draw(){nav();const f=document.querySelector('#app input:focus,#app select:focus');if(f&&S.tab==='book')return;
 $('#app').innerHTML=S.tab==='book'?book():mine();if(S.tab==='book')bind();}
function book(){const a=S.bikes.filter(b=>b.active!==false);if(!a.length)return'<p class="mut">No motorcycles listed yet.</p>';
 return a.map(b=>`<div class="card"><h3>${esc(b.name)}</h3><div class="mut">${b.hourly?money(b.hourly)+'/hour · ':''}${b.daily?money(b.daily)+'/day':''}${b.monthly?' · '+money(b.monthly)+'/month':''}</div></div>`).join('')+
 `<div class="card"><h3>Book</h3><label>Motorcycle</label><select id="bk">${a.map(b=>`<option value="${b.id}">${esc(b.name)}</option>`).join('')}</select>
 <div class="row"><div><label>Type</label><select id="ty"><option value="hourly">Hourly</option><option value="daily" selected>Daily</option><option value="monthly">Monthly</option></select></div><div><label>How many</label><input id="qt" type="number" min="1" value="1"></div></div>
 <label>Start</label><input id="st" type="datetime-local"><label>Your name</label><input id="nm"><label>Phone</label><input id="ph" type="tel"><label>Delivery location</label><input id="lc">
 <label>Payment</label><select id="py"><option value="cash">Cash</option><option value="bml">BML transfer</option></select><div id="bml"></div><div class="total" id="tot"></div><div class="mut" id="av"></div>
 <button class="btn pri" style="width:100%;margin-top:10px" id="go">Submit booking</button></div>`;}
const val=()=>{const b=bike($('#bk').value),ty=$('#ty').value,q=Math.max(1,+$('#qt').value||1),s=$('#st').value?new Date($('#st').value).getTime():0;return{b,ty,q,s,e:s+q*UNIT[ty],amt:(+b?.[ty]||0)*q}};
function bind(){if(!$('#go'))return;const up=()=>{const v=val();$('#tot').textContent=v.amt?'Total: '+money(v.amt):'Not available for this rental type';
 $('#av').textContent=v.s?(isBusy(v.b.id,v.s,v.e)?'Not available for these dates':'Available'):'';
 $('#bml').innerHTML=$('#py').value==='bml'?`<div class="mut">Transfer to <b>${esc(S.set.bmlName||'(not set)')}</b> · ${esc(S.set.bmlAccount||'(not set)')}</div><label>Transfer reference</label><input id="rf">`:'';};
 document.querySelectorAll('#app select,#app input').forEach(e=>e.onchange=up);up();
 $('#go').onclick=async()=>{const v=val(),g=i=>$('#'+i)?.value||'';
  if(!v.s||!g('nm')||!g('ph')||!g('lc'))return alert('Please fill in all fields.');if(!v.amt)return alert('Not available for this rental type.');
  if(isBusy(v.b.id,v.s,v.e))return alert('Already booked for these dates.');if(g('py')==='bml'&&!g('rf'))return alert('Enter your transfer reference.');
  const r=doc(collection(db,'bookings'));
  try{await setDoc(r,{bikeId:v.b.id,bikeName:v.b.name,owner:v.b.owner||'Company',type:v.ty,qty:v.q,start:v.s,end:v.e,amount:v.amt,name:g('nm'),phone:g('ph'),loc:g('lc'),pay:g('py'),ref:g('rf'),status:'pending',paid:false,uid:auth.currentUser.uid,created:Date.now()});
   await setDoc(doc(db,'busy',r.id),{bikeId:v.b.id,start:v.s,end:v.e,status:'pending'});
   const w=(S.set.whatsapp||'').replace(/\D/g,'');if(w)open(`https://wa.me/${w.length<=7?'960'+w:w}?text=`+encodeURIComponent(`New booking: ${v.b.name}, ${fmt(v.s)}, ${money(v.amt)}. ${g('nm')} ${g('ph')}`));
   S.tab='mine';draw();}catch(e){alert('Could not submit: '+e.message)}};}
function mine(){return S.mine.sort((a,b)=>b.created-a.created).map(k=>`<div class="card"><h3>${esc(k.bikeName)} <span class="tag ${k.status}">${k.status}</span></h3><div class="mut">${fmt(k.start)} → ${fmt(k.end)}</div><div>${money(k.amount)} · ${k.pay==='bml'?'BML':'Cash'} · <b>${k.paid?'Paid':'Unpaid'}</b></div><div class="mut">${esc(k.loc)}</div></div>`).join('')||'<p class="mut">No bookings yet.</p>';}
const watch=(q,fn)=>onSnapshot(q,s=>{fn(s);draw()},e=>console.error(e));
onAuthStateChanged(auth,u=>{if(!u)return signInAnonymously(auth);
 watch(collection(db,'bikes'),s=>S.bikes=s.docs.map(d=>({id:d.id,...d.data()})));
 watch(collection(db,'busy'),s=>S.busy=s.docs.map(d=>d.data()));
 watch(doc(db,'settings','main'),s=>S.set=s.data()||{});
 watch(query(collection(db,'bookings'),where('uid','==',u.uid)),s=>S.mine=s.docs.map(d=>({id:d.id,...d.data()})));});

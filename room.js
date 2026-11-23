
const hooks={render(){},sync(){}};
const $=s=>document.querySelector(s),W=320,H=180,cv=$('#cv'),ctx=cv.getContext('2d'),R=Math.round,bub=$('#bubble');
const S=4,Q=v=>Math.round(v*S)/S;cv.width=W*S;cv.height=H*S;
const N=11,CX=160,TOP=50,WH=150,iso=(x,y)=>[CX+(x-y)*24,TOP+(x+y)*12],up=(p,h)=>[p[0],p[1]-h];
function P(pts,c,ns){ctx.fillStyle=ctx.strokeStyle=c;ctx.lineWidth=1/S;ctx.beginPath();pts.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](Q(p[0]),Q(p[1])));ctx.closePath();ctx.fill();if(!ns)ctx.stroke()}
const wp=(s,u,h)=>{const p=s?iso(0,u):iso(u,0);return[p[0],p[1]-h]};
const WQ=(s,u0,u1,h0,h1,c)=>P([wp(s,u0,h0),wp(s,u1,h0),wp(s,u1,h1),wp(s,u0,h1)],c);
function box(x,y,w,d,h,t,l,r){const a=iso(x,y+d),b=iso(x+w,y+d),c=iso(x+w,y),e=iso(x,y);
 P([a,b,up(b,h),up(a,h)],l);P([b,c,up(c,h),up(b,h)],r);P([up(e,h),up(c,h),up(b,h),up(a,h)],t)}
const LINES=['Halo! Belajar yuk 📚','Jangan lupa PR ya!','Bel istirahat kapan?','Ssst, lagi ujian...','Papan tulisnya baru dihapus!','Ada yang bawa bekal? 🍙','Hari ini pelajaran apa?'];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dust=Array.from({length:30},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*4,vy:2+Math.random()*4,p:Math.random()*6}));
/* ---------- state ---------- */
let pets=[],T=0,par=1,fx=true,mx=0,my=0,inside=false,hp=null,pend=null;const cur={x:0,y:0};
const KEY='pixelpets.v1',byId=id=>pets.find(p=>p.id===id);
const ser=()=>pets.map(({id,name,src,photo,frames,fps,speed,scale,msg,flip})=>({id,name,src,photo,frames,fps,speed,scale,msg,flip}));
function save(){if(!ADMIN)return;try{localStorage.setItem(KEY,JSON.stringify(ser()))}catch(e){}hooks.sync()}
function defaultSprite(){const c=document.createElement('canvas');c.width=64;c.height=16;const g=c.getContext('2d');
for(let f=0;f<4;f++){const x=f*16,b=f%2;g.fillStyle='#f2a65a';g.fillRect(x+3,6+b,9,6);g.fillRect(x+10,3+b,5,5);g.fillRect(x+10,2+b,1,2);g.fillRect(x+14,2+b,1,2);
g.fillStyle='#c97a34';g.fillRect(x+1,5+b,2,2);g.fillRect(x,3+b,2,3);g.fillRect(x+4+b,12,2,3);g.fillRect(x+9-b,12,2,3);
g.fillStyle='#2b1a12';g.fillRect(x+13,4+b,1,1);g.fillStyle='#ff8a9a';g.fillRect(x+15,5+b,1,1)}return c.toDataURL()}
const mk=o=>Object.assign({id:Math.random().toString(36).slice(2),name:'Mochi',frames:4,fps:8,speed:1,scale:2,msg:'',flip:false,photo:null,gx:2+Math.random()*3.4,gy:2.2+Math.random()*3.2,tx:3,ty:3,wait:1,face:1,t:0,fr:0,ok:false},o);
function loadImg(p,fit){p.img=new Image();p.img.onload=()=>{p.ok=true;if(fit){p.frames=p.fixFrames||Math.max(1,R(p.img.width/p.img.height));delete p.fixFrames;p.scale=Math.min(4,Math.max(.25,R(34/p.img.height*4)/4))}hooks.render();if(fit)save()};p.img.src=p.src}
const ADMIN=!!window.ADMIN;let lastJ='';
const getApi=async()=>{try{const r=await fetch('/api/pets',{cache:'no-store'});if(r.ok){const x=await r.json();window.SERVER_OK=true;return Array.isArray(x.pets)?x.pets:null}}catch(e){}return null};
const getJs=async()=>{try{const r=await fetch('/pets.json',{cache:'no-store'});if(r.ok){const x=await r.json();return x&&x.length?x:null}}catch(e){}return null};
const getLs=()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'null');return x&&x.length?x:null}catch(e){return null}};
async function boot(){let d=await getApi();if(d!==null)lastJ=JSON.stringify(d);else d=await getJs()||getLs()||[{src:defaultSprite()}];
pets=d.map(mk);pets.forEach(p=>loadImg(p,false));hooks.render();if(!ADMIN)setInterval(poll,30000)}
async function poll(){const d=await getApi();if(d===null)return;const j=JSON.stringify(d);if(j===lastJ)return;lastJ=j;
pets=d.map(o=>{const old=pets.find(p=>p.id===o.id),n=mk(o);if(old){Object.assign(n,{gx:old.gx,gy:old.gy,tx:old.tx,ty:old.ty,wait:old.wait,face:old.face});if(old.src===o.src&&old.ok){n.img=old.img;n.ok=true}else loadImg(n,false)}else loadImg(n,false);return n})}
const st=$('#stage');
function mpos(e){const r=cv.getBoundingClientRect();mx=(e.clientX-r.left)/r.width*W;my=(e.clientY-r.top)/r.height*H;inside=true}
st.addEventListener('pointermove',mpos);st.addEventListener('pointerdown',mpos);st.addEventListener('pointerleave',()=>inside=false);
/* ---------- simulation ---------- */
function step(p,dt){if(p.hov)p.moving=false;else if(p.wait>0){p.wait-=dt;p.moving=false}else{
const dx=p.tx-p.gx,dy=p.ty-p.gy,d=Math.hypot(dx,dy);
if(d<.05){p.wait=1+Math.random()*3;p.tx=2+Math.random()*3.4;p.ty=2.2+Math.random()*3.2;p.moving=false}
else{const v=Math.min(p.speed*dt,d);p.gx+=dx/d*v;p.gy+=dy/d*v;p.moving=true;if(Math.abs(dx-dy)>.01)p.face=dx-dy>0?1:-1}}
if(p.moving){p.t+=dt*p.fps;p.fr=Math.floor(p.t)%p.frames}else{p.fr=0;p.t=0}}
function hover(){const ox=0,oy=0;let h=null;
if(inside)[...pets].sort((a,b)=>b.gx+b.gy-a.gx-a.gy).some(p=>{const b=p.box;if(b&&mx-ox>=b.x0&&mx-ox<=b.x1&&my-oy>=b.y0&&my-oy<=b.y1){h=p;return true}});
pets.forEach(p=>p.hov=p===h);
if(h!==hp){hp=h;if(h)bub.innerHTML=`${h.photo?`<img src="${h.photo}">`:`<div class="av">${esc(h.name[0]||'?')}</div>`}<div><strong>${esc(h.name)}</strong><br>${esc(h.msg||LINES[Math.floor(Math.random()*LINES.length)])}</div>`;bub.classList.toggle('on',!!h)}
if(h){const k=cv.clientWidth/W;bub.style.left=Math.min(cv.clientWidth-115,Math.max(115,((h.box.x0+h.box.x1)/2+ox)*k))+'px';bub.style.top=(h.box.y0+oy)*k-8+'px'}}
/* ---------- drawing ---------- */
const L=(a,fn)=>{ctx.save();ctx.translate(R(-cur.x*a*par),R(-cur.y*a*par*.6));fn();ctx.restore()};
function leaf(x,y,r,l,c){ctx.save();ctx.translate(x,y);ctx.rotate(r);ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(l/2,0,l/2,l*.18,0,0,7);ctx.fill();ctx.restore()}
const lift=(z,fn)=>{ctx.save();ctx.translate(0,-z);fn();ctx.restore()};
const shad=(x,y,w,d)=>P([iso(x-.15,y+.2),iso(x+w-.15,y+.2),iso(x+w-.15,y+d+.2),iso(x-.15,y+d+.2)],'rgba(60,35,15,.2)',1);
function win(u0,u1){const q=[wp(0,u0,22),wp(0,u1,22),wp(0,u1,58),wp(0,u0,58)];WQ(0,u0-.12,u1+.12,20,60,'#f2efe6');
ctx.save();ctx.beginPath();q.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](Q(p[0]),Q(p[1])));ctx.closePath();ctx.clip();
const cx=(q[0][0]+q[1][0])/2,cy=(q[0][1]+q[2][1])/2;
ctx.fillStyle='#8fd0ff';ctx.fillRect(cx-70,cy-70,140,140);ctx.fillStyle='#b9e4ff';ctx.fillRect(cx-70,cy-70,140,40);
ctx.fillStyle='#fff';ctx.fillRect(cx-14,cy-18,16,4);ctx.fillRect(cx-10,cy-21,9,3);ctx.fillRect(cx+8,cy-8,13,3);
ctx.fillStyle='#4f9a5a';ctx.beginPath();ctx.ellipse(cx-8,cy+30,44,17,0,0,7);ctx.fill();ctx.fillStyle='#3b7d48';ctx.beginPath();ctx.ellipse(cx+18,cy+34,34,15,0,0,7);ctx.fill();
ctx.fillStyle='#6b4426';ctx.fillRect(cx-4,cy+5,3,12);ctx.fillStyle='#2f8a55';ctx.beginPath();ctx.arc(cx-2,cy+3,8,0,7);ctx.fill();ctx.restore();
const m=(u0+u1)/2;WQ(0,m-.04,m+.04,22,58,'#f2efe6');WQ(0,u0,u1,39,41,'#f2efe6');WQ(0,u0-.2,u1+.2,17,20,'#e8e0c8')}
function shell(){
for(let x=0;x<N;x++)for(let y=0;y<N;y++)P([iso(x,y),iso(x+1,y),iso(x+1,y+1),iso(x,y+1)],(x+y)%2?'#c19a62':'#cfa86f');
for(let i=0;i<N;i++){WQ(1,i,i+1,0,WH,i%2?'#e3d6ae':'#e9ddb9');WQ(0,i,i+1,0,WH,i%2?'#d7c9a0':'#ddd0a8')}
[1,0].forEach(s=>{WQ(s,0,N,0,18,s?'#4f8a78':'#468070');WQ(s,0,N,18,20,'#efe8d0');WQ(s,0,N,0,4,'#3b2a20')});
{const c=iso(0,0);P([[c[0]-1,0],[c[0]+1,0],[c[0]+1,c[1]],[c[0]-1,c[1]]],'#b5a678')}
ctx.strokeStyle='rgba(70,40,15,.16)';ctx.lineWidth=.3;ctx.beginPath();for(let i=0;i<=N;i++){const a=iso(i,0),b=iso(i,N),c=iso(0,i),d=iso(N,i);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.moveTo(c[0],c[1]);ctx.lineTo(d[0],d[1])}ctx.stroke();
P([iso(0,0),iso(N,0),iso(N,.6),iso(0,.6)],'rgba(0,0,0,.14)',1);P([iso(0,0),iso(0,N),iso(.6,N),iso(.6,0)],'rgba(0,0,0,.14)',1);
/* papan tulis */
WQ(1,1.4,5.2,20,56,'#8a5a32');WQ(1,1.55,5.05,22,54,'#2f5a4a');
[[1.9,3.9,46],[1.9,3.3,42],[1.9,4.5,38],[1.9,2.7,34],[3.3,4.7,30]].forEach(([a,b,h])=>WQ(1,a,b,h,h+1,'#e8efe8'));WQ(1,4.2,4.9,44,49,'#e8efe8');WQ(1,4.3,4.8,45,48,'#2f5a4a');
WQ(1,1.4,5.2,18,20,'#6b4426');WQ(1,2,2.4,20,22,'#fff');WQ(1,4.2,4.8,20,23,'#444');
/* pintu */
WQ(1,5.5,6.9,0,46,'#8a5a32');WQ(1,5.65,6.75,2,44,'#a06a3c');WQ(1,5.9,6.5,26,40,'#a8d8e8');WQ(1,5.6,5.7,20,22,'#e8c860');
/* jendela, jam, poster */
win(1.5,3.1);win(4.3,5.9);
WQ(0,3.4,4,40,50,'#5a4a3a');WQ(0,3.45,3.95,41,49,'#fff');WQ(0,3.68,3.72,45,49,'#222');WQ(0,3.68,3.9,45,46,'#222');
WQ(0,.35,1.15,26,50,'#f2efe6');WQ(0,.45,1.05,38,48,'#e0a24f');WQ(0,.45,.75,28,36,'#c94f6d');WQ(0,.8,1.05,28,36,'#4fa3c9');
/* sinar jendela di lantai */
[[1.5,3.1],[4.3,5.9]].forEach(([a,b],i)=>P([iso(a,.1),iso(b,.1),iso(b-1.4,3.8),iso(a-1.4,3.8)],`rgba(255,244,180,${.14+.04*Math.sin(T*.8+i)})`,1))}
const DESKS=[];[.4,1.4].forEach(y=>[2,3.7,5.4].forEach(x=>DESKS.push([x,y])));
function desk(x,y,i){[[.05,.05],[.75,.05],[.05,.65],[.75,.65]].forEach(([a,b])=>box(x+a,y+b,.1,.1,10,'#888','#555','#666'));
lift(10,()=>box(x,y,.9,.8,3,'#dcb070','#a97b45','#bb8a50'));
lift(13,()=>i%2?box(x+.15,y+.15,.35,.3,1,'#f6f3e0','#d6d2c0','#e5e1d0'):box(x+.2,y+.2,.3,.4,2,'#c94f6d','#8f3149','#a23b54'))}
function chair(x,y){const cx=x+1,cy=y+.1;[[0,0],[.5,0],[0,.5],[.5,.5]].forEach(([a,b])=>box(cx+a,cy+b,.1,.1,8,'#777','#444','#555'));
lift(8,()=>box(cx,cy,.6,.6,2,'#4f8fb0','#2f6a8a','#3b7a9b'));lift(10,()=>box(cx+.5,cy,.1,.6,10,'#4f8fb0','#2f6a8a','#3b7a9b'))}
function teacher(){[[.05,.05],[.75,.05],[.05,1.55],[.75,1.55]].forEach(([a,b])=>box(.7+a,3.6+b,.1,.1,14,'#6b4426','#4a2e18','#5a3a20'));
lift(14,()=>box(.7,3.6,.9,1.7,3,'#b98a55','#7a5530','#8f6638'));lift(17,()=>{box(.85,3.8,.2,.2,2,'#e04040','#a11','#b22');box(1.1,4.2,.4,.5,3,'#4fa3c9','#2f7a9b','#3b8aab');box(1.1,4.2+.55,.4,.4,2,'#e0b84f','#b08a2f','#c09a3f')})}
function plant(){box(.3,.3,.6,.6,9,'#d99a68','#c98a5a','#a8703f');const pl=up(iso(.6,.6),9);[[-6,-6,'#2f8a55'],[6,-7,'#3aa365'],[0,-12,'#2f8a55'],[-3,-17,'#3aa365']].forEach(([a,b,c])=>{ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(R(pl[0]+a),R(pl[1]+b),5,7,a/10,0,7);ctx.fill()})}
function drawPet(p){const fw=p.img.width/p.frames,fh=p.img.height,sw=fw*p.scale,sh=fh*p.scale,[x,y]=iso(p.gx,p.gy),X=Q(x),Y=Q(y),dir=p.face*(p.flip?-1:1);
ctx.fillStyle='rgba(40,20,10,.3)';ctx.beginPath();ctx.ellipse(X-2,Y,sw*.34,Math.max(2,sw*.1),0,0,7);ctx.fill();
ctx.fillStyle='rgba(40,20,10,.25)';ctx.beginPath();ctx.ellipse(X,Y,sw*.2,Math.max(1,sw*.05),0,0,7);ctx.fill();
ctx.save();ctx.translate(X,0);if(dir<0)ctx.scale(-1,1);ctx.imageSmoothingEnabled=false;
ctx.drawImage(p.img,Math.floor(p.fr)*fw,0,fw,fh,Q(-sw/2),Q(Y-sh+(p.hov?-2:0)),Q(sw),Q(sh));ctx.restore();
p.box={x0:X-sw/2,x1:X+sw/2,y0:Y-sh,y1:Y}}
function mid(){
DESKS.forEach(([x,y])=>{shad(x,y,.9,.8);shad(x+1,y+.1,.6,.6)});shad(.7,3.6,.9,1.7);shad(.3,.3,.6,.6);
const it=[{k:1.2,f:plant},{k:5.6,f:teacher}];
DESKS.forEach(([x,y],i)=>{it.push({k:x+y+.85,f:()=>desk(x,y,i)});it.push({k:x+y+1.7,f:()=>chair(x,y)})});
pets.filter(p=>p.ok).forEach(p=>it.push({k:p.gx+p.gy,f:()=>drawPet(p)}));
it.sort((a,b)=>a.k-b.k).forEach(o=>o.f())}
function fg(){ctx.globalAlpha=.95;for(let k=0;k<7;k++)leaf(4,H+6,-1.2+k*.22,44+k%3*8,k%2?'#16382f':'#1d4a3a');ctx.globalAlpha=1;
[70,235].forEach(x=>{ctx.fillStyle='#444';ctx.fillRect(x-14,-50,1,54);ctx.fillRect(x+14,-50,1,54);ctx.fillStyle='#f6f3e0';ctx.fillRect(x-18,4,38,4);ctx.fillStyle='#fff';ctx.fillRect(x-16,7,34,1)});
if(!fx)return;ctx.globalCompositeOperation='lighter';
[70,235].forEach(x=>{const g=ctx.createRadialGradient(x+1,8,0,x+1,8,50);g.addColorStop(0,'rgba(255,245,200,.35)');g.addColorStop(1,'rgba(255,245,200,0)');ctx.fillStyle=g;ctx.fillRect(x-50,-40,102,100)});
for(let i=0;i<3;i++){ctx.fillStyle=`rgba(255,240,170,${.035+.015*Math.sin(T*.8+i)})`;ctx.beginPath();[[200+i*40,-10],[222+i*40,-10],[130+i*40,H],[100+i*40,H]].forEach((p,j)=>ctx[j?'lineTo':'moveTo'](p[0],p[1]));ctx.fill()}
dust.forEach(d=>{ctx.fillStyle=`rgba(255,250,210,${.2+.35*Math.abs(Math.sin(T+d.p))})`;ctx.fillRect(Q(d.x),Q(d.y),.5,.5)});ctx.globalCompositeOperation='source-over'}
function draw(){ctx.fillStyle='#d9c9a0';ctx.fillRect(0,0,W,H);ctx.setTransform(S,0,0,S,0,0);shell();mid();fg();
if(fx){const v=ctx.createRadialGradient(W/2,H/2,H*.5,W/2,H/2,H*1.1);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(30,15,0,.4)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H)}}
let last=0;
function loop(ts){const dt=Math.min(.05,(ts-last)/1000||0);last=ts;T+=dt;

dust.forEach(d=>{d.x+=d.vx*dt;d.y+=d.vy*dt;if(d.y>H)d.y=0;if(d.x<0)d.x=W;if(d.x>W)d.x=0});
pets.forEach(p=>p.ok&&step(p,dt));hover();draw();requestAnimationFrame(loop)}
boot();requestAnimationFrame(loop);

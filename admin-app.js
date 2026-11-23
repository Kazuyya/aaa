const fi=$('#fi');
const rd=f=>new Promise(r=>{const x=new FileReader();x.onload=()=>r(x.result);x.readAsDataURL(f)});
const sq=src=>new Promise(r=>{const i=new Image();i.onload=()=>{const s=Math.min(i.width,i.height),c=document.createElement('canvas');c.width=c.height=64;c.getContext('2d').drawImage(i,(i.width-s)/2,(i.height-s)/2,s,s,0,0,64,64);r(c.toDataURL('image/png'))};i.src=src});
const nat=(a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true});
const loadI=src=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=src});
async function combine(files){const fr=[];
for(const f of files){const im=await loadI(await rd(f)),w=im.width,h=im.height,c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0);
let gw=w,gh=h,cw=1,chh=1;if(w>200){gw=48;gh=Math.max(1,R(h*48/w));cw=w/gw;chh=h/gh}
const d=x.getImageData(0,0,w,h).data,o=new Uint8ClampedArray(gw*gh*4);
for(let j=0;j<gh;j++)for(let i=0;i<gw;i++){const sx=Math.min(w-1,Math.floor((i+.5)*cw)),sy=Math.min(h-1,Math.floor((j+.5)*chh)),a=(sy*w+sx)*4,t=(j*gw+i)*4;o[t]=d[a];o[t+1]=d[a+1];o[t+2]=d[a+2];o[t+3]=d[a+3]}
const wh=k=>o[k+3]>0&&o[k]>245&&o[k+1]>245&&o[k+2]>245,st=[];
for(let i=0;i<gw;i++)st.push(i,(gh-1)*gw+i);for(let j=0;j<gh;j++)st.push(j*gw,j*gw+gw-1);
while(st.length){const q=st.pop();if(!wh(q*4))continue;o[q*4+3]=0;const i=q%gw,j=(q/gw)|0;if(i>0)st.push(q-1);if(i<gw-1)st.push(q+1);if(j>0)st.push(q-gw);if(j<gh-1)st.push(q+gw)}
fr.push({o,gw,gh})}
const {gw,gh}=fr[0];let x0=gw,y0=gh,x1=0,y1=0;
fr.forEach(({o})=>{for(let j=0;j<gh;j++)for(let i=0;i<gw;i++)if(o[(j*gw+i)*4+3]){x0=Math.min(x0,i);x1=Math.max(x1,i);y0=Math.min(y0,j);y1=Math.max(y1,j)}});
const cw2=x1-x0+1,ch2=y1-y0+1,out=document.createElement('canvas');out.width=cw2*fr.length;out.height=ch2;const g=out.getContext('2d');
fr.forEach(({o},n)=>{const t=document.createElement('canvas');t.width=gw;t.height=gh;t.getContext('2d').putImageData(new ImageData(o,gw,gh),0,0);g.drawImage(t,x0,y0,cw2,ch2,n*cw2,0,cw2,ch2)});
return{src:out.toDataURL(),n:fr.length}}
async function addFiles(fs,target){fs=[...fs].filter(f=>f.type.startsWith('image/')).sort(nat);if(!fs.length)return;
let src,n=0;if(fs.length>1){const r=await combine(fs);src=r.src;n=r.n}else src=await rd(fs[0]);
if(target){target.src=src;target.ok=false;target.fixFrames=n;loadImg(target,true);return}
const nm=fs.length>1?(fs[0].name.replace(/[-_ ]?\d*\.\w+$/,'')||'Pet'):'Pet '+(pets.length+1),p=mk({name:nm,src});p.fixFrames=n;pets.push(p);loadImg(p,true)}
/* ---------- panel ---------- */
const sl=(k,l,a,b,s,v)=>`<label>${l} <b>${v}</b><input type="range" data-k="${k}" min="${a}" max="${b}" step="${s}" value="${v}"></label>`;
function render(){$('#list').innerHTML=pets.map(p=>`<section class="card" data-id="${p.id}">
<div class="top"><button class="av" data-act="photo" title="Upload foto profil">${p.photo?`<img src="${p.photo}">`:esc(p.name[0]||'?')}</button>
<input type="text" data-k="name" value="${esc(p.name)}" maxlength="20" title="Rename"><button data-act="del" title="Hapus">✕</button></div>
<img class="sp" src="${p.src}">
${sl('speed','Speed',.2,4,.1,p.speed)}${sl('fps','FPS',1,24,1,p.fps)}${sl('frames','Frame',1,32,1,p.frames)}${sl('scale','Ukuran',.25,4,.25,p.scale)}
<input type="text" data-k="msg" value="${esc(p.msg)}" placeholder="Pesan bubble (kosong = acak)" maxlength="80">
<div class="row"><button data-act="sprite">Ganti sprite</button>${p.photo?'<button data-act="rmphoto">Hapus foto</button>':''}<label><input type="checkbox" data-k="flip" ${p.flip?'checked':''}> Balik arah</label></div></section>`).join('')}
$('#list').addEventListener('input',e=>{const t=e.target,k=t.dataset.k;if(!k)return;const p=byId(t.closest('.card').dataset.id),v=t.type==='checkbox'?t.checked:t.type==='range'?+t.value:t.value;p[k]=v;
const b=t.closest('label')?.querySelector('b');if(b)b.textContent=v;if(k==='name'&&!p.photo)t.closest('.card').querySelector('.av').textContent=p.name[0]||'?';if(k==='frames')p.t=0;save()});
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,id=b.closest('.card')?.dataset.id;
if(a==='del'){if(b.dataset.arm){pets=pets.filter(p=>p.id!==id);render();save()}else{b.dataset.arm='1';b.textContent='Yakin?';setTimeout(()=>{b.dataset.arm='';b.textContent='✕'},2500)}return}
if(a==='rmphoto'){byId(id).photo=null;render();save();return}
pend={a,id};fi.multiple=a!=='photo';fi.click()});
fi.onchange=async()=>{const fs=[...fi.files];fi.value='';if(!pend||!fs.length)return;
if(pend.a==='add')await addFiles(fs);else if(pend.a==='sprite')await addFiles(fs,byId(pend.id));else byId(pend.id).photo=await sq(await rd(fs[0]));render();save()};
$('#fx').onchange=e=>fx=e.target.checked;
st.ondragover=e=>e.preventDefault();st.ondrop=async e=>{e.preventDefault();await addFiles(e.dataTransfer.files);render()};

const note=t=>{$('#note').textContent=t};
$('#exp').onclick=()=>{const d=pets.map(({id,name,src,photo,frames,fps,speed,scale,msg,flip})=>({id,name,src,photo,frames,fps,speed,scale,msg,flip})),a=document.createElement('a');
a.href=URL.createObjectURL(new Blob([JSON.stringify(d)],{type:'application/json'}));a.download='pets.json';a.click();note('pets.json terunduh. Taruh di root project (sejajar index.html) lalu deploy ulang.')};
$('#imp').onclick=()=>$('#fj').click();
$('#fj').onchange=async e=>{try{const d=JSON.parse(await e.target.files[0].text());pets=d.map(mk);pets.forEach(p=>loadImg(p,false));render();save();note('pets.json dimuat.')}catch(x){note('File pets.json tidak valid.')}e.target.value=''};
hooks.render=render;render();

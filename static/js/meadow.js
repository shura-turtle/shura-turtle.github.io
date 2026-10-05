/* Pixel meadow adapted from background.html. Shared by the preview and blog. */
(() => {
'use strict';
const canvas=document.getElementById('meadow-world') || document.getElementById('world');
if (!canvas || canvas.dataset.initialized) return;
const ctx=canvas.getContext('2d');
if (!ctx) return;
canvas.dataset.initialized='true';
const embedded=canvas.id==='meadow-world';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduced.matches, morning=embedded && document.documentElement.dataset.theme!=='dark', time=0, previous=0, width=640,height=400;
let seed=42;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const stars=Array.from({length:65},()=>({x:random(),y:random()*.53,s:random(),p:random()*7}));
const plants=Array.from({length:340},()=>({x:random(),y:random(),s:random(),p:random()*7}));
const fireflies=Array.from({length:24},()=>({x:random(),y:random(),p:random()*7}));
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h)}
function poly(points,color){ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill()}
function resize(){const scale=innerWidth<600?2:Math.max(2,Math.floor(innerWidth/640));width=Math.ceil(innerWidth/scale);height=Math.ceil(innerHeight/scale);canvas.width=width;canvas.height=height;ctx.imageSmoothingEnabled=false;draw()}
function cloud(x,y,s){const c=morning?'#f6e6d377':'#a99bb532';rect(x,y,49*s,4*s,c);rect(x+8*s,y-4*s,30*s,4*s,c);rect(x+17*s,y-7*s,13*s,3*s,c)}
function pine(x,y,s,c){rect(x-1*s,y,3*s,34*s,c);for(let i=0;i<4;i++){const w=(7+i*5)*s;rect(x-w/2,y+i*6*s,w,5*s,c);rect(x-w/2+2*s,y+(i*6-3)*s,w-4*s,3*s,c)}}
const friends=[{name:'MOCHI',type:'bunny',c:'#f2d9dc',shade:'#cda9c3',ear:'#e4a9bd'},{name:'MAPLE',type:'fox',c:'#eeb687',shade:'#bd806f',ear:'#7c5d72'},{name:'LUNA',type:'cat',c:'#b9afd7',shade:'#9385b2',ear:'#deadc5'},{name:'PIP',type:'frog',c:'#b9d4a0',shade:'#81a58c',ear:'#dbebae'},{name:'HONEY',type:'bear',c:'#dfbb83',shade:'#bc916f',ear:'#a77c65'},{name:'CLOUD',type:'penguin',c:'#a9c6d8',shade:'#809ab9',ear:'#efc58e'}];
function animal(f,x,y,index){
  const t=time*.85+index*1.7,bob=Math.round(Math.sin(t));
  const s=width<400?1:Math.min(2,Math.max(1,Math.floor(width/420)));ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(s,s);
  rect(-11,0,22,3,'#172d3c50');ctx.translate(Math.round(Math.sin(t*.55)*2),bob-2);
  const c=f.c,d=f.shade,e=f.ear,ink='#474253';
  if(f.type==='fox'){rect(9,-12,6,8,d);rect(13,-16,5,9,c);rect(14,-18,4,5,'#f8e6cf')}
  if(f.type==='cat'){rect(9,-10,7,3,d);rect(14,-16,3,7,c)}
  rect(-7,-16,14,15,d);rect(-9,-20,18,13,c);rect(-6,-23,12,4,c);rect(-7,-8,14,6,c);rect(-6,-2,4,3,d);rect(3,-2,4,3,d);
  if(f.type==='bunny'){rect(-7,-34,5,14,c);rect(3,-35,5,15,c);rect(-6,-32,2,9,e);rect(4,-33,2,10,e)}
  if(f.type==='cat'||f.type==='fox'){rect(-9,-28,5,10,c);rect(4,-28,5,10,c);rect(-7,-26,2,5,e);rect(5,-26,2,5,e)}
  if(f.type==='bear'){rect(-10,-26,6,7,d);rect(4,-26,6,7,d);rect(-8,-25,3,4,c);rect(5,-25,3,4,c)}
  if(f.type==='frog'){rect(-9,-26,7,8,c);rect(2,-26,7,8,c);rect(-7,-24,3,4,'#f1ebd0');rect(4,-24,3,4,'#f1ebd0');rect(-6,-23,2,2,ink);rect(4,-23,2,2,ink)}
  if(f.type==='penguin'){rect(-6,-18,12,15,'#f5e5d6');rect(-8,-20,6,8,'#f5e5d6');rect(2,-20,6,8,'#f5e5d6');rect(-7,-1,5,2,e);rect(3,-1,5,2,e)}
  else{rect(-4,-10,8,6,f.type==='fox'?'#f7e7d0':f.type==='frog'?'#d4dfa7': '#f4dfc855')}
  const blink=Math.sin(time*.6+index*2.3)>.993;
  if(f.type!=='frog'){rect(-5,-17,2,blink?1:3,ink);rect(4,-17,2,blink?1:3,ink)}
  rect(-8,-13,3,2,'#e8a3aa');rect(6,-13,3,2,'#e8a3aa');rect(0,-12,2,1,ink);
  if(f.type==='penguin')rect(-1,-13,4,2,e);
  rect(-11,-10,3,5,c);rect(9,-10+Math.round(Math.sin(t)),3,5,c);
  ctx.restore();
  ctx.font='5px monospace';ctx.textAlign='center';ctx.fillStyle=morning?'#526e64':'#d4d9c6';ctx.fillText(f.name,Math.round(x),Math.round(y+13*s));
}
function draw(){
  const w=width,h=height,ground=Math.round(h*.72);
  const sky=ctx.createLinearGradient(0,0,0,ground);sky.addColorStop(0,morning?'#90c9e2':'#203953');sky.addColorStop(.58,morning?'#c2e2ec':'#668b9f');sky.addColorStop(1,morning?'#eee1c8':'#c2ced0');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  stars.forEach(a=>{const alpha=morning?.12:.35+.45*(.5+.5*Math.sin(time*.6+a.p));ctx.globalAlpha=alpha;rect(a.x*w,a.y*h,a.s>.9?2:1,1,'#fff0cb');if(a.s>.94)rect(a.x*w,a.y*h-1,1,3,'#fff0cb')});ctx.globalAlpha=1;
  const mx=w*.81,my=h*.2;rect(mx-7,my-12,14,24,morning?'#fff0c3':'#f8e4bb');rect(mx-11,my-8,22,16,morning?'#fff0c3':'#f8e4bb');if(!morning){rect(mx-2,my-12,13,17,'#38566d');rect(mx+3,my+5,8,4,'#38566d')}
  for(let i=0;i<6;i++)cloud(((i*w/5+time*(i%2?.45:.7))%(w+100))-50,h*(.13+(i%3)*.125),1+i%2);
  for(let layer=0;layer<3;layer++){const pts=[[0,h]];for(let x=0;x<=w+6;x+=6){const y=ground-45+layer*21+Math.sin(x/w*8+layer*2)*19+Math.sin(x/w*19+layer)*7;pts.push([x,Math.round(y)])}pts.push([w,h]);poly(pts,morning?['#97b2ae','#7a9f99','#638f82'][layer]:['#7899ac','#527e96','#3d697d'][layer])}
  for(let i=0;i<17;i++){let x=i*w/16;pine(x,ground-30+Math.sin(i*2)*10,.6+(i%3)*.15,morning?'#608778':'#315d73')}
  poly([[w*.46,ground-2],[w*.52,ground-2],[w*.56,ground+20],[w*.50,ground+35],[w*.64,h],[w*.35,h],[w*.44,ground+36],[w*.50,ground+21]],morning?'#99c6bd':'#79afc5');
  for(let i=0;i<22;i++){const yy=ground+6+i*5,xx=w*.5+Math.sin(i*.7)*w*.015;rect(xx+Math.sin(time*.5+i)*4-8,yy,10+(i%4)*3,1,morning?'#d2dfc7':'#b4b5b780')}
  poly([[0,ground+7],[w*.2,ground-1],[w*.43,ground+15],[w*.46,ground+30],[w*.36,h],[0,h]],morning?'#7a9c79':'#436d70');poly([[w,ground],[w*.77,ground-3],[w*.56,ground+19],[w*.53,ground+33],[w*.65,h],[w,h]],morning?'#7a9c79':'#436d70');
  plants.forEach(a=>{const x=a.x*w,y=ground+a.y*(h-ground);if(Math.abs(x-w*.5)<(y-ground)*.15+13)return;const col=morning?'#547e65':'#315558';rect(x,y,1,3,col);if(a.s>.7){rect(x-1,y-1,3,2,a.s>.87?'#e5bba0':'#b5bca2');rect(x,y,1,1,'#f5dba4')}else if(a.s>.4){rect(x+1,y+1,2,1,col)}});
  // Six friends each have their own patch of meadow; the stream divides the groups.
  friends.forEach((f,i)=>{const xs=[.11,.245,.38,.62,.755,.89];animal(f,w*xs[i],ground+19+Math.sin(i*1.8)*5,i)});
  for(let i=0;i<6;i++){const x=(i%2?w-10:5)+(i%2?-1:1)*Math.floor(i/2)*12;pine(x,ground-40+(i%3)*20,1.6,morning?'#426f61':'#244958')}
  fireflies.forEach(a=>{const x=a.x*w+Math.sin(time*.35+a.p)*7,y=ground-25+a.y*65+Math.cos(time*.4+a.p)*6;ctx.globalAlpha=(morning?.2:.7)*(.35+.65*(.5+.5*Math.sin(time+a.p)));rect(x-1,y-1,3,3,'#f6dba61c');rect(x,y,1,1,'#ffe1a0')});ctx.globalAlpha=1;
}
// Only request frames while the scene is visible and motion is enabled.
let frameId=0;
function frame(now){
  frameId=0;
  if(paused || document.hidden) return;
  if(previous && now-previous<1000/30){frameId=requestAnimationFrame(frame);return;}
  if(previous) time+=Math.min((now-previous)/1000,.1);
  previous=now;
  draw();
  frameId=requestAnimationFrame(frame);
}
function schedule(){
  cancelAnimationFrame(frameId);
  frameId=0;
  previous=0;
  draw();
  if(!paused && !document.hidden) frameId=requestAnimationFrame(frame);
}
const pauseButton=document.getElementById(embedded?'meadow-pause':'pause');
function syncPause(){
  if(!pauseButton) return;
  pauseButton.setAttribute('aria-pressed',String(paused));
  pauseButton.setAttribute('aria-label',paused?'Resume background animation':'Pause background animation');
  pauseButton.title=paused?'Resume background animation':'Pause background animation';
  if(embedded){pauseButton.textContent=paused?'▷':'Ⅱ';return;}
  document.getElementById('pause-label').textContent=paused?'Resume':'Pause';
  document.getElementById('pause-icon').textContent=paused?'▷':'Ⅱ';
}
if(pauseButton) pauseButton.onclick=()=>{paused=!paused;syncPause();schedule()};
if(embedded){
  new MutationObserver(()=>{
    morning=document.documentElement.dataset.theme!=='dark';
    draw();
  }).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
}else{
  document.getElementById('theme').onclick=()=>{
    morning=!morning;
    document.getElementById('theme-label').textContent=morning?'Morning':'Twilight';
    document.getElementById('theme').setAttribute('aria-label',morning?'Switch to twilight':'Switch to morning');
    document.getElementById('scene-label').textContent=morning?'02 / A SOFT, SUNNY MORNING':'01 / THE TWILIGHT MEADOW';
    draw();
  };
}
reduced.addEventListener('change',e=>{paused=e.matches;syncPause();schedule()});
window.addEventListener('resize',resize);
document.addEventListener('visibilitychange',schedule);
syncPause();
resize();
schedule();

})();

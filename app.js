(()=>{
'use strict';
let VH=360;
const introSection=document.querySelector('.intro');
const touchInput=matchMedia('(hover: none), (pointer: coarse)');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
function scrollRange(){return introSection?Math.max(1,introSection.offsetHeight-innerHeight):Math.max(1,document.documentElement.scrollHeight-innerHeight);}

const canvas=document.querySelector('#ocean'), ctx=canvas.getContext('2d');
const layer=document.createElement('canvas'), healthy=document.createElement('canvas'), reveal=document.createElement('canvas');
for(const c of [layer,healthy,reveal]){c.width=640;c.height=360;}
const mask=document.createElement('canvas');mask.width=640;mask.height=360;const mc=mask.getContext('2d');
const lc=layer.getContext('2d'),hc=healthy.getContext('2d'),rc=reveal.getContext('2d');
const LOGO_SECONDS=7;
let demoMode=false,runDuration=30,elapsed=0,tourState="idle",descentSpeed=1;
function wantsFasterDescent(){return !touchInput.matches&&!reducedMotion.matches&&!demoMode&&auto&&depth>.94&&elapsed<runDuration-LOGO_SECONDS&&pointer.active&&pointer.y>=VH*.84&&pointer.y<=VH&&pointer.x>=0&&pointer.x<=640;}
let time=0,last=0,depth=0,target=0,auto=false,autoStart=0,enteredAt=0,energy=0,ending=0,trail=[],pointer={x:320,y:240,active:false},recorder=null,recording=false,uiClean=false;
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t;
let seed=42;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
const corals=Array.from({length:32},(_,i)=>({x:i*22-22+rand()*16,y:277+rand()*74,s:16+rand()*34,type:i%4,hue:[18,335,175,268,35][i%5],seed:rand()*1e6}));
const particles=Array.from({length:18},()=>({x:rand()*640,y:rand()*360,s:rand()>.85?2:1,v:1+rand()*2}));
const STAGE_RATIO=1863/1312;
function stageFit(w,h){const width=Math.min(w,h*STAGE_RATIO),height=width/STAGE_RATIO;return {width,height,left:(w-width)/2,top:(h-height)/2};}
function resize(){const navHeight=introSection?parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'))||72:0;const box=stageFit(innerWidth,innerHeight-navHeight);for(const [key,value] of Object.entries(box))document.documentElement.style.setProperty('--stage-'+key,value+'px');canvas.width=1863;canvas.height=1312;VH=640/STAGE_RATIO;for(const c of [layer,healthy,reveal,mask]){c.width=640;c.height=Math.ceil(VH);}trail=[];}addEventListener('resize',resize);document.addEventListener('fullscreenchange',resize);resize();
function fish(c,x,y,s=1,dir=1){c.save();c.translate(Math.round(x),Math.round(y));c.scale(s*dir,s);c.fillStyle='#ef893f';c.fillRect(-7,-4,12,8);c.fillRect(-4,-6,7,12);c.fillRect(-12,-5,4,10);c.fillRect(-9,-2,3,4);c.fillStyle='#e8ede2';c.fillRect(-5,-4,2,8);c.fillRect(1,-4,2,8);c.fillStyle='#132a34';c.fillRect(4,-2,2,2);c.fillStyle='#b8572d';c.fillRect(-2,4,4,2);c.restore();}
function coral(c,o,color){seed=o.seed;c.save();c.translate(o.x,o.y);const col=l=>color?`hsl(${o.hue} 48% ${l}%)`:`hsl(193 10% ${l*.68}%)`;c.strokeStyle=col(64);c.fillStyle=col(57);c.lineCap='square';
function branch(x,y,len,a,n,w){const ex=x+Math.cos(a)*len,ey=y+Math.sin(a)*len;c.lineWidth=w;c.beginPath();c.moveTo(Math.round(x),Math.round(y));c.lineTo(Math.round(ex),Math.round(ey));c.stroke();if(n>0){branch(ex,ey,len*(.55+rand()*.15),a-.4-rand()*.3,n-1,Math.max(1,w*.65));branch(ex,ey,len*(.55+rand()*.15),a+.4+rand()*.3,n-1,Math.max(1,w*.65));}else{c.fillStyle=col(76);c.fillRect(Math.round(ex)-1,Math.round(ey)-1,2,2);}}
if(o.type===0||o.type===2){branch(0,0,o.s*.5,-Math.PI/2,4,o.type===0?4:2);branch(0,0,o.s*.35,-2.1,3,2);branch(0,0,o.s*.35,-1,3,2);}else if(o.type===1){for(let j=0;j<7;j++){let x=(j-3)*4,h=o.s*(.45+rand()*.5);c.fillStyle=col(45+j*3);c.fillRect(x,-h,4,h);c.fillStyle=col(80);c.fillRect(x,-h,4,2);}}else{for(let j=0;j<4;j++){c.fillStyle=col(48+j*6);c.beginPath();c.ellipse(j%2*5-3,-j*6,o.s*(.52-j*.08),4,0,0,Math.PI*2);c.fill();}}c.restore();}
let journey=0,scrollGoal=0,scrollVelocity=0,previousJourney=0,worlds=null;
const WORLD=960,VIEW=360;
const logoArt=new Image();logoArt.src="assets/gongmyeong-logo-clear.png";
const logoFrames = Array.from({length: LOGO_SECONDS}, (_, second) => {
 const sheet = new Image();
 sheet.src = `assets/gongmyeong-ending-${second}.webp`;
 return sheet;
});

function drawEndingLogo() {
 const lastFrame = LOGO_SECONDS * 30 - 1;
 const clipTime = elapsed - (runDuration - LOGO_SECONDS);
 const frame = tourState === 'complete' || reducedMotion.matches
   ? lastFrame : clamp(Math.floor(clipTime * 30), 0, lastFrame);
 const sheet = logoFrames[Math.floor(frame / 30)];
 if (!sheet.complete || !sheet.naturalWidth) return false;

 // The cropped tiles share a fixed origin within the source's square frame.
 const tile = frame % 30;
 const size = canvas.height * .38;
 const scale = size / 360;
 const x = (canvas.width - size) / 2 + 72 * scale;
 const y = canvas.height * .42 - size / 2 + 8 * scale;
 ctx.imageSmoothingEnabled = true;
 ctx.drawImage(sheet, (tile % 6) * 212, Math.floor(tile / 6) * 304, 212, 304,
   x, y, 212 * scale, 304 * scale);
 return true;
}

const originalMood=new URLSearchParams(location.search).get('mood')==='original';
const reefArt=new Image();reefArt.onload=()=>{worlds=null;};reefArt.src=originalMood?"assets/reef-v5.png":"assets/reef-canyon-pixel-v18.png";
const sprites=[0,1,2,3,4,5,6].map(i=>{const im=new Image();im.src=`assets/animal-${i}-1.png`;return im;});
const schools=[{id:2,y:340,x:280,size:32,count:2},{id:4,y:580,x:350,size:34,count:7},{id:3,y:800,x:270,size:31,count:6},{id:1,y:1080,x:355,size:37,count:2},{id:0,y:1190,x:250,size:39,count:2},{id:6,y:1430,x:330,size:34,count:8},{id:5,y:1700,x:235,size:50,count:2}];
const creatures=schools.flatMap(s=>Array.from({length:s.count},(_,i)=>({...s,y:s.y*.4+60,member:i,phase:i*1.73+s.id,offsetX:(i-(s.count-1)/2)*18,offsetY:Math.sin(i*2.4+s.id)*21+(i%2)*8,size:s.size*(.8+(i%4)*.09)})));
// Keep the canyon's varied hues; bring their depth and clarity closer to coral-study-active.png.
// Geometry and the bleached world remain unchanged.
function matchLivingCoral(c){
 const image=c.getImageData(0,0,640,WORLD),p=image.data;
 for(let i=0;i<p.length;i+=4){
  const r=p[i]/255,g=p[i+1]/255,b=p[i+2]/255,max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
  let l=(max+min)/2;if(d<.035||l<.20||l>.90)continue;
  let h=max===r?((g-b)/d+(g<b?6:0)):max===g?(b-r)/d+2:(r-g)/d+4;h/=6;
  let sat=d/(1-Math.abs(2*l-1));
  // Reference warm coral midtones are darker and more rose-coloured than the canyon source.
  if(h>.80||h<.10){const pigment=clamp((sat-.12)/.18);h=(h+.008*pigment)%1;l=Math.max(0,l-.035*pigment);sat=Math.min(1,sat*1.15);}
  else if(h>.52&&h<.70){l*=.991;sat=Math.min(1,sat*1.08);}
  else if(h>=.70&&h<=.80){l*=.993;sat=Math.min(1,sat*1.10);}
  else continue;
  const q=l<.5?l*(1+sat):l+sat-l*sat,v=2*l-q;
  const hue=t=>{t=(t+1)%1;return t<1/6?v+(q-v)*6*t:t<.5?q:t<2/3?v+(q-v)*(2/3-t)*6:v;};
  p[i]=hue(h+1/3)*255;p[i+1]=hue(h)*255;p[i+2]=hue(h-1/3)*255;
 }
 c.putImageData(image,0,0);
}
function makeWorld(color){const w=document.createElement('canvas');w.width=640;w.height=WORLD;const c=w.getContext('2d');if(reefArt.complete&&reefArt.naturalWidth){c.filter=originalMood&&!color?'grayscale(1) brightness(.82)':'none';c.drawImage(reefArt,0,0,640,WORLD);c.filter='none';if(color&&!originalMood)matchLivingCoral(c);
// Preserve navy water and cobalt shadows while bright coral loses its living pigment.
if(!originalMood&&!color){const image=c.getImageData(0,0,640,WORLD),pixels=image.data;for(let i=0;i<pixels.length;i+=4){const r=pixels[i],g=pixels[i+1],b=pixels[i+2],l=.2126*r+.7152*g+.0722*b,amount=clamp((l-23)/80);pixels[i]=mix(r,Math.min(255,l*1.10+9),amount);pixels[i+1]=mix(g,Math.min(255,l*1.10+9),amount);pixels[i+2]=mix(b,Math.min(255,l*1.07+7),amount);}c.putImageData(image,0,0);}return w;}seed=718;
const g=c.createLinearGradient(0,0,0,WORLD);g.addColorStop(0,color?'#208eac':'#176d8c');g.addColorStop(.2,color?'#155877':'#103d60');g.addColorStop(.65,color?'#133c66':'#0b2348');g.addColorStop(1,color?'#092543':'#06142f');c.fillStyle=g;c.fillRect(0,0,640,WORLD);
// Layered coral canyon, with an open path through its center.
for(let layer=0;layer<3;layer++){for(let side=0;side<2;side++){const edge=side?640:0;c.fillStyle=['#16477a','#112e5d','#0b1942'][layer];c.beginPath();c.moveTo(edge,0);for(let y=0;y<WORLD;y+=12){let width=85+layer*7+Math.sin(y*.007+side*3+layer)*29+rand()*20;c.lineTo(side?640-width:width,y);}c.lineTo(edge,WORLD);c.fill();
for(let y=60;y<WORLD;y+=35+rand()*30){let x=side?640-(60+rand()*100):60+rand()*100;const o={x,y,s:25+rand()*65,type:Math.floor(rand()*4),hue:[185,266,330,23,165][Math.floor(rand()*5)],seed:rand()*1e6};c.globalAlpha=layer===0?.35:layer===1?.6:1;coral(c,o,color);c.globalAlpha=1;}
}}
for(let i=0;i<20;i++){const y=180+rand()*1800,x=180+rand()*280;c.globalAlpha=.16;coral(c,{x,y,s:20+rand()*80,type:i%4,hue:185,seed:rand()*1e6},color);c.globalAlpha=1;}
for(let x=100;x<550;x+=17){coral(c,{x,y:2150+rand()*40,s:30+rand()*90,type:Math.floor(rand()*4),hue:[180,320,265,25][Math.floor(rand()*4)],seed:rand()*1e6},color);}
const glow=c.createRadialGradient(320,2090,5,320,2090,190);glow.addColorStop(0,color?'#38dbdc45':'#26859c30');glow.addColorStop(1,'transparent');c.fillStyle=glow;c.fillRect(100,1900,440,300);return w;}
let fishHits=[],hoverFish=null,hoverSince=0,greetedFish=null,greetUntil=0;
function seabed(c,color,t){if(!color)fishHits=[];if(!worlds)worlds=[makeWorld(false),makeWorld(true)];const camera=journey*(WORLD-VH);c.clearRect(0,0,640,VH);c.drawImage(worlds[color?1:0],0,Math.floor(camera),640,VH,0,0,640,VH);
// A restrained shaft of surface light recedes as the viewer descends.
c.fillStyle=`rgba(100,218,223,${(originalMood?.06:.016)*(1-journey)})`;c.beginPath();c.moveTo(275,0);c.lineTo(365,0);c.lineTo(425,VH);c.lineTo(215,VH);c.fill();
c.fillStyle=color?'#9ae1dc70':'#77bdc545';for(const p of particles.slice(0,reducedMotion.matches?0:touchInput.matches?8:18))c.fillRect(p.x+Math.sin(t*.15+p.y)*3,((p.y-camera*.25-t*p.v)%(VH+20)+(VH+20))%(VH+20),p.s,p.s);
for(const a of creatures){let local=clamp((camera-a.y+310)/440),x=a.x+Math.sin(local*Math.PI*2)*65+a.offsetX+Math.sin(t*.65+a.phase)*3,y=a.y-camera+a.offsetY+Math.sin(t*.8+a.phase)*4; if(y< -80||y>VH+80)continue;let distance=Math.hypot(pointer.x-x,pointer.y-y),near=pointer.active?clamp(1-distance/100):0;let size=a.size*(1+near*.16);if(a.id===0||a.id===1)size*=1+near*.3;x+=Math.sin(t*1.5+a.phase)*near*9;y-=near*12;const happy=clamp(((a.happyUntil||0)-t)/2.4);if(happy){size*=1+Math.sin((1-happy)*Math.PI)*.22;y-=Math.sin((1-happy)*Math.PI*3)*5*happy;}if(!color)fishHits.push({a,x,y,size});const im=sprites[a.id];if(im.complete&&im.naturalWidth){c.save();c.globalAlpha=color?1:.85;c.translate(x,y);c.rotate(Math.sin(t*1.1+a.phase)*.04+clamp(scrollVelocity,-.15,.15));if(a.id!==5)c.scale(Math.cos(local*Math.PI*2)>0?-1:1,1);c.drawImage(im,-size/2,-size/2,size,size);c.restore();}if(near>.05){c.strokeStyle=`rgba(148,230,225,${near*.3})`;c.lineWidth=.5;c.beginPath();c.arc(x,y,size*.6+Math.sin(t*2)*3,0,Math.PI*2);c.stroke();}}
}
function closestFish(x,y){let best=null,distance=Infinity;for(const hit of fishHits){const d=Math.hypot(x-hit.x,y-hit.y);if(d<Math.max(22,hit.size*.8)&&d<distance){distance=d;best=hit;}}return best;}
function drawFishGreeting(c,t){
 if(depth<.94||ending>.15){hoverFish=null;return;}
 const nearest=pointer.active?closestFish(pointer.x,pointer.y):null;
 if((nearest?.a||null)!==hoverFish){hoverFish=nearest?.a||null;hoverSince=t;}
 const clicked=t<greetUntil?fishHits.find(h=>h.a===greetedFish):null;
 const hit=clicked||(nearest&&t-hoverSince>.22?nearest:null);if(!hit)return;
 const active=!!clicked,alpha=active?Math.min(1,(greetUntil-t)/.45):ease((t-hoverSince-.22)/.3);
 const phrases=['반가워!','함께 헤엄칠래?','안녕!','여기 있어!','가까이 와 봐','만나서 반가워!','같이 가자!'];
 const label=active?'반가워, 친구!':phrases[hit.a.id];
 const w=active?90:100,h=25,x=clamp(hit.x-w/2,12,640-w-12),y=clamp(hit.y-hit.size*.7-38,10,VH-40);
 c.save();c.globalAlpha=alpha;c.fillStyle='rgba(4,20,27,.91)';c.strokeStyle=active?'#eeb2bf':'#c5e2c4';c.lineWidth=.6;c.beginPath();c.roundRect(x,y,w,h,6);c.fill();c.stroke();c.beginPath();c.moveTo(hit.x-3,y+h);c.lineTo(hit.x,y+h+4);c.lineTo(hit.x+3,y+h);c.stroke();
 c.textAlign='center';c.textBaseline='middle';c.font='400 10px Pretendard, sans-serif';c.fillStyle='#e8f4df';c.fillText(label,x+w/2,y+h/2);
 c.font='400 12px Pretendard, sans-serif';c.fillStyle=active?'#f2b3c3':'#d6efbc';c.fillText(active?'♥':'♪',clamp(hit.x+hit.size*.45,15,620),hit.y-hit.size*.5-5-Math.sin(t*2)*2);c.restore();
}
function greetFish(e){if(touchInput.matches&&depth>.94){const r=canvas.getBoundingClientRect();pointer={x:(e.clientX-r.left)/r.width*640,y:(e.clientY-r.top)/r.height*VH,active:true};addTrail();}if(tourState==='idle'){enter();return;}if(depth<.94||ending>.15)return;const rect=canvas.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width*640,y=(e.clientY-rect.top)/rect.height*VH,hit=closestFish(x,y);if(!hit)return;greetedFish=hit.a;greetUntil=time+2.4;hit.a.happyUntil=greetUntil;}
function bowl(c,t,drop){c.save();c.translate(320,VH*.47-ease(drop)*VH*.42);c.globalAlpha=1-ease(drop*.95);c.strokeStyle='#d6e2e3';c.lineWidth=.8;c.beginPath();c.moveTo(-30,-37);c.bezierCurveTo(-58,-18,-55,34,-26,43);c.quadraticCurveTo(0,49,26,43);c.bezierCurveTo(55,34,58,-18,30,-37);c.stroke();c.beginPath();c.ellipse(0,-38,31,3,0,0,Math.PI*2);c.stroke();c.strokeStyle='#718a94';c.beginPath();for(let x=-43;x<44;x++) {let y=-15+Math.sin(x*.12+t)*1.5;x===-43?c.moveTo(x,y):c.lineTo(x,y);}c.stroke();c.beginPath();c.moveTo(-25,47);c.lineTo(25,47);c.stroke();c.restore();const fy=VH*.47+Math.sin(t*1.5)*3+ease(drop)*VH*.34;fish(c,320+Math.sin(t*.6)*14*(1-drop),fy,1,Math.cos(t*.6)>-.4?1:-1);}
function draw(t){const d=ease(depth);seabed(lc,false,t);seabed(hc,true,t);rc.clearRect(0,0,640,VH);rc.drawImage(healthy,0,0);rc.globalCompositeOperation='destination-in';mc.clearRect(0,0,640,VH);for(const p of trail){let life=clamp(1-(t-p.t)/3);if(!life)continue;const r=42+12*(1-life),g=mc.createRadialGradient(p.x,p.y,0,p.x,p.y,r);const pigment=originalMood?life:Math.min(1,life*3);g.addColorStop(0,`rgba(255,255,255,${originalMood?life*.9:pigment})`);g.addColorStop(originalMood?.5:.62,`rgba(255,255,255,${originalMood?life*.7:pigment})`);g.addColorStop(1,'transparent');mc.fillStyle=g;mc.fillRect(p.x-r,p.y-r,r*2,r*2);}mc.fillStyle=`rgba(255,255,255,${ending*.13})`;mc.fillRect(0,0,640,VH);rc.drawImage(mask,0,0);rc.globalCompositeOperation='source-over';lc.drawImage(reveal,0,0);
ctx.setTransform(canvas.width/640,0,0,canvas.width/640,0,0);ctx.fillStyle='#020406';ctx.fillRect(0,0,640,VH);ctx.globalAlpha=ease((depth-.17)/.65);ctx.imageSmoothingEnabled=false;ctx.drawImage(layer,0,(1-d)*160);ctx.globalAlpha=1;
if(depth<.98)bowl(ctx,t,depth);else fish(ctx,320+Math.sin(t*.4)*18,VH*(.46+ending*.12)+Math.sin(t*.7)*5,.7,1);
if(demoMode&&auto&&depth>.95&&time-autoStart>12&&time-autoStart<22){ctx.strokeStyle='#c1eceb66';ctx.lineWidth=.5;ctx.beginPath();ctx.arc(pointer.x,pointer.y,4,0,Math.PI*2);ctx.stroke();}
drawFishGreeting(ctx,t);
ctx.setTransform(1,0,0,1,0,0);if(ending>0){
// A soft vignette supports the transparent logo without a rectangular panel.
ctx.save();ctx.globalAlpha=ending;const veil=ctx.createRadialGradient(canvas.width/2,canvas.height*.46,0,canvas.width/2,canvas.height*.46,canvas.height*.66);veil.addColorStop(0,'rgba(2,7,10,.64)');veil.addColorStop(.55,'rgba(2,7,10,.40)');veil.addColorStop(1,'rgba(2,7,10,0)');ctx.fillStyle=veil;ctx.fillRect(0,0,canvas.width,canvas.height);
ctx.globalAlpha=1;
if(!drawEndingLogo()){
ctx.globalAlpha=ending;
const h=canvas.height*.54,w=h*(logoArt.naturalWidth/ logoArt.naturalHeight||.8),x=(canvas.width-w)/2,y=canvas.height*.17;
if(logoArt.complete&&logoArt.naturalWidth){ctx.imageSmoothingEnabled=true;ctx.drawImage(logoArt,x,y,w,h);}else{ctx.textAlign='center';ctx.fillStyle='#fff9e7';ctx.font=`600 ${canvas.height*.08}px Pretendard, sans-serif`;ctx.fillText('共 鳴 體',canvas.width/2,canvas.height*.48);}}
ctx.globalAlpha=ending;ctx.textAlign='center';ctx.fillStyle='#d5e4df';ctx.font=`400 ${Math.max(12,canvas.height*.021)}px Pretendard, sans-serif`;ctx.fillText('작은 움직임이, 다시 색이 되는 곳',canvas.width/2,canvas.height*.76);ctx.restore();}}

let lastTrail=0;
function frame(ms){time=ms/1000;const dt=Math.min(Math.max(0,time-last),.05);last=time;
if(auto){const speedTarget=wantsFasterDescent()?3:1;descentSpeed+=(speedTarget-descentSpeed)*(1-Math.exp(-dt*4));if(elapsed>=runDuration-LOGO_SECONDS)descentSpeed=1;elapsed+=dt*descentSpeed;const t=elapsed;depth=ease((t-.6)/4.2);journey=ease((t-4.5)/(runDuration-7.5));scrollVelocity=(journey-previousJourney)*15;previousJourney=journey;
if(demoMode&&t>10&&t<runDuration-3){const q=(t-10)/(runDuration-13);pointer={x:125+q*395,y:VH*.7+Math.sin(q*Math.PI*3)*23,active:true};}
if(depth>.94&&pointer.active)addTrail();ending=ease((t-(runDuration-LOGO_SECONDS))/LOGO_SECONDS);
if(t>=runDuration){auto=false;tourState='complete';depth=journey=ending=1;pointer.active=false;stopRecording();}}
else if(tourState==='complete'&&pointer.active)addTrail();
trail=trail.filter(p=>time-p.t<3);if(!introSection||introSection.getBoundingClientRect().bottom>0||recording){draw(time);updateUI();}requestAnimationFrame(frame);}
function addTrail(){if(time-lastTrail>.035){trail.push({x:pointer.x,y:pointer.y,t:time});lastTrail=time;}}
function startTour(isDemo=false){reset(false);demoMode=isDemo;runDuration=isDemo?25:30;auto=true;tourState='running';autoStart=time;updateUI();}
function enter(){if(tourState==='idle')startTour(false);}
function reset(move=true){auto=false;tourState='idle';demoMode=false;elapsed=0;descentSpeed=1;journey=scrollGoal=previousJourney=0;depth=target=ending=energy=0;trail=[];fishHits=[];hoverFish=greetedFish=null;greetUntil=0;creatures.forEach(a=>a.happyUntil=0);pointer.active=false;stopRecording();if(move)window.scrollTo({top:0,behavior:'instant'});updateUI();}
function play(){if(auto){auto=false;tourState='paused';stopRecording();}else if(tourState==='paused'){auto=true;tourState='running';}else startTour(true);updateUI();}
function finishTour(){auto=false;tourState='complete';elapsed=runDuration;depth=journey=ending=1;pointer.active=false;stopRecording();updateUI();}
function updateUI(){const tourToggle=document.querySelector('#tourToggle');if(tourToggle){tourToggle.hidden=!['running','paused'].includes(tourState);tourToggle.textContent=tourState==='paused'?'이어가기':'잠시 멈춤';tourToggle.setAttribute('aria-pressed',String(tourState==='paused'));}canvas.setAttribute('aria-label',tourState==='idle'?'어항에서 바다로 체험 시작 — Enter 또는 Space 키':'바다 체험 — Space 키로 일시 정지, R 키로 처음으로');const follow=document.querySelector('#continueStory');if(follow){follow.style.opacity=tourState==='complete'?'1':'0';follow.style.pointerEvents=tourState==='complete'?'auto':'none';follow.tabIndex=tourState==='complete'?0:-1;}
const n=depth<.04?0:depth<.94?1:ending>.2?4:trail.length?3:2;document.querySelector('#sceneNum').textContent=`0${n+1} / 05`;document.querySelector('#sceneName').textContent=['고요한 시작','깊은 곳으로','잠든 산호','색을 깨우는 움직임','공명'][n];
const hint=document.querySelector('#hint');hint.style.opacity=tourState==='complete'?'0':'1';hint.innerHTML=tourState==='idle'?'어항을 클릭해 바다로 들어가세요<span>약 30초 · 마우스로 산호의 색을 깨워보세요</span>':tourState==='paused'?'잠시 머무르는 중<span>Space 키로 이어갈 수 있어요</span>':depth<.94?'천천히, 바다 속으로<span>잠시 후 마우스로 산호의 색을 깨워보세요</span>':'산호의 색을 깨우고, 물고기를 클릭해 인사해보세요<span>'+(wantsFasterDescent()?'조금 더 빠르게, 깊은 바다로 ↓':'화면 아래쪽에 커서를 두면 조금 더 빠르게 내려갑니다 ↓')+'</span>';
if(touchInput.matches){hint.innerHTML=tourState==='idle'?'어항을 탭해 바다로 들어가세요<span>약 30초 · 산호와 물고기를 탭해 보세요</span>':tourState==='paused'?'잠시 머무르는 중<span>이어가기를 눌러 체험을 계속하세요</span>':depth<.94?'천천히, 바다 속으로<span>잠시 후 산호를 탭해 색을 깨워보세요</span>':'산호와 물고기를 탭해 보세요<span>손길이 닿은 곳에 잠시 색이 돌아옵니다</span>'; }if(ending>.1)hint.style.opacity='0';document.querySelector('#progress').style.width=(elapsed/runDuration*100)+'%';document.querySelector('#status').textContent=recording?'RECORDING':tourState==='running'?`${Math.floor(elapsed)} / ${runDuration} SEC`:tourState==='complete'?'이어서 바다의 이야기를 만나보세요':'CLICK TO EXPLORE';
document.querySelector('#play').innerHTML=auto?'Ⅱ <span>잠시 멈춤</span>':tourState==='paused'?'▷ <span>이어가기</span>':'▷ <span>25초 시연</span>';}
function introLocked(){return tourState!=='complete'&&(!introSection||window.scrollY<introSection.offsetHeight*.45);}
function blockIntroScroll(e){if(!introLocked()||e.ctrlKey||e.target.closest('header, #guide, .site-head, input, textarea'))return;if(e.cancelable)e.preventDefault();}
addEventListener('wheel',blockIntroScroll,{passive:false});addEventListener('touchmove',blockIntroScroll,{passive:false});
canvas.addEventListener('click',greetFish);canvas.addEventListener('pointermove',e=>{if((demoMode&&auto)||e.pointerType!=='mouse')return;const r=canvas.getBoundingClientRect();pointer={x:(e.clientX-r.left)/r.width*640,y:(e.clientY-r.top)/r.height*VH,active:true};});canvas.addEventListener('pointerleave',()=>pointer.active=false);canvas.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')pointer.active=false;});
const tourToggle=document.querySelector('#tourToggle');if(tourToggle)tourToggle.onclick=play;canvas.addEventListener('keydown',e=>{if(e.code==='Space'||e.key==='Enter'){e.preventDefault();e.stopPropagation();if(tourState==='idle')enter();else play();}});document.querySelector('#play').onclick=play;document.querySelector('#reset').onclick=()=>reset();document.querySelector('#home').onclick=e=>{e.preventDefault();reset();};document.querySelector('#info').onclick=()=>document.querySelector('#guide').hidden=false;document.querySelector('#close').onclick=()=>document.querySelector('#guide').hidden=true;
document.querySelector('#full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch(e){toast('브라우저의 전체 화면 기능(F11)을 사용해 주세요.');}};
document.querySelectorAll('.site-head a, .skip-intro').forEach(a=>a.addEventListener('click',e=>{if(a.getAttribute('href')==='#top'){e.preventDefault();history.replaceState(null,'','#top');reset();}else finishTour();}));
addEventListener('keydown',e=>{if(e.target.closest('button,a,input,textarea,select,canvas,video')||e.ctrlKey||e.metaKey||e.altKey)return;if(introLocked()&&['ArrowDown','ArrowUp','PageDown','PageUp','Home','End'].includes(e.key))e.preventDefault();if(e.code==='Space'){e.preventDefault();if(tourState==='idle')enter();else play();}if(e.key.toLowerCase()==='r')reset();if(e.key.toLowerCase()==='h'){uiClean=!uiClean;(introSection||document.body).classList.toggle('clean',uiClean);}if(e.key==='Escape'){document.querySelector('#guide').hidden=true;if(auto)play();}if(e.key==='Enter')enter();});
if(introSection&&location.hash&&location.hash!=='#top')finishTour();
function toast(msg){const t=document.querySelector('#toast');t.textContent=msg;t.style.opacity=1;setTimeout(()=>t.style.opacity=0,5000);}
function stopRecording(){if(recorder&&recorder.state==='recording')recorder.stop();recording=false;}
document.querySelector('#record').onclick=()=>{if(recording){toast('25초 시연이 끝나면 영상이 저장됩니다.');return;}if(!window.MediaRecorder||!canvas.captureStream){toast('이 브라우저는 영상 저장을 지원하지 않아요. 25초 시연을 화면 녹화해 주세요.');return;}reset(false);const mime=['video/mp4;codecs=avc1.42E01E','video/mp4','video/webm;codecs=vp9','video/webm'].find(x=>MediaRecorder.isTypeSupported(x));if(!mime){toast('25초 시연을 화면 녹화해 주세요.');return;}let chunks=[];try{const stream=canvas.captureStream(30);recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:8000000});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onstop=()=>{stream.getTracks().forEach(t=>t.stop());if(!chunks.length)return;const url=URL.createObjectURL(new Blob(chunks,{type:mime})),a=document.createElement('a');a.href=url;a.download='Gongmyeong_25s.'+(mime.includes('mp4')?'mp4':'webm');a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);toast('시연 영상이 저장되었습니다.');};recorder.start();recording=true;demoMode=true;runDuration=25;elapsed=0;tourState='running';auto=true;autoStart=time;document.querySelector('#play').innerHTML='Ⅱ <span>시연 중지</span>';toast('25초 자동 시연을 녹화합니다. 화면에는 조작 패널이 포함되지 않아요.');}catch(e){recording=false;toast('녹화를 시작하지 못했어요. 자동 시연을 화면 녹화해 주세요.');}};
requestAnimationFrame(frame);

})();

(()=>{
'use strict';
const fine=matchMedia('(hover: hover) and (pointer: fine)');
if(!fine.matches||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const canvas=document.createElement('canvas');canvas.className='light-cursor';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);
const c=canvas.getContext('2d');if(!c){canvas.remove();return;}
let x=0,y=0,inside=false,visible=false,points=[],raf=0;
function resize(){const d=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*d;canvas.height=innerHeight*d;c.setTransform(d,0,0,d,0,0);points=[];}
function clear(){visible=false;points=[];document.documentElement.classList.remove('light-cursor-active');c.clearRect(0,0,innerWidth,innerHeight);}
function allowed(target){return fine.matches&&inside&&target&&!target.closest('iframe,video,input,textarea,select,[contenteditable="true"]');}
function update(target){visible=!!allowed(target);document.documentElement.classList.toggle('light-cursor-active',visible);if(!visible)clear();else if(!raf)raf=requestAnimationFrame(draw);}
function draw(now){raf=0;c.clearRect(0,0,innerWidth,innerHeight);if(!visible)return;
points=points.filter(p=>now-p.t<700);
if(!reduced.matches){for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],life=Math.max(0,1-(now-a.t)/700);c.strokeStyle=`rgba(202,239,205,${life*.32})`;c.lineWidth=.7;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}}
const glow=c.createRadialGradient(x,y,0,x,y,20);glow.addColorStop(0,'rgba(191,245,187,.20)');glow.addColorStop(1,'rgba(191,245,187,0)');c.fillStyle=glow;c.fillRect(x-20,y-20,40,40);c.fillStyle='#deffd6';c.beginPath();c.arc(x,y,3,0,Math.PI*2);c.fill();if(points.length)raf=requestAnimationFrame(draw);
}
document.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'){inside=false;clear();return;}inside=true;x=e.clientX;y=e.clientY;update(e.target);if(visible&&!reduced.matches){points.push({x,y,t:performance.now()});if(points.length>160)points.shift();}},{passive:true});
document.addEventListener('pointerout',e=>{if(!e.relatedTarget){inside=false;clear();}});
addEventListener('scroll',()=>update(document.elementFromPoint(x,y)),{passive:true});
addEventListener('blur',()=>{inside=false;clear();});document.addEventListener('visibilitychange',()=>{if(document.hidden){inside=false;clear();}});
addEventListener('resize',()=>{resize();update(document.elementFromPoint(x,y));});fine.addEventListener('change',()=>update(document.elementFromPoint(x,y)));resize();
})();

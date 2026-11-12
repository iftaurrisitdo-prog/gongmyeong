'use strict';
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const steps=[['02 / SYMBIOSIS','산호와 공생조류는 함께 살아갑니다. 공생조류는 광합성으로 얻은 에너지를 산호에 제공하며 산호의 색에도 관여합니다.'],['01 / THERMAL STRESS','수온 변화와 같은 환경 스트레스는 산호와 공생조류의 관계를 흔들 수 있습니다. 색의 변화는 그 관계가 불안정해지고 있다는 신호입니다.'],['03 / CORAL BLEACHING','산호가 공생조류를 잃으면 조직 아래의 하얀 골격이 드러납니다. 스트레스가 완화되면 회복할 수 있지만, 오래 지속되면 생존이 어려워집니다.']];
const study=document.querySelector('.reef-study');
// The supplied active image is displayed unmodified. Its bleached state shares every pixel position.
async function prepareRegisteredReef(){
 try{
  const active=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src='assets/coral-study-active.png';});
  const surface=document.createElement('canvas');surface.width=active.naturalWidth;surface.height=active.naturalHeight;
  const c=surface.getContext('2d',{willReadFrequently:true});c.drawImage(active,0,0);
  const image=c.getImageData(0,0,surface.width,surface.height),p=image.data;
  const clamp=v=>Math.min(1,Math.max(0,v));
  for(let i=0;i<p.length;i+=4){
   const y=Math.floor(i/4/surface.width)/surface.height;
   if(y<.22)continue;
   const r=p[i],g=p[i+1],b=p[i+2],l=.2126*r+.7152*g+.0722*b;
   const pigment=clamp((r/Math.max(b,1)-.65)/.55),highlight=clamp((l-60)/85);
   const amount=Math.max(pigment,highlight)*clamp((l-16)/38);
   p[i]=r*(1-amount)+Math.min(255,l*1.12+16)*amount;
   p[i+1]=g*(1-amount)+Math.min(255,l*1.12+16)*amount;
   p[i+2]=b*(1-amount)+Math.min(255,l*1.08+13)*amount;
  }
  c.putImageData(image,0,0);
  study.querySelector('.study-art').style.backgroundImage=`url("${surface.toDataURL('image/png')}")`;
  study.querySelectorAll('.study-restored').forEach(el=>{el.style.backgroundImage='url("assets/coral-study-active.png")';});
  study.dataset.registered='true';
 }catch(error){console.warn('Coral state could not load; retaining the source image.',error);}
}
prepareRegisteredReef();
let pinnedStep=null;
const reefButtons=[...study.querySelectorAll('[data-step]')];
const choiceButtons=[...document.querySelectorAll('[data-reef-select]')];
function setStep(n){
 study.dataset.active=String(n);
 reefButtons.forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.step)===n)));
 choiceButtons.forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.reefSelect)===n)));
 study.querySelectorAll('.reef-callout').forEach((c,i)=>c.setAttribute('aria-hidden',String(i!==n)));
 document.querySelector('#stepNumber').textContent=steps[n][0];
 document.querySelector('#stepText').textContent=steps[n][1];
}
function clearStudy(){
 study.dataset.active='none';
 [...reefButtons,...choiceButtons].forEach(b=>b.setAttribute('aria-pressed','false'));
 study.querySelectorAll('.reef-callout').forEach(c=>c.setAttribute('aria-hidden','true'));
 document.querySelector('#stepNumber').textContent='EXPLORE THE REEF';
 document.querySelector('#stepText').textContent='세 산호 지대에 마우스를 올리거나 버튼을 선택해 산호의 이야기를 살펴보세요.';
}
function choose(n){if(pinnedStep===n){pinnedStep=null;clearStudy();}else{pinnedStep=n;setStep(n);}}
reefButtons.forEach(b=>{
 const n=Number(b.dataset.step);
 b.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&pinnedStep===null)setStep(n);});
 b.addEventListener('focus',()=>{if(b.matches(':focus-visible')&&pinnedStep===null)setStep(n);});
 b.addEventListener('click',()=>choose(n));
});
choiceButtons.forEach(b=>b.addEventListener('click',()=>choose(Number(b.dataset.reefSelect))));
study.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||pinnedStep!==null)return;if(!e.target.closest('[data-step]'))clearStudy();});
study.addEventListener('pointerleave',()=>{if(pinnedStep===null&&!reefButtons.includes(document.activeElement))clearStudy();});
study.addEventListener('click',e=>{if(!e.target.closest('[data-step]')){pinnedStep=null;clearStudy();}});
study.addEventListener('focusout',e=>{if(pinnedStep===null&&!study.contains(e.relatedTarget))clearStudy();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){pinnedStep=null;clearStudy();}});
const impacts=[...document.querySelectorAll('.impact-step')],meter=document.querySelector('.impact-meter');
function impactProgress(){const first=impacts[0].getBoundingClientRect(),last=impacts.at(-1).getBoundingClientRect(),p=Math.max(0,Math.min(1,(innerHeight*.5-first.top-first.height*.5)/(last.top+last.height*.5-first.top-first.height*.5))),active=Math.round(p*(impacts.length-1));meter.style.setProperty('--heat',p);document.querySelector('#heatFill').style.height=`${p*100}%`;document.querySelector('#heatValue').textContent=String(Math.round(p*100)).padStart(2,'0');document.querySelector('#heatLabel').textContent=impacts[active].querySelector('h3').textContent;impacts.forEach((el,i)=>el.classList.toggle('is-active',i===active));}
let impactPending=false;addEventListener('scroll',()=>{if(!impactPending){impactPending=true;requestAnimationFrame(()=>{impactProgress();impactPending=false;});}},{passive:true});addEventListener('resize',impactProgress);impactProgress();
const shareFilmButton = document.querySelector('#shareExhibitionFilm');
shareFilmButton.addEventListener('click', async () => {
 const url = new URL(window.location.pathname, window.location.origin);
 url.hash = 'experience';
 const status = document.querySelector('#exhibitionShareStatus');
 const fallback = document.querySelector('#exhibitionShareFallback');
 fallback.hidden = true;
 status.textContent = '';

 if (navigator.share) {
  try {
   await navigator.share({title: '우리가 만든 공명체', url: url.href});
   return;
  } catch (error) {
   if (error.name === 'AbortError') return;
  }
 }

 try {
  await navigator.clipboard.writeText(url.href);
  status.textContent = '영상 링크를 복사했어요.';
 } catch {
  const field = document.querySelector('#exhibitionShareLink');
  field.value = url.href;
  fallback.hidden = false;
  field.focus();
  field.select();
  status.textContent = '선택된 영상 링크를 복사해 주세요.';
 }
});

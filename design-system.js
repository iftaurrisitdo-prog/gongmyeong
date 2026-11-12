(()=>{
 'use strict';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const sections=[...document.querySelectorAll('.section-heading,.process-section-head,.process-prose,.process-cards,.about-body,.team-discipline,.experience-cover,.statement,.beyond')];
 if(!reduced.matches&&'IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.08});
  sections.forEach(el=>{el.dataset.revealContent='';observer.observe(el);});
  document.documentElement.classList.add('motion-ready');
 }
 const nav=document.querySelector('.site-head nav');
 if(nav&&document.querySelector('#research')){
  const links=[...nav.querySelectorAll('a[href^="#"]')];
  let scheduled=false;
  function update(){
   scheduled=false;const cutoff=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'))+80;
   let chosen=null;
   for(const link of links){const section=document.querySelector(link.getAttribute('href'));if(section&&section.getBoundingClientRect().top<=cutoff)chosen=link;}
   links.forEach(link=>{if(link===chosen)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  }
  addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}},{passive:true});
  addEventListener('resize',update);update();
 }
 const guide=document.querySelector('#guide'),info=document.querySelector('#info'),close=document.querySelector('#close');
 if(guide&&info&&close){
  info.setAttribute('aria-controls','guide');info.setAttribute('aria-expanded','false');
  guide.setAttribute('role','dialog');guide.setAttribute('aria-label','바다 체험 안내');
  info.addEventListener('click',()=>{info.setAttribute('aria-expanded','true');close.focus();});
  close.addEventListener('click',()=>{info.setAttribute('aria-expanded','false');info.focus();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!guide.hidden){guide.hidden=true;info.setAttribute('aria-expanded','false');info.focus();}});
 }
})();

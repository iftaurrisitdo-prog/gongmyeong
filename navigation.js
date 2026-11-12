(()=>{
const button=document.querySelector('.process-toggle'),menu=document.querySelector('#processMenu'),group=document.querySelector('.process-group');if(!button||!menu||!group)return;
let timer;
function open(){clearTimeout(timer);menu.hidden=false;button.setAttribute('aria-expanded','true');button.setAttribute('aria-label','제작 과정 메뉴 닫기');}
function close(returnFocus=false){clearTimeout(timer);menu.hidden=true;button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','제작 과정 메뉴 열기');if(returnFocus)button.focus();}
group.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')open();});
group.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'){clearTimeout(timer);timer=setTimeout(()=>close(),180);}});
button.addEventListener('click',e=>{if(e.pointerType==='mouse'){open();return;}if(menu.hidden)open();else close();});
button.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();open();menu.querySelector('a').focus();}});
document.addEventListener('click',e=>{if(!group.contains(e.target))close();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){close(true);e.stopPropagation();}});
document.addEventListener('focusin',e=>{if(!menu.hidden&&!group.contains(e.target))close();});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>close()));
})();

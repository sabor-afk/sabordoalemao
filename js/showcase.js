/* Vitrine de produtos — scroll bidirecional, sem travar a navegação. */
(() => {
 'use strict';
 const section=document.querySelector('.story-feature');
 const gallery=document.getElementById('storyGallery');
 if(!section||!gallery)return;
 const slides=[...gallery.querySelectorAll('.story-slide')];
 const bars=[...section.querySelectorAll('.story-gallery-bars span')];
 const counter=document.getElementById('storyGalleryCurrent');
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
 const desktop=window.matchMedia('(min-width:969px) and (min-height:680px)');
 const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
 let frame=0;
 const originalSlides=slides.length;
 if(originalSlides!==4)return;
 section.classList.add('story-gallery-section');
 gallery.classList.add('story-gallery-active');
 function update(){
  frame=0;
  const r=section.getBoundingClientRect();
  if(r.top>window.innerHeight||r.bottom<0)return;
  let p;
  if(desktop.matches&&!reduce.matches){
   const stickyTop=Math.max(86,Math.min(window.innerHeight*.11,128));
   const distance=Math.max(1,section.offsetHeight-window.innerHeight);
   p=clamp((-r.top+stickyTop*.18)/distance);
  }else{
   const vh=window.innerHeight;
   p=clamp((vh*.75-r.top)/Math.max(1,r.height+vh*.28));
  }
  const exact=p*originalSlides;
  const active=Math.min(originalSlides-1,Math.floor(exact));
  // O ultimo produto nao tem proximo slide: deve permanecer 100% visivel.
  // Antes 'within=1' desvanecia a quarta foto para transparencia zero.
  const within=active===originalSlides-1?0:clamp(exact-active);
  slides.forEach((slide,i)=>{
   let alpha=0, scale=1.04, shift=14;
   if(reduce.matches){
    alpha=i===active?1:0;scale=1;shift=0;
   }else{
    if(i===active){alpha=1-clamp((within-.72)/.28);scale=1+within*.035;shift=-within*20;}
    if(i===active+1){const entering=clamp((within-.45)/.55);alpha=entering;scale=1.06-entering*.06;shift=25*(1-entering);}
   }
   slide.style.opacity=alpha.toFixed(3);
   slide.style.visibility=alpha>0.002?'visible':'hidden';
   slide.style.transform='translate3d(0,'+shift.toFixed(2)+'px,0) scale('+scale.toFixed(4)+')';
   slide.style.zIndex=String(i===active+1?2:1);
  });
  bars.forEach((bar,i)=>{
   const amount=clamp(exact-i);
   bar.style.setProperty('--bar-progress',amount.toFixed(3));
  });
  // O contador corresponde à foto mais visível durante a transição.
  const displayed=slides.reduce((best,slide,i)=>Number(slide.style.opacity)>Number(slides[best].style.opacity)?i:best,0);
  if(counter)counter.textContent=String(displayed+1).padStart(2,'0');
 }
 function queue(){if(!frame)frame=requestAnimationFrame(update);}
 window.addEventListener('scroll',queue,{passive:true});
 window.addEventListener('resize',queue,{passive:true});
 desktop.addEventListener?.('change',queue);
 reduce.addEventListener?.('change',queue);
 queue();
})();

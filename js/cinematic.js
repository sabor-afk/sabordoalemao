/* Sabor do Alemão — animações cinematográficas vinculadas ao scroll.
   Sem dependências, reversíveis ao rolar para cima, acessíveis e progressivas. */
(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || !('requestAnimationFrame' in window)) return;
  const mobile = window.matchMedia('(max-width: 968px)');
  const hoverable = window.matchMedia('(hover: hover) and (pointer: fine)');
  const root = document.documentElement;
  const hero = document.querySelector('.hero-premium');
  const visual = document.querySelector('.hero-visual');
  const editorial = document.querySelector('.story-feature');
  const cards = [...document.querySelectorAll('.carro-chefe-grid .cc-card')];
  const cta = document.querySelector('.fazer-pedido-section');
  const grid = document.getElementById('produtosGrid');
  if (!hero || !visual) return;
  const clamp = (v, min=0, max=1) => Math.max(min,Math.min(max,v));
  const lerp = (a,b,t) => a+(b-a)*t;
  let cursorX=0,cursorY=0,smoothCursorX=0,smoothCursorY=0;
  let frame=0;

  // Marca somente títulos editoriais. Evita modificar textos de navegação, forms e catálogo.
  const titles = [
    hero.querySelector('h1'),
    ...document.querySelectorAll('.section-header .section-title'),
    document.querySelector('.story-copy h2'),
    document.querySelector('.pedido-premium h2')
  ].filter(Boolean);
  const animatedTitles=[];
  function splitTextNode(node) {
    const frag = document.createDocumentFragment();
    const chunks = node.textContent.match(/\S+|\s+/g) || [];
    for (const chunk of chunks) {
      if (/^\s+$/.test(chunk)) { frag.appendChild(document.createTextNode(chunk)); continue; }
      const outer = document.createElement('span');
      outer.className='cinematic-word';
      const inner=document.createElement('span');
      inner.className='cinematic-word-inner';
      inner.textContent=chunk;
      outer.appendChild(inner);
      frag.appendChild(outer);
    }
    node.replaceWith(frag);
  }
  function splitWalk(node) {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) splitTextNode(child);
      else if (child.nodeType === Node.ELEMENT_NODE && !['SCRIPT','STYLE','SVG'].includes(child.tagName)) splitWalk(child);
    }
  }
  titles.forEach(title=>{
    splitWalk(title);
    title.dataset.scrollTitle='';
    animatedTitles.push({el:title, words:[...title.querySelectorAll('.cinematic-word')], underline:title.querySelector('.underline')});
  });

  // Progressive enhancement: original text remains visible when JS is absent.
  root.classList.add('cinematic-ready');

  let productObserver;
  if ('IntersectionObserver' in window && grid) {
    productObserver=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(entry.isIntersecting){
          entry.target.classList.add('cinematic-in');
          productObserver.unobserve(entry.target);
        }
      }
    },{rootMargin:'0px 0px 65px 0px',threshold:.01});
    const register=()=>{
      [...grid.querySelectorAll('.produto-card:not(.cinematic-item)')].forEach((card,i)=>{
        card.style.setProperty('--catalog-stagger',((i%4)*55)+'ms');
        card.classList.add('cinematic-item');
        productObserver.observe(card);
      });
    };
    new MutationObserver(register).observe(grid,{childList:true});
    register();
  }

  // Os cards respondem ao cursor somente em dispositivos com mouse.
  if(hoverable.matches){
    visual.addEventListener('pointermove',e=>{
      const r=visual.getBoundingClientRect();
      cursorX=clamp((e.clientX-r.left)/r.width)*2-1;
      cursorY=clamp((e.clientY-r.top)/r.height)*2-1;
      requestDraw();
    },{passive:true});
    visual.addEventListener('pointerleave',()=>{cursorX=cursorY=0;requestDraw();});
    cards.forEach(card=>{
      card.addEventListener('pointermove',e=>{
        const r=card.getBoundingClientRect();
        const x=clamp((e.clientX-r.left)/r.width)*2-1;
        const y=clamp((e.clientY-r.top)/r.height)*2-1;
        card.style.setProperty('--card-pointer-rx',(-y*5).toFixed(2)+'deg');
        card.style.setProperty('--card-pointer-ry',(x*6).toFixed(2)+'deg');
      },{passive:true});
      card.addEventListener('pointerleave',()=>{
        card.style.setProperty('--card-pointer-rx','0deg');
        card.style.setProperty('--card-pointer-ry','0deg');
      });
    });
  }
  const set=(el,key,value)=>el?.style.setProperty(key,value);
  function progress(rect,begin=.96,end=.18){
    const viewport=window.innerHeight;
    return clamp((viewport*begin-rect.top)/(viewport*(begin-end)));
  }
  function draw(){
    frame=0;
    if(reduced.matches){root.classList.remove('cinematic-ready');return;}
    const viewH=Math.max(1,window.innerHeight);
    const scrollY=window.scrollY;
    const heroRect=hero.getBoundingClientRect();
    const hp=clamp(-heroRect.top/Math.max(1,hero.offsetHeight));
    const heroVisible=heroRect.bottom>0&&heroRect.top<viewH;
    if(heroVisible){
      const amount=mobile.matches?.45:1;
      smoothCursorX=lerp(smoothCursorX,cursorX,.13);
      smoothCursorY=lerp(smoothCursorY,cursorY,.13);
      set(hero,'--hero-rotate-x',(amount*(hp*4-smoothCursorY*3)).toFixed(2)+'deg');
      set(hero,'--hero-rotate-y',(amount*(-hp*7+smoothCursorX*5)).toFixed(2)+'deg');
      set(hero,'--hero-scale',(1+hp*.105*amount).toFixed(4));
      set(hero,'--hero-image-y',(hp*-38*amount).toFixed(1)+'px');
      set(hero,'--hero-orbit-y',(hp*-58*amount).toFixed(1)+'px');
      set(hero,'--hero-float-top',(hp*-83*amount).toFixed(1)+'px');
      set(hero,'--hero-float-bottom',(hp*62*amount).toFixed(1)+'px');
      set(hero,'--hero-content-y',(hp*-20*amount).toFixed(1)+'px');
      set(hero,'--hero-content-opacity',(1-hp*.18).toFixed(3));
    }
    for(const t of animatedTitles){
      const r=t.el.getBoundingClientRect();
      if(r.top>viewH+170||r.bottom< -150)continue;
      const p=progress(r,.92,.25);
      const total=t.words.length;
      t.words.forEach((w,i)=>{
        const local=clamp((p-(i/(total+1))*.6)/.48);
        set(w,'--kinetic-opacity',(0.18+.82*local).toFixed(3));
        set(w,'--kinetic-y',((1-local)*22).toFixed(2)+'px');
        set(w,'--kinetic-tilt',((1-local)*-9).toFixed(2)+'deg');
      });
      if(t.underline)set(t.el,'--title-underline',p.toFixed(3));
    }
    const feature=document.querySelector('.section-carro-chefe');
    if(feature){
      const r=feature.getBoundingClientRect();
      if(r.bottom>0&&r.top<viewH){
        const p=progress(r,.9,.26);
        cards.forEach((card,i)=>{
          const local=clamp((p-i*.085)/.65);
          set(card,'--card-depth-y',((1-local)*(i%2===0?68:94)).toFixed(1)+'px');
          set(card,'--card-depth-rx',((1-local)*(-9+i*2)).toFixed(2)+'deg');
          set(card,'--card-depth-ry',((1-local)*(i-1.5)*-9).toFixed(2)+'deg');
          set(card,'--card-alpha',(.22+.78*local).toFixed(3));
          set(card,'--card-photo-y',((1-local)*15).toFixed(1)+'px');
        });
      }
    }
    if(editorial){
      const r=editorial.getBoundingClientRect();
      if(r.bottom>0&&r.top<viewH){
        const total=Math.max(1,editorial.offsetHeight-viewH);
        const p=clamp((-r.top)/total);
        const amount=mobile.matches?.3:1;
        set(editorial,'--story-y',(lerp(28,-26,p)*amount).toFixed(1)+'px');
        set(editorial,'--story-turn',(lerp(-6,5,p)*amount).toFixed(2)+'deg');
        set(editorial,'--story-scale',(1+Math.sin(p*Math.PI)*.065*amount).toFixed(4));
        set(editorial,'--story-image-y',(lerp(20,-26,p)*amount).toFixed(1)+'px');
        set(editorial,'--story-image-scale',(1+Math.sin(p*Math.PI)*.045*amount).toFixed(4));
        set(editorial,'--story-light-turn',(p*16).toFixed(1)+'deg');
        set(editorial,'--story-light-scale',(1+Math.sin(p*Math.PI)*.05).toFixed(4));
        set(editorial,'--story-copy-y',(lerp(25,-25,p)*amount).toFixed(1)+'px');
        set(editorial,'--story-warmth',Math.sin(p*Math.PI).toFixed(3));
      }
    }
    if(cta){
      const r=cta.getBoundingClientRect();
      if(r.bottom>0&&r.top<viewH){
        set(cta,'--cta-light-x',(progress(r)*85).toFixed(1)+'px');
      }
    }
    if(heroVisible&&hoverable.matches&&(Math.abs(smoothCursorX-cursorX)+Math.abs(smoothCursorY-cursorY))>.012)requestDraw();
  }
  function requestDraw(){if(!frame)frame=requestAnimationFrame(draw);}
  window.addEventListener('scroll',requestDraw,{passive:true});
  window.addEventListener('resize',requestDraw,{passive:true});
  if(mobile.addEventListener)mobile.addEventListener('change',requestDraw);
  reduced.addEventListener?.('change',()=>{if(reduced.matches)root.classList.remove('cinematic-ready');else root.classList.add('cinematic-ready');requestDraw();});
  requestDraw();
})();

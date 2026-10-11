/* Uma única vitrine editorial: scroll cinematográfico no desktop,
   troca por toque no mobile e aproximação interativa das fotos reais. */
(() => {
  'use strict';
  const section = document.querySelector('.story-feature');
  const gallery = document.getElementById('storyGallery');
  if (!section || !gallery) return;

  const slides = [...gallery.querySelectorAll('.story-slide')];
  const bars = [...section.querySelectorAll('.story-gallery-bars span')];
  const counter = document.getElementById('storyGalleryCurrent');
  const hint = section.querySelector('.story-gallery-hint');
  const previousButton = document.getElementById('storyPrev');
  const nextButton = document.getElementById('storyNext');
  const openButton = document.getElementById('storyInspect');
  const dialog = document.getElementById('storyInspectDialog');
  const closeButton = document.getElementById('storyInspectClose');
  const stage = document.getElementById('storyInspectStage');
  const detailImage = document.getElementById('storyInspectImage');
  const detailTitle = document.getElementById('storyInspectTitle');
  const zoomIn = document.getElementById('storyZoomIn');
  const zoomOut = document.getElementById('storyZoomOut');
  const zoomValue = document.getElementById('storyZoomValue');
  if (slides.length !== 4 || bars.length !== 4) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width:969px) and (min-height:680px)');
  const mobile = window.matchMedia('(max-width:968px)');
  const clamp = (n,a=0,b=1) => Math.min(b,Math.max(a,n));
  const useManual = () => mobile.matches || reduce.matches;
  let frame = 0;
  let active = 0;
  let manualIndex = 0;
  let wasManual = useManual();

  section.classList.add('story-gallery-section');
  gallery.classList.add('story-gallery-active');

  function update() {
    frame = 0;
    const manual = useManual();
    if (manual !== wasManual) {
      manualIndex = active;
      wasManual = manual;
    }
    gallery.classList.toggle('story-gallery-manual', manual);
    if (hint) hint.textContent = manual ? 'DESLIZE OU USE AS SETAS' : 'ROLE PARA EXPLORAR ↓';

    if (manual) {
      active = manualIndex;
      slides.forEach((slide, i) => {
        const shown = i === manualIndex;
        slide.style.opacity = shown ? '1' : '0';
        slide.style.visibility = shown ? 'visible' : 'hidden';
        slide.style.transform = shown ? 'translate3d(0,0,0) scale(1)' : 'translate3d(0,12px,0) scale(1.035)';
        slide.style.zIndex = shown ? '2' : '1';
      });
      bars.forEach((bar,i) => bar.style.setProperty('--bar-progress', i <= manualIndex ? '1' : '0'));
      if (counter) counter.textContent = String(manualIndex + 1).padStart(2,'0');
      return;
    }

    const r = section.getBoundingClientRect();
    if (r.top > window.innerHeight || r.bottom < 0) return;
    let p;
    if (desktop.matches) {
      const stickyTop = Math.max(86,Math.min(window.innerHeight * .11,128));
      const distance = Math.max(1,section.offsetHeight-window.innerHeight);
      p = clamp((-r.top + stickyTop * .18) / distance);
    } else {
      const vh = window.innerHeight;
      p = clamp((vh * .75-r.top) / Math.max(1,r.height+vh * .28));
    }
    const exact = p * slides.length;
    const index = Math.min(slides.length - 1,Math.floor(exact));
    const within = index === slides.length - 1 ? 0 : clamp(exact-index);

    slides.forEach((slide,i) => {
      let alpha = 0, scale = 1.04, shift = 14;
      if (i === index) {
        alpha = 1-clamp((within-.72)/.28);
        scale = 1+within*.035;
        shift = -within*20;
      }
      if (i === index+1) {
        const entering = clamp((within-.45)/.55);
        alpha = entering; scale = 1.06-entering*.06; shift = 25*(1-entering);
      }
      slide.style.opacity = alpha.toFixed(3);
      slide.style.visibility = alpha > .002 ? 'visible':'hidden';
      slide.style.transform = 'translate3d(0,'+shift.toFixed(2)+'px,0) scale('+scale.toFixed(4)+')';
      slide.style.zIndex = String(i === index+1 ? 2 : 1);
    });

    bars.forEach((bar,i) => bar.style.setProperty('--bar-progress',clamp(exact-i).toFixed(3)));
    active = slides.reduce((best,slide,i) => Number(slide.style.opacity)>Number(slides[best].style.opacity)?i:best,0);
    if (counter) counter.textContent = String(active+1).padStart(2,'0');
  }

  function queue() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  function step(direction) {
    if (!useManual()) return;
    manualIndex = (manualIndex + direction + slides.length) % slides.length;
    queue();
  }

  previousButton?.addEventListener('click', () => step(-1));
  nextButton?.addEventListener('click', () => step(1));

  // No celular: gesto horizontal troca produtos, enquanto o gesto vertical
  // continua rolando a página normalmente.
  let swipeStart = null;
  gallery.addEventListener('pointerdown',event => {
    if (!useManual() || event.pointerType === 'mouse') return;
    swipeStart = { x:event.clientX, y:event.clientY };
  },{passive:true});
  gallery.addEventListener('pointerup',event => {
    if (!swipeStart || !useManual()) return;
    const dx = event.clientX-swipeStart.x;
    const dy = event.clientY-swipeStart.y;
    swipeStart = null;
    if (Math.abs(dx)>48 && Math.abs(dx)>Math.abs(dy)*1.2) step(dx<0?1:-1);
  },{passive:true});
  gallery.addEventListener('pointercancel', () => { swipeStart=null; });

  if (dialog && closeButton && stage && detailImage && detailTitle && zoomIn && zoomOut && zoomValue && typeof dialog.showModal === 'function') {
    let zoom = 1, panX = 0, panY = 0, dragging = null;
    let previousBodyOverflow = '';
    const normalizePan = () => {
      if (zoom === 1) { panX=0; panY=0; return; }
      panX = clamp(panX,-stage.clientWidth*(zoom-1)/2,stage.clientWidth*(zoom-1)/2);
      panY = clamp(panY,-stage.clientHeight*(zoom-1)/2,stage.clientHeight*(zoom-1)/2);
    };
    function renderZoom() {
      normalizePan();
      detailImage.style.transform = 'translate3d('+panX.toFixed(1)+'px,'+panY.toFixed(1)+'px,0) scale('+zoom.toFixed(2)+')';
      zoomValue.textContent = Math.round(zoom*100)+'%';
      zoomOut.disabled = zoom<=1;
      zoomIn.disabled = zoom>=3;
      stage.classList.toggle('is-zoomed',zoom>1);
    }
    function changeZoom(delta) {
      zoom = clamp(Math.round((zoom+delta)*100)/100,1,3);
      renderZoom();
    }
    openButton?.addEventListener('click', () => {
      const slide = slides[active];
      const original = slide.querySelector('img');
      detailImage.src = original.getAttribute('src');
      detailImage.alt = original.alt;
      detailTitle.textContent = slide.querySelector('figcaption strong')?.textContent || original.alt;
      zoom=1;panX=panY=0;
      renderZoom();
      previousBodyOverflow=document.body.style.overflow;
      dialog.showModal();
      document.body.style.overflow='hidden';
      closeButton.focus();
    });
    closeButton.addEventListener('click',() => dialog.close());
    dialog.addEventListener('close',() => {
      document.body.style.overflow=previousBodyOverflow;
      dragging=null;
      zoom=1;panX=panY=0;
      renderZoom();
      openButton?.focus({preventScroll:true});
    });
    dialog.addEventListener('click',event=>{if(event.target===dialog) dialog.close();});
    zoomIn.addEventListener('click',()=>changeZoom(.5));
    zoomOut.addEventListener('click',()=>changeZoom(-.5));
    stage.addEventListener('pointerdown',event=>{
      if(zoom===1 || (event.pointerType==='mouse'&&event.button!==0))return;
      dragging={id:event.pointerId,x:event.clientX,y:event.clientY,panX,panY};
      stage.setPointerCapture(event.pointerId);
    });
    stage.addEventListener('pointermove',event=>{
      if(!dragging||dragging.id!==event.pointerId)return;
      panX=dragging.panX+event.clientX-dragging.x;
      panY=dragging.panY+event.clientY-dragging.y;
      renderZoom();
    });
    const release=()=>{dragging=null;};
    stage.addEventListener('pointerup',release);
    stage.addEventListener('pointercancel',release);
    window.addEventListener('resize',()=>{if(dialog.open)renderZoom();},{passive:true});
  } else {
    openButton?.setAttribute('hidden','');
  }

  window.addEventListener('scroll',queue,{passive:true});
  window.addEventListener('resize',queue,{passive:true});
  desktop.addEventListener?.('change',queue);
  mobile.addEventListener?.('change',queue);
  reduce.addEventListener?.('change',queue);
  queue();
})();

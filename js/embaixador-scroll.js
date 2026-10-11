/* Evolucao do Embaixador — scroll bidirecional e controle acessivel. */
(() => {
  'use strict';
  const section = document.getElementById('mascote');
  if (!section) return;
  const slides = [...section.querySelectorAll('[data-embaixador-step]')];
  const copies = [...section.querySelectorAll('[data-embaixador-copy]')];
  const buttons = [...section.querySelectorAll('[data-embaixador-jump]')];
  const bars = [...section.querySelectorAll('#embaixadorProgress span')];
  const counter = document.getElementById('embaixadorCounter');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 969px) and (min-height: 680px)');
  if (slides.length !== 3 || copies.length !== 3 || bars.length !== 3) return;

  const clamp = (n, min=0, max=1) => Math.max(min, Math.min(max, n));
  let raf = 0;
  let mobileStep = 1; // em mobile o visitante escolhe as fases manualmente
  function progress() {
    const r = section.getBoundingClientRect();
    const total = Math.max(1, section.offsetHeight - innerHeight);
    return clamp(-r.top / total);
  }
  function render() {
    raf = 0;
    const scrolling = desktop.matches && !reduced.matches;
    const pos = scrolling ? progress() : mobileStep / 3;
    const raw = scrolling ? pos * 3 : mobileStep;
    const stage = scrolling ? Math.min(2, Math.floor(raw)) : mobileStep;
    // Ultimo estado nunca desaparece; cruzamento so com a proxima imagem real.
    const inside = scrolling && stage < 2 ? clamp(raw - stage) : 0;
    const transition = clamp((inside - .62) / .38);
    const shown = transition > .5 && stage < 2 ? stage + 1 : stage;
    slides.forEach((slide, i) => {
      const opacity = i === stage ? 1 - transition : i === stage + 1 ? transition : 0;
      const visible = opacity > .002;
      slide.style.opacity = opacity.toFixed(3);
      slide.style.visibility = visible ? 'visible' : 'hidden';
      slide.style.transform = 'translate3d(0,' + ((1-opacity)*15).toFixed(1) + 'px,0) scale(' + (1+(1-opacity)*.055).toFixed(4) + ')';
      slide.setAttribute('aria-hidden', visible ? 'false' : 'true');
    });
    copies.forEach((copy,i) => {
      const on = i === shown;
      copy.style.opacity = on ? '1':'0';
      copy.style.visibility = on ? 'visible':'hidden';
      copy.style.transform = 'translateY(' + (on ? 0 : 9) + 'px)';
      copy.setAttribute('aria-hidden', String(!on));
    });
    bars.forEach((bar,i) => {
      const value = scrolling ? clamp(raw - i) : i < mobileStep ? 1 : i === mobileStep ? 1 : 0;
      bar.style.setProperty('--step-progress', value.toFixed(3));
    });
    buttons.forEach((button,i) => button.setAttribute('aria-pressed',String(i===shown)));
    if(counter) counter.textContent = String(shown+1).padStart(2,'0');
  }
  function queue(){ if(!raf) raf=requestAnimationFrame(render); }
  buttons.forEach((button,i) => button.addEventListener('click',() => {
    mobileStep=i;
    if(desktop.matches && !reduced.matches){
      const target = section.getBoundingClientRect().top + scrollY + (section.offsetHeight - innerHeight) * ((i+.13)/3);
      window.scrollTo({top:target,behavior:'smooth'});
    } else queue();
  }));
  section.classList.add('embaixador-scroll-enabled');
  addEventListener('scroll',queue,{passive:true});
  addEventListener('resize',queue,{passive:true});
  desktop.addEventListener?.('change',queue);
  reduced.addEventListener?.('change',queue);
  queue();
})();

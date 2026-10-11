/* Sabor do Alemão — vitrine imersiva v1.
   Sem bibliotecas, canvas ou WebGL. Rolagem só atualiza enquanto visível. */
(() => {
  'use strict';

  const section = document.getElementById('experiencia');
  if (!section) return;

  const stage = section.querySelector('[data-immersive-stage]');
  const tabs = [...section.querySelectorAll('[data-immersive-tab]')];
  const panels = [...section.querySelectorAll('[data-immersive-panel]')];
  const images = [...section.querySelectorAll('[data-immersive-image]')];
  const counter = section.querySelector('[data-immersive-counter]');
  if (!stage || !counter || tabs.length !== 3 || panels.length !== 3 || images.length !== 3) return;

  let active = 0;
  function choose(index, focus = false) {
    if (!Number.isInteger(index) || index < 0 || index >= tabs.length) return;
    active = index;
    stage.dataset.immersiveActive = String(index);
    counter.textContent = String(index + 1).padStart(2, '0');

    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel, i) => { panel.hidden = i !== index; });
    images.forEach((figure, i) => {
      figure.classList.toggle('is-current', i === index);
      figure.setAttribute('aria-hidden', String(i !== index));
    });

    if (focus) tabs[index].focus({ preventScroll: true });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => choose(index));
    tab.addEventListener('keydown', (event) => {
      let next = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (active + 1) % tabs.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (active + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      if (next === null) return;
      event.preventDefault();
      choose(next, true);
    });
  });
  choose(0);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 961px) and (hover: hover) and (pointer: fine)');
  let visible = false;
  let rafId = 0;
  let pointerX = 0;
  let pointerY = 0;

  const resetMotion = () => {
    section.style.setProperty('--im-move-x', '0px');
    section.style.setProperty('--im-move-y', '0px');
    section.style.setProperty('--im-scroll-y', '0px');
  };

  function draw() {
    rafId = 0;
    if (!visible || !desktop.matches || reduced.matches || document.hidden) {
      resetMotion();
      return;
    }
    const rect = stage.getBoundingClientRect();
    const viewHeight = Math.max(window.innerHeight, 1);
    const center = rect.top + rect.height / 2;
    const offset = Math.max(-1, Math.min(1, (viewHeight / 2 - center) / viewHeight));
    section.style.setProperty('--im-scroll-y', (offset * 16).toFixed(2) + 'px');
    section.style.setProperty('--im-move-x', (pointerX * 9).toFixed(2) + 'px');
    section.style.setProperty('--im-move-y', (pointerY * 8).toFixed(2) + 'px');
  }

  function queue() {
    if (!rafId && visible && !reduced.matches && desktop.matches && !document.hidden) {
      rafId = requestAnimationFrame(draw);
    }
  }

  stage.addEventListener('pointermove', (event) => {
    if (!visible || !desktop.matches || reduced.matches || event.pointerType === 'touch') return;
    const rect = stage.getBoundingClientRect();
    pointerX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / Math.max(rect.width, 1) - .5) * 2));
    pointerY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / Math.max(rect.height, 1) - .5) * 2));
    queue();
  }, { passive: true });
  stage.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; queue(); });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        visible = entry.isIntersecting;
        section.classList.toggle('immersive-in-view', visible);
        if (visible) queue();
        else resetMotion();
      }
    }, { rootMargin: '90px 0px 90px 0px', threshold: 0 });
    observer.observe(section);
    if (!reduced.matches) section.classList.add('immersive-enhanced');
  } else {
    visible = true;
    section.classList.add('immersive-in-view');
  }

  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue, { passive: true });
  document.addEventListener('visibilitychange', queue);
  function onMotionChange() {
    if (reduced.matches || !desktop.matches) {
      resetMotion();
      section.classList.remove('immersive-enhanced');
      section.classList.add('immersive-in-view');
    } else {
      section.classList.add('immersive-enhanced');
      queue();
    }
  }
  reduced.addEventListener?.('change', onMotionChange);
  desktop.addEventListener?.('change', onMotionChange);
  if (reduced.matches) onMotionChange();
})();

/* Interações leves do redesign premium — preserva o catálogo original. */
(() => {
    'use strict';
    const progress = document.getElementById('readingProgress');
    const nav = document.getElementById('navbar');
    const links = [...document.querySelectorAll('#navLinks a[href^="#"]')];
    let scheduled = false;

    function updateScroll() {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
        if (nav) nav.classList.toggle('scrolled', window.scrollY > 30);
        scheduled = false;
    }

    window.addEventListener('scroll', () => {
        if (!scheduled) {
            scheduled = true;
            requestAnimationFrame(updateScroll);
        }
    }, {passive: true});
    window.addEventListener('resize', updateScroll, {passive: true});
    updateScroll();

    const toggle = document.querySelector('.mobile-toggle');
    function closeNav() {
        document.getElementById('navLinks')?.classList.remove('open');
        toggle?.setAttribute('aria-expanded', 'false');
        toggle?.setAttribute('aria-label', 'Abrir menu de navegação');
    }
    toggle?.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-label', open ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeNav();
        // Os cartões do catálogo já tratam Enter/Espaço em js/script.js.
        if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.cc-card')) {
            e.preventDefault();
            e.target.click();
        }
    });
    document.addEventListener('pointerdown', e => {
        if (window.innerWidth > 968 || !document.getElementById('navLinks')?.classList.contains('open')) return;
        if (!nav?.contains(e.target)) closeNav();
    });
    links.forEach(link => link.addEventListener('click', () => {
        closeNav();
        // A rolagem já é tratada por js/script.js, respeitando reduced-motion.
    }));

    // Observa seções para orientar navegação, sem travar rolagem.
    if ('IntersectionObserver' in window) {
        const targets = links.map(link => document.getElementById(link.hash.slice(1))).filter(Boolean);
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                links.forEach(link => {
                    if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'page');
                    else link.removeAttribute('aria-current');
                });
            });
        }, {rootMargin: '-25% 0px -65% 0px', threshold: 0});
        targets.forEach(t => observer.observe(t));
    }

    const count = document.getElementById('catalogCount');
    const grid = document.getElementById('produtosGrid');
    function refreshCount() {
        if (!count || !grid) return;
        const total = grid.querySelectorAll('.produto-card').length;
        const failure = grid.querySelector('.produtos-erro');
        if (failure) {
            count.textContent = 'Catálogo temporariamente indisponível';
        } else if (total) {
            count.textContent = total + (total === 1 ? ' produto encontrado' : ' produtos encontrados');
        } else if (grid.hasChildNodes()) {
            count.textContent = 'Nenhum produto nesta categoria';
        } else {
            count.textContent = 'Carregando catálogo…';
        }
    }
    if (grid && 'MutationObserver' in window) {
        new MutationObserver(refreshCount).observe(grid, {childList: true});
        refreshCount();
    }
})();

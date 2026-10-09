/* Refinamentos progressivos — sem dependencias externas. */
(() => {
  'use strict';
  const input = document.getElementById('catalogSearch');
  const clear = document.getElementById('clearCatalogSearch');
  const toTop = document.getElementById('backToTop');
  const grid = document.getElementById('produtosGrid');
  const count = document.getElementById('catalogCount');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const escapeText = value => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let query = '';
  const refresh = () => {
    if (!grid || !Array.isArray(window.todosProdutos) && typeof todosProdutos === 'undefined') return;
    const products = typeof todosProdutos !== 'undefined' ? todosProdutos : window.todosProdutos;
    if (!Array.isArray(products) || products.length === 0) return;
    const category = typeof categoriaAtiva !== 'undefined' ? categoriaAtiva : 'todos';
    const filtered = products.filter(p => (category === 'todos' || p.categoria === category) &&
      normalize([p.nome,p.descricao,p.categoria,p.codigo].join(' ')).includes(normalize(query)));
    grid.querySelectorAll('.reveal').forEach(el => {
      if (typeof observer !== 'undefined') observer.unobserve(el);
    });
    const build = typeof criarCard === 'function' ? criarCard : null;
    if (!build) return;
    grid.innerHTML = filtered.length
      ? filtered.map(p => build(p, produtoIndexMap.get(p))).join('')
      : '<div class="catalog-no-results"><h3>Nenhum produto encontrado</h3><p>Tente outra palavra ou selecione uma categoria diferente.</p></div>';
    if (typeof observeReveal === 'function') observeReveal();
    if (count) count.textContent = filtered.length + (filtered.length===1 ? ' produto encontrado' : ' produtos encontrados');
  };
  if (input && grid) {
    input.addEventListener('input', () => {
      query = input.value.trim();
      clear.hidden = !query;
      refresh();
    });
    clear.addEventListener('click', () => {
      input.value = ''; query = ''; clear.hidden = true; refresh(); input.focus();
    });
    document.querySelectorAll('.filtro-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (query) refresh();
      });
    });
  }
  if (toTop) {
    let pending = false;
    const update = () => {toTop.classList.toggle('is-visible',scrollY>650);pending=false;};
    window.addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update)}},{passive:true});
    update();
    toTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:reduced.matches?'auto':'smooth'}));
  }
})();

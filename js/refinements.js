/* Catálogo Premium V2 — pesquisa, filtros rápidos e ordenação centralizados. */
(() => {
  'use strict';
  const input = document.getElementById('catalogSearch');
  const clear = document.getElementById('clearCatalogSearch');
  const photos = document.getElementById('catalogOnlyPhotos');
  const featured = document.getElementById('catalogOnlyFeatured');
  const sort = document.getElementById('catalogSort');
  const reset = document.getElementById('catalogReset');
  const count = document.getElementById('catalogCount');
  const grid = document.getElementById('produtosGrid');
  const toTop = document.getElementById('backToTop');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const normalize = v => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const hasPhoto = p => Boolean(p.foto || (Array.isArray(p.fotos) && p.fotos.some(Boolean)));
  const list = () => typeof todosProdutos !== 'undefined' && Array.isArray(todosProdutos) ? todosProdutos : [];

  window.filtrarCatalogoV2 = (category = 'todos') => {
    const phrase = normalize(input?.value);
    let filtered = list().filter(p =>
      (category === 'todos' || p.categoria === category) &&
      (!phrase || normalize([p.nome,p.descricao,p.codigo,p.categoria,...(p.tags||[])].join(' ')).includes(phrase)) &&
      (!photos?.checked || hasPhoto(p)) &&
      (!featured?.checked || Boolean(p.destaque))
    );
    if(sort?.value==='az') filtered.sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR'));
    if(sort?.value==='za') filtered.sort((a,b)=>b.nome.localeCompare(a.nome,'pt-BR'));
    return filtered;
  };

  const activeFilters = () => Boolean(input?.value.trim() || photos?.checked || featured?.checked || (sort && sort.value!=='original') || (typeof categoriaAtiva!=='undefined' && categoriaAtiva!=='todos'));
  const refresh = () => {
    if (!grid || !list().length) return;
    if(typeof renderProdutos==='function') renderProdutos(typeof categoriaAtiva!=='undefined' ? categoriaAtiva : 'todos');
  };
  if(grid){
    window.addEventListener('sabordoalemao:catalog-rendered', () => {
      const n=grid.querySelectorAll('[data-product-index]').length;
      if(!n && list().length && !grid.querySelector('.produtos-erro')) {
        grid.innerHTML='<div class="catalog-no-results"><h3>Nenhum produto encontrado</h3><p>Tente remover um filtro ou buscar por outro sabor.</p></div>';
      }
      if(count && list().length)count.textContent=n+(n===1?' produto encontrado':' produtos encontrados');
      if(clear)clear.hidden=!input?.value.trim();
      if(reset)reset.hidden=!activeFilters();
    });
  }
  input?.addEventListener('input',refresh);
  clear?.addEventListener('click',()=>{
    input.value='';
    refresh();
    input.focus();
  });
  photos?.addEventListener('change',refresh);
  featured?.addEventListener('change',refresh);
  sort?.addEventListener('change',refresh);
  reset?.addEventListener('click',()=>{
    if(input)input.value='';
    if(photos)photos.checked=false;
    if(featured)featured.checked=false;
    if(sort)sort.value='original';
    document.querySelector('.filtro-btn[data-cat="todos"]')?.click();
    refresh();
  });
  if(toTop){
    let pending=false;
    const update=()=>{toTop.classList.toggle('is-visible',scrollY>650);pending=false;};
    addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update)}},{passive:true});
    update();
    toTop.addEventListener('click',()=>scrollTo({top:0,behavior:reduced.matches?'auto':'smooth'}));
  }
})();

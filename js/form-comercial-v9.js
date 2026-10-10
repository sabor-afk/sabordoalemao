/* Sabor do Alemão V9 — consulta, catálogo e revisão antes do WhatsApp. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const form = $('leadForm');
  if(!form)return;
  const city=$('cidade'),uf=$('estado'),status=$('coverageStatus');
  const product=$('produtoEspecifico'),list=$('listaProdutos');
  const preview=$('reviewStage'),dataBox=$('messagePreview');
  const btnOpen=$('openWhatsApp'),btnCopy=$('copyText'),btnEdit=$('editForm');
  const note=$('copyStatus'),sendLabel=$('formStatus');
  const params=new URLSearchParams(location.search);
  const phone='5547999743400';
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const safe=(v,max=350)=>String(v||'').trim().slice(0,max);
  const norm=v=>safe(v,180).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const makeURL=text=>'https://wa.me/'+phone+'?text='+encodeURIComponent(text);

  /* Cidade informada para consulta; nenhuma rota é considerada confirmada. */
  const suggestions={
    SC:['Joinville','Blumenau','Jaraguá do Sul','Itajaí','São Francisco do Sul','Navegantes','Araquari','Mafra','Rio do Sul'],
    PR:['Curitiba','Ponta Grossa','Guarapuava','Paranaguá','Irati','Palmeira'],
    SP:['São Paulo','Registro','Juquiá']
  };
  const cities=$('listaCidades');
  function populateCities(){
    cities?.replaceChildren();
    (suggestions[uf.value]||[]).forEach(name=>{
      const opt=document.createElement('option');
      opt.value=name;
      cities?.appendChild(opt);
    });
  }
  function updateCoverage(){
    const name=safe(city.value,80),state=uf.value;
    if(!name||!state){
      status.dataset.status='empty';
      status.textContent='Digite sua cidade e selecione o estado para solicitar a verificação de atendimento.';
    }else{
      status.dataset.status='ready';
      status.textContent='Vamos verificar a possibilidade de atendimento em '+name+' / '+(state==='Outro'?'outra região':state)+'. A disponibilidade e os dias de entrega serão confirmados pela equipe comercial.';
    }
  }
  uf.addEventListener('change',()=>{populateCities();updateCoverage()});
  city.addEventListener('input',updateCoverage);
  populateCities();updateCoverage();

  /* Pré-seleção direta do modal de produto, mantendo o catálogo como fonte. */
  const linkedProduct=safe(params.get('produto'),150),linkedCode=safe(params.get('codigo'),30);
  if(linkedProduct)product.value=linkedProduct;
  fetch('data/produtos.json',{cache:'force-cache'}).then(r=>{
    if(!r.ok)throw Error('catálogo indisponível');return r.json();
  }).then(json=>{
    const produtos=Array.isArray(json.produtos)?json.produtos:[];
    list.replaceChildren();
    produtos.forEach(p=>{
      const opt=document.createElement('option');opt.value=p.nome;list.appendChild(opt);
    });
    if(!linkedProduct&&linkedCode){
      const match=produtos.find(p=>String(p.codigo)===linkedCode);
      if(match)product.value=match.nome;
    }
  }).catch(()=>{/* O formulário continua funcional mesmo sem carregar o catálogo. */});
  const phoneInput=$('whatsapp');
  phoneInput.addEventListener('input',()=>{
    const digits=phoneInput.value.replace(/\D/g,'').slice(0,11);
    if(digits.length===11)phoneInput.value='('+digits.slice(0,2)+') '+digits.slice(2,7)+'-'+digits.slice(7);
    else if(digits.length>2)phoneInput.value='('+digits.slice(0,2)+') '+digits.slice(2);
    else phoneInput.value=digits;
    phoneInput.setCustomValidity('');
  });
  const validPhone=()=>{
    const digits=phoneInput.value.replace(/\D/g,'');
    if(digits.length && digits.length!==10 && digits.length!==11){
      phoneInput.setCustomValidity('Informe DDD e telefone ou deixe em branco.');
    }else phoneInput.setCustomValidity('');
  };
  function buildMessage(){
    const d=new FormData(form),field=name=>safe(d.get(name),600);
    const place=field('cidade')+' / '+field('estado');
    const lines=[
      'Olá! Vim pelo site do Sabor do Alemão e gostaria de solicitar atendimento comercial.','',
      '*Nome / estabelecimento:* '+field('nome'),
      '*Endereço do estabelecimento:* '+field('endereco'),
      '*Cidade / UF:* '+place
    ];
    if(field('negocio'))lines.push('*Tipo de negócio:* '+field('negocio'));
    if(field('whatsapp'))lines.push('*Meu WhatsApp:* '+field('whatsapp'));
    const interests=[...new Set(d.getAll('interesse').map(v=>safe(v,60)).filter(Boolean))];
    if(interests.length)lines.push('*Linhas de interesse:* '+interests.join(', '));
    if(field('produto'))lines.push('*Produto específico:* '+field('produto'));
    if(linkedCode && field('produto') && norm(field('produto'))===norm(linkedProduct))lines.push('*Código:* '+linkedCode);
    if(field('mensagem'))lines.push('*Observações:* '+field('mensagem'));
    lines.push('','Poderiam confirmar se atendem minha cidade e informar as condições comerciais?');
    return lines.join('\n');
  }
  function showReview(){
    validPhone();
    if(!form.reportValidity())return;
    const message=buildMessage();
    dataBox.value=message;
    btnOpen.href=makeURL(message);
    note.textContent='';
    sendLabel.textContent='Confirme os dados e abra o WhatsApp para enviar.';
    form.hidden=true;
    preview.hidden=false;
    $('stageCount').textContent='02 / 02 · REVISÃO';
    $('reviewTitle').focus({preventScroll:true});
    preview.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
  }
  form.addEventListener('submit',e=>{e.preventDefault();showReview()});
  btnEdit.addEventListener('click',()=>{
    preview.hidden=true;form.hidden=false;
    $('stageCount').textContent='01 / 02 · INFORMAÇÕES';
    $('nome').focus({preventScroll:true});
    form.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
  });
  dataBox.addEventListener('input',()=>{
    btnOpen.href=makeURL(dataBox.value);
    note.textContent='Sua edição foi incluída na mensagem.';
  });
  btnCopy.addEventListener('click',async()=>{
    try{
      await navigator.clipboard.writeText(dataBox.value);
      note.textContent='Mensagem copiada. Cole no WhatsApp quando quiser.';
    }catch(_){
      dataBox.focus();dataBox.select();
      note.textContent='Selecione e copie o texto acima (Ctrl+C).';
    }
  });
  btnOpen.addEventListener('click',()=>{
    if(!dataBox.value.trim()){
      note.textContent='Revise sua mensagem antes de continuar.';
      return;
    }
    btnOpen.href=makeURL(dataBox.value);
    sendLabel.textContent='O WhatsApp foi aberto. O envio só é concluído quando você confirmar na conversa.';
  });
})();

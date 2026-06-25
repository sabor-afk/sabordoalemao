// ── NAVBAR: adiciona classe ao rolar ─────────────────────────
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ── MENU MOBILE ───────────────────────────────────────────────
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    const toggle   = document.querySelector('.mobile-toggle');
    const isOpen   = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
}

// ── REVEAL COM INTERSECTIONOBSERVER ──────────────────────────
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.12 }
);

function observeReveal() {
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
observeReveal();

// ── SCROLL SUAVE NOS LINKS INTERNOS ──────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            document.getElementById('navLinks').classList.remove('open');
            document.querySelector('.mobile-toggle').setAttribute('aria-expanded', 'false');
        }
    });
});

// ── BOTÕES MAIS INFO ──────────────────────────────────────────
document.querySelectorAll('.btn-mais').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        alert('Entre em contato para mais informações sobre este produto!');
    });
});

// ── CATÁLOGO: gerar cards a partir de data/produtos.json ──────
let todosProdutos = [];
let categoriaAtiva = 'todos';

function criarCard(p, index) {
    const destaque = p.destaque ? ' produto-destaque' : '';
    const badge = p.badge
        ? `<div class="produto-badge${p.destaque ? ' badge-ouro' : ''}">${p.badge}</div>`
        : '';
    return `
        <div class="produto-card reveal${destaque}" data-cat="${p.categoria}"
             onclick="abrirProduto(${index})" style="cursor:pointer;" 
             role="button" aria-label="Ver detalhes de ${p.nome}" tabindex="0">
            <div class="produto-image">
                ${badge}
                ${p.foto ? `<img src="${p.foto}" alt="${p.nome}" style="width:100%;height:100%;object-fit:cover;border-radius:8px 8px 0 0;">` : `<div class="produto-emoji">${p.emoji}</div>`}
            </div>
            <div class="produto-info">
                <h3>${p.nome}</h3>
                <p>${p.descricao}</p>
                <div class="preco">
                    <div class="preco-tag">${p.embalagem}<small>Embalagem</small></div>
                </div>
                <span class="card-ver-mais">Ver detalhes →</span>
            </div>
        </div>`;
}

function renderProdutos(cat) {
    const grid = document.getElementById('produtosGrid');
    if (!grid) return;
    const filtrados = cat === 'todos'
        ? todosProdutos
        : todosProdutos.filter(p => p.categoria === cat);

    grid.innerHTML = filtrados.map((p, i) => {
        // índice global para abrir o produto certo mesmo após filtro
        const globalIndex = todosProdutos.indexOf(p);
        return criarCard(p, globalIndex);
    }).join('');
    observeReveal();
}

function initFiltros() {
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filtro-btn').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            categoriaAtiva = btn.dataset.cat;
            renderProdutos(categoriaAtiva);
        });
    });
}

fetch('data/produtos.json')
    .then(r => r.json())
    .then(data => {
        todosProdutos = data.produtos;
        renderProdutos('todos');
        initFiltros();
    })
    .catch(err => console.error('Erro ao carregar produtos.json:', err));

// ── FORMULÁRIO → WHATSAPP ─────────────────────────────────────
function enviarPedidoWhatsApp(e) {
    e.preventDefault();

    const nome     = document.getElementById('nome').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();
    const cidade   = document.getElementById('cidade').value.trim();
    const tipo     = document.getElementById('tipo').value;
    const mensagem = document.getElementById('mensagem').value.trim();

    // Coletar checkboxes marcados
    const checks = [...document.querySelectorAll('.form-checks input[type="checkbox"]:checked')]
        .map(c => c.value);
    const produtos = checks.length > 0 ? checks.join(', ') : 'Não especificado';

    // Montar mensagem formatada
    const texto = `Olá! Vim pelo site do *Sabor do Alemão* e gostaria de receber a tabela de preços. 😊

*📋 Dados do pedido:*
• *Nome/Empresa:* ${nome}
• *WhatsApp:* ${whatsapp}
• *Cidade:* ${cidade}
• *Tipo de negócio:* ${tipo}
• *Produtos de interesse:* ${produtos}${mensagem ? `
• *Observações:* ${mensagem}` : ''}

Aguardo o contato!`;

    // Número do Sabor do Alemão — altere conforme necessário
    const numero = '5547999743400';
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;

    window.open(url, '_blank');
}

// ── MODAL PRIVACIDADE ─────────────────────────────────────────
function abrirPrivacidade(e) {
    e.preventDefault();
    document.getElementById("modalPrivacidade").style.display = "flex";
    document.body.style.overflow = "hidden";
}
function fecharPrivacidade() {
    document.getElementById("modalPrivacidade").style.display = "none";
    document.body.style.overflow = "";
}
// Fechar clicando fora do modal
document.getElementById("modalPrivacidade").addEventListener("click", function(e) {
    if (e.target === this) fecharPrivacidade();
});
// Fechar com ESC
document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") fecharPrivacidade();
});


// ── MODAL PRODUTO INDIVIDUAL ──────────────────────────────────
const categoriaNomes = {
    'pasteis-forno':   'Pastéis de Forno',
    'pasteis-fritar':  'Pastéis para Fritar',
    'folhados':        'Folhados & Croissants',
    'coxinhas':        'Coxinhas',
    'empanados':       'Empanados',
    'risoles':         'Risoles',
    'pizzas':          'Mini Pizzas',
    'pao-queijo':      'Pão de Queijo',
    'hamburgueres':    'Hambúrgueres'
};

let galeriaAtual = [];
let galeriaIndex = 0;

function abrirProduto(index) {
    const p = todosProdutos[index];
    if (!p) return;

    // Monta a lista de fotos (suporta "fotos" array ou "foto" único, com fallback)
    galeriaAtual = (p.fotos && p.fotos.length > 0)
        ? p.fotos.filter(f => f)
        : (p.foto ? [p.foto] : []);
    galeriaIndex = 0;

    document.getElementById('prodEmoji').textContent = p.emoji || '';
    renderFotoAtual(p);

    // Setas e dots só aparecem com mais de 1 foto
    const temGaleria = galeriaAtual.length > 1;
    document.getElementById('prodSetaEsq').style.display = temGaleria ? 'flex' : 'none';
    document.getElementById('prodSetaDir').style.display = temGaleria ? 'flex' : 'none';

    renderGaleriaDots();
    renderGaleriaThumbs();

    // Badge
    const badgeWrap = document.getElementById('prodBadgeWrap');
    badgeWrap.innerHTML = p.badge
        ? `<span class="prod-badge-modal">${p.badge}</span>` : '';

    // Código
    const codigoEl = document.getElementById('prodCodigo');
    codigoEl.innerHTML = p.codigo
        ? `<span class="prod-codigo-item">🔖 Código: <strong>${p.codigo}</strong></span>` : '';

    // Tags
    const tagsEl = document.getElementById('prodTags');
    tagsEl.innerHTML = (p.tags || []).map(t =>
        `<span class="prod-tag-item">${t}</span>`
    ).join('');

    // Textos principais
    document.getElementById('prodCategoria').textContent = categoriaNomes[p.categoria] || p.categoria;
    document.getElementById('prodNome').textContent = p.nome;
    document.getElementById('prodDescModal').textContent = p.descricao;
    document.getElementById('prodEmbalagem').textContent = p.embalagem || '—';
    document.getElementById('prodValidade').textContent = p.validade || '6 meses congelado';
    document.getElementById('prodConservacao').textContent = p.conservacao || 'Manter congelado a -18°C';

    // Peso
    const pesoWrap = document.getElementById('prodPesoWrap');
    if (p.peso_unit) {
        document.getElementById('prodPeso').textContent = p.peso_unit;
        pesoWrap.style.display = 'flex';
    } else {
        pesoWrap.style.display = 'none';
    }

    // Modo de preparo
    const preparo = document.getElementById('prodPreparo');
    preparo.innerHTML = (p.modo_preparo || [])
        .map(passo => `<li>${passo}</li>`).join('');

    // Info nutricional
    const nutri = p.info_nutricional || {};
    const nutriWrap = document.getElementById('prodNutriWrap');
    const temNutri = Object.values(nutri).some(v => v);
    if (temNutri) {
        document.getElementById('prodNutri').innerHTML = `
            ${nutri.porcao     ? `<div class="prod-nutri-item"><span class="prod-nutri-val">${nutri.porcao}</span><span class="prod-nutri-label">Porção</span></div>` : ''}
            ${nutri.calorias   ? `<div class="prod-nutri-item"><span class="prod-nutri-val">${nutri.calorias}</span><span class="prod-nutri-label">Calorias</span></div>` : ''}
            ${nutri.carboidratos ? `<div class="prod-nutri-item"><span class="prod-nutri-val">${nutri.carboidratos}</span><span class="prod-nutri-label">Carboidratos</span></div>` : ''}
            ${nutri.proteinas  ? `<div class="prod-nutri-item"><span class="prod-nutri-val">${nutri.proteinas}</span><span class="prod-nutri-label">Proteínas</span></div>` : ''}
            ${nutri.gorduras_totais ? `<div class="prod-nutri-item"><span class="prod-nutri-val">${nutri.gorduras_totais}</span><span class="prod-nutri-label">Gorduras</span></div>` : ''}
            ${nutri.sodio      ? `<div class="prod-nutri-item"><span class="prod-nutri-val">${nutri.sodio}</span><span class="prod-nutri-label">Sódio</span></div>` : ''}
        `;
        nutriWrap.style.display = 'block';
    } else {
        nutriWrap.style.display = 'none';
    }

    // Ingredientes
    const ingredWrap = document.getElementById('prodIngredWrap');
    if (p.ingredientes) {
        document.getElementById('prodIngredientes').textContent = p.ingredientes;
        ingredWrap.style.display = 'block';
    } else {
        ingredWrap.style.display = 'none';
    }

    // Abrir modal
    document.getElementById('modalProduto').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Renderiza a foto atual da galeria (ou emoji/placeholder se não houver)
function renderFotoAtual(p) {
    const img = document.getElementById('prodImg');
    const placeholder = document.getElementById('prodFotoPlaceholder');
    const emoji = document.getElementById('prodEmoji');

    if (galeriaAtual.length > 0) {
        img.src = galeriaAtual[galeriaIndex];
        img.alt = p ? p.nome : '';
        img.style.display = 'block';
        placeholder.style.display = 'none';
        emoji.style.display = 'none';
    } else {
        img.style.display = 'none';
        placeholder.style.display = 'flex';
        emoji.style.display = 'block';
    }
}

function renderGaleriaDots() {
    const dotsWrap = document.getElementById('prodGaleriaDots');
    if (galeriaAtual.length <= 1) {
        dotsWrap.style.display = 'none';
        dotsWrap.innerHTML = '';
        return;
    }
    dotsWrap.style.display = 'flex';
    dotsWrap.innerHTML = galeriaAtual.map((_, i) =>
        `<span class="prod-dot${i === galeriaIndex ? ' active' : ''}" onclick="irParaFoto(${i})"></span>`
    ).join('');
}

function renderGaleriaThumbs() {
    const thumbsWrap = document.getElementById('prodGaleriaThumbs');
    if (galeriaAtual.length <= 1) {
        thumbsWrap.style.display = 'none';
        thumbsWrap.innerHTML = '';
        return;
    }
    thumbsWrap.style.display = 'flex';
    thumbsWrap.innerHTML = galeriaAtual.map((foto, i) =>
        `<img src="${foto}" class="prod-thumb${i === galeriaIndex ? ' active' : ''}" onclick="irParaFoto(${i})" alt="Miniatura ${i+1}">`
    ).join('');
}

function irParaFoto(i) {
    galeriaIndex = i;
    renderFotoAtual(todosProdutos.find(p => p.nome === document.getElementById('prodNome').textContent));
    renderGaleriaDots();
    renderGaleriaThumbs();
}

function galeriaAnterior(e) {
    e.stopPropagation();
    if (galeriaAtual.length === 0) return;
    galeriaIndex = (galeriaIndex - 1 + galeriaAtual.length) % galeriaAtual.length;
    irParaFoto(galeriaIndex);
}

function galeriaProxima(e) {
    e.stopPropagation();
    if (galeriaAtual.length === 0) return;
    galeriaIndex = (galeriaIndex + 1) % galeriaAtual.length;
    irParaFoto(galeriaIndex);
}

function fecharProduto() {
    document.getElementById('modalProduto').style.display = 'none';
    document.body.style.overflow = '';
}

document.getElementById('modalProduto').addEventListener('click', function(e) {
    if (e.target === this) fecharProduto();
});
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') fecharProduto();
    // Navegação por teclado quando modal está aberto
    if (document.getElementById('modalProduto').style.display === 'flex') {
        if (e.key === 'ArrowLeft') galeriaAnterior(e);
        if (e.key === 'ArrowRight') galeriaProxima(e);
    }
});

// ── VALIDAÇÃO COMPLETA: CPF/CNPJ/WHATSAPP ──────────────────────
// Aguardar DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. WhatsApp: máximo 11 dígitos
    const whatsappInput = document.getElementById('whatsapp');
    if (whatsappInput) {
        whatsappInput.addEventListener('input', function(e) {
            let valor = e.target.value.replace(/\D/g, '');
            if (valor.length > 11) {
                valor = valor.slice(0, 11);
            }
            e.target.value = valor;
        });
    }

    // 2. CPF/CNPJ: validar conforme tipo selecionado
    const cpfCnpjTipo = document.getElementById('cpf-cnpj-tipo');
    const cpfCnpjInput = document.getElementById('cpf-cnpj');

    if (cpfCnpjInput) {
        cpfCnpjInput.addEventListener('input', function(e) {
            let valor = e.target.value.replace(/\D/g, '');
            
            // Determinar limite conforme tipo selecionado
            let max = 14; // CNPJ padrão
            if (cpfCnpjTipo && cpfCnpjTipo.value === 'cpf') {
                max = 11;
            }
            
            if (valor.length > max) {
                valor = valor.slice(0, max);
            }
            e.target.value = valor;
        });
    }

    // 3. Quando muda o tipo (CPF/CNPJ), limpar campo e ajustar placeholder
    if (cpfCnpjTipo) {
        cpfCnpjTipo.addEventListener('change', function() {
            if (cpfCnpjInput) {
                cpfCnpjInput.value = '';
                if (this.value === 'cpf') {
                    cpfCnpjInput.placeholder = '00000000000 (11 dígitos)';
                } else if (this.value === 'cnpj') {
                    cpfCnpjInput.placeholder = '00000000000000 (14 dígitos)';
                }
            }
        });
    }
});

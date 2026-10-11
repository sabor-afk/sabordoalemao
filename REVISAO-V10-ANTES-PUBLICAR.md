# V10 — Revisão de publicação (sem lançamento)

Data da última atualização: 11/10/2026.

## Estado verificado

- Site premium e formulário comercial V9 presentes em `design/premium-2026`.
- Catálogo: 91 produtos; imagens do JSON verificadas no repositório. Fotos ausentes continuam pendentes.
- Teste de código realizado anteriormente: sete arquivos JavaScript com sintaxe válida, estrutura HTML consistente.
- Correções anteriores: revisões de WhatsApp, teclado e sitemap.
- **O domínio definitivo foi confirmado:** `sabordoalemao.com.br`. **Hospedagem futura: Cloudflare Pages.**
- **Nenhuma ligação do domínio ou publicação oficial realizada.**

## Otimização de imagens: concluída no GitHub

- GitHub Actions: https://github.com/sabor-afk/sabordoalemao/actions/runs/38063272758
- Resultado: **20 fotos otimizadas**, 46.678.442 → 7.466.764 bytes no total de `img/`. Economia: 39.211.678 bytes (~84%).
- Script `tools/optimize_images.py`, máximo de 1.800 px no maior lado das fotos pesadas; verificação de fidelidade por PSNR.
- Workflow ativo em `.github/workflows/optimize-images-v10.yml`: executado manualmente ou quando arquivo de configuração/script do processo for alterado na branch de testes. Não altera `main`.
- **Pendente:** conferir qualidade visual das 20 fotos no navegador e repetir testes responsivos.

## Revisão da imersão — uma única vitrine, sem duplicação (11/10/2026)

- A segunda vitrine `#experiencia` foi **removida** após revisão: repetia o conteúdo de `Praticidade que encanta`.
- Em vez de acrescentar outro carrossel, a seção original `story-feature` / `#storyGallery` agora oferece o botão **Olhar de perto**: diálogo nativo acessível, com zoom 100–300%, arraste para explorar, botão de fechar e tecla Escape.
- No celular, a galeria original permite **deslizar horizontalmente** ou usar setas. Rolagem vertical continua rolando a página. Desktop permanece com a progressão cinematográfica pelo scroll.
- Sem downloads extras de imagens, vídeo, WebGL ou dependências. Usa as quatro fotografias WebP **já existentes** na seção.
- Arquivos alterados: `index.html`, `js/showcase.js`, `css/showcase.css`; testes `tests/immersive-experience.test.mjs`. CSS/JS experimentais da vitrine duplicada foram excluídos.
- **Pendente:** validar visualmente no Edge e em celulares reais, inclusive legibilidade, zoom, toque, Escape, acessibilidade e performance. CI é somente smoke test do código.

## Revisão leve: carregamento, navegação e conteúdo técnico (11/10/2026)

- `#storyInspectImage` (zoom de "Olhar de perto") agora recebe `src` somente na abertura do diálogo; evita solicitação desnecessária da imagem do visualizador ao iniciar a página.
- Fechamento da política de privacidade agora preserva o estado anterior de rolagem e o foco, e não altera nada quando ela já está fechada.
- O catálogo não inventa mais uma validade de **6 meses** ou uma conservação de **-18°C** quando o produto não tem essas informações no JSON; nesses casos indica consulta à ficha técnica. Dados existentes dos produtos permanecem intactos.
- Retirado o `FAQPage` estruturado que afirmava pedido mínimo e condições de pagamento sem validação comercial. A FAQ só deve retornar quando houver conteúdo visível e comprovado.
- Breadcrumb de contato corrigido de `#pedido` para `#fazer-pedido`.
- Criados `tests/site-readiness.test.mjs` e expansão do GitHub Actions para testar os arquivos JavaScript principais e os dois testes de regressão.
- **Ainda pendente:** conferência visual em Edge desktop e celular, testes de performance Lighthouse/Core Web Vitals em site servido por HTTP, revisão dos dados comerciais e fichas técnicas. Smoke test não comprova desempenho real.

## Cloudflare Pages: preparação no código

- `_headers`: cabeçalhos de segurança, permissões e cache revalidável de imagens com URLs estáveis; CSP permite futura Web Analytics.
- `404.html`: página personalizada para links inexistentes.
- `GUIA-CLOUDFLARE-PAGES.md`: instruções sem ligar domínio nem publicar.
- `PLANO-SITE-CORPORATIVO-CLOUDFLARE.md`: roteiro de evolução corporativa e validação.
- `netlify.toml` é legado; não configurar o site novo via Netlify.

## Pendências comerciais — conferir antes de mudar

- Código 8808: **Torta Limão** e **Torta Maracuja**.
- Código 8810: **Bolo de Ninho Com Coco** (dois registros).
- Código 8813: **Torta Palha Italiana** (dois registros).
- Validar pedido mínimo, telefone, e-mail e cobertura comercial; SEO atualmente cita dados que ainda exigem confirmação.
- Confirmar fichas técnicas e materiais institucionais reais.

## Qualidade e lançamento

- Testar no Edge desktop e celular: animações, catálogo, filtros, modal, produtos sem foto, formulário, endereço e revisão do WhatsApp.
- Validar métricas reais Lighthouse/Core Web Vitals, acessibilidade e política LGPD.
- Revisar SEO estruturado, CNPJ/contatos, FAQs comprovadas, conteúdo por página e links.
- **Não promover para `main`, não configurar DNS e não tornar domínio público sem aprovação explícita.**

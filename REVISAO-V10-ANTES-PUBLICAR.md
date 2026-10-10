# V10 — Revisão de publicação (sem lançamento)

Data da última atualização: 10/10/2026.

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

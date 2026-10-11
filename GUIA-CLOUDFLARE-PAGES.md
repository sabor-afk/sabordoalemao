# Preparação para Cloudflare Pages — Sabor do Alemão

**Situação: configuração documentada, não publicada.** Este arquivo não conecta domínios, não habilita builds nem implanta o site.

## Infraestrutura definida

| Item | Escolha |
| --- | --- |
| Repositório | `sabor-afk/sabordoalemao` |
| Ambiente de edição | `design/premium-2026` |
| Produção no GitHub | `main` — **não atualizar sem aprovação** |
| Hospedagem final | Cloudflare Pages |
| Domínio canônico final | `https://sabordoalemao.com.br/` |
| `www` | `https://www.sabordoalemao.com.br/` → redirecionar para domínio sem `www` **na ativação** |
| Framework | Nenhum (HTML, CSS, JS e JSON estáticos) |
| Comando de build | `node tools/build-pages.mjs` |
| Build output directory | `dist` |
| Root directory | Raiz do repositório |
| API / banco | Não necessários na versão institucional B2B |
| Captura de interesse | Usuário revisa e confirma o envio no WhatsApp; não há envio automático ou banco de leads |

O site tem `index.html` na raiz e não precisa de framework nem de compilação front-end. O script `tools/build-pages.mjs` **somente copia uma lista permitida de arquivos públicos** para `dist/`: páginas HTML, `robots.txt`, `sitemap.xml`, `_headers`, e os diretórios `css/`, `js/`, `img/` e `data/`. **Não publicar a raiz do repositório como saída:** ela inclui documentos operacionais (WTTI, Bischof Vendas/Câmara Fria), testes, scripts locais e `netlify.toml` legados. A saída `dist/` não recebe esse conteúdo. O `netlify.toml` não configura Cloudflare Pages.

## Quando você autorizar criar ambiente de teste

1. Cloudflare → **Workers & Pages** → Create application → **Pages** → **Connect to Git**.
2. Escolher GitHub e o repositório `sabor-afk/sabordoalemao`.
3. **Antes de conectar o repositório à produção**, concluir a homologação da branch `design/premium-2026` e, com aprovação, incorporar a versão final na branch `main`. Na criação do Pages, selecionar produção `main`, comando **`node tools/build-pages.mjs`**, saída **`dist`**, sem preset de framework. Se `main` ainda não contiver o script, a implantação falhará.
4. Configurar testes apenas para `design/premium-2026` em branch controls.
5. **Proteção das prévias:** páginas `*.pages.dev` podem ser públicas. Habilitar a política de acesso em Settings → General → Enable access policy antes de compartilhar o link de teste. Essa configuração protege prévias, mas não necessariamente o domínio base de produção `<nome>.pages.dev`.
6. Verificar que prévias retornam `X-Robots-Tag: noindex`.
7. Testar home, catálogo, formulário, cabeçalhos, links, imagens, SEO e mobile.

**Se o objetivo é nenhuma URL pública antes da aprovação**, não criar o projeto Pages agora; continuar com a branch de testes e o servidor local.

## Somente na fase de lançamento

1. Após aprovação, fazer revisão do PR, validar resultados e promover o conteúdo para `main`.
2. Adicionar `sabordoalemao.com.br` como **Custom domain** no projeto Pages.
3. O domínio raiz exige gerenciar a zona DNS no Cloudflare, com nameservers configurados conforme o registrador. **Não mudar os servidores DNS antes de conferir e preservar registros de e-mail (MX, SPF, DKIM, DMARC) e outros serviços atuais.**
4. Adicionar `www.sabordoalemao.com.br` como domínio adicional e configurar redirecionamento 301 para a versão sem `www`, conforme o mecanismo de regras de redirecionamento do Cloudflare. Não usar `_redirects` para redirects entre domínios (não suportado).
5. Confirmar HTTPS, certificado, redirects, metadados e Search Console.
6. Ativar **Web Analytics** em Workers & Pages → projeto → Metrics. A CSP foi preparada para o beacon do Cloudflare, mas precisa ser testada no ambiente real.
7. Verificar performance, disponibilidade e log de erros nas primeiras horas após a publicação.

## Observações de segurança e custos

- O catálogo atual é estático: não precisa criar outra Cloudflare Worker nem banco D1 para hospedar. O build com Node é apenas uma cópia segura para `dist/`, sem dependências externas.
- Não adicionar Pages Functions sem necessidade: mudanças de backend exigem avaliação de cotas, custo, segurança e retenção de dados.
- O cabeçalho `_headers` define cache revalidável para fotos com nomes estáveis; cache imutável de um ano causaria versões antigas após substituição.
- Não ativar HSTS preload antecipadamente: exige garantias adicionais sobre todos os subdomínios e deve ser avaliado após o lançamento.
- Confirmar CNPJ, contatos oficiais, horário e canais válidos antes de indexar.

## Links oficiais consultados

- https://developers.cloudflare.com/pages/configuration/git-integration/
- https://developers.cloudflare.com/pages/configuration/branch-build-controls/
- https://developers.cloudflare.com/pages/configuration/preview-deployments/
- https://developers.cloudflare.com/pages/configuration/custom-domains/
- https://developers.cloudflare.com/pages/configuration/headers/
- https://developers.cloudflare.com/web-analytics/get-started/

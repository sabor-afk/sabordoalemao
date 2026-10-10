# Sabor do Alemão — Site corporativo premium | Plano de preparação

**Objetivo:** ter um site institucional e comercial à altura de uma marca consolidada, antes de ativar `sabordoalemao.com.br`.

**Hospedagem escolhida:** Cloudflare Pages (estático), com GitHub como fonte de código. **Nenhum domínio será conectado e nenhuma implantação será promovida para `main` sem autorização.**

## 1. Fundamentos e conteúdo confiável — prioridade alta

- [x] Identidade premium, histórias da marca, catálogo por categorias e apresentação do Embaixador.
- [x] Formulário B2B com endereço, interesses, mensagem revisável e encaminhamento voluntário ao WhatsApp.
- [x] 20 fotos WebP otimizadas com qualidade verificada por script. Pacote `img/`: ~46,7 MB -> ~7,5 MB.
- [x] Segurança de respostas estáticas em `_headers`, cache seguro para imagens substituídas e 404 personalizada.
- [ ] Validar telefone oficial, e-mail público, canais sociais, CNPJ/razão social para o rodapé e textos legais.
- [ ] Confirmar restrições comerciais: pedido mínimo, estados/cidades efetivamente atendidos, dias de entrega, modalidade de venda.
- [ ] Validar descrições, ingredientes, conservação, validade, pesos, alergênicos e modo de preparo dos produtos com dados oficiais.
- [ ] Conferir SKUs duplicados (8808, 8810, 8813) e fotos ausentes. **Não corrigir automaticamente**.
- [ ] Fortalecer "Quem somos": história real, fotos do negócio/equipe/produção, valores e diferenciais que possam ser comprovados.
- [ ] FAQ comercial visível com informações reais; não manter FAQ estruturada sobre informações não verificadas.

## Diretriz comercial aprovada: dois canais no mesmo site

O Sabor do Alemão terá **catálogo institucional + WhatsApp** e, em uma etapa futura, **pedidos diretamente pelo site**. Não transformar a versão atual em loja aberta antes de validar regras comerciais e de estoque.

### Canal A — institucional / WhatsApp (primeiro)

- Catálogo completo, pesquisa, categorias, fichas de produtos e contato comercial.
- Formulário com endereço, revisão da mensagem e confirmação humana pelo WhatsApp.
- Funciona mesmo para prospects sem login nem cadastro.
- Esse fluxo deve permanecer disponível quando os pedidos online forem lançados.

### Canal B — pedidos no site (etapa futura)

- Interface de catálogo com carrinho, quantidades, identificação do estabelecimento e revisão antes do envio.
- Exibir preços e condições apenas conforme política comercial real; avaliar tabelas B2B e autorização por cliente.
- Validar cobertura de entrega, quantidade mínima, unidade/caixa, estoque disponível e limites de pedido.
- **Arquitetura preferida:** estudar integração do site com **Bischof Vendas**, que já se integra à **Câmara Fria**, em vez de criar outro estoque ou duplicar regras de reserva.
- **Decisão aprovada (10/10/2026): fluxo híbrido por autorização do cliente.** Clientes cadastrados e autorizados poderão enviar pedidos diretamente ao Bischof Vendas; clientes novos ou não autorizados enviarão uma solicitação para aprovação comercial.
- **Proteção de estoque:** a solicitação ainda não aprovada não pode reservar ou baixar estoque automaticamente. No caminho direto, a reserva e a baixa deverão obedecer à integração já existente entre Bischof Vendas e Câmara Fria, após validação técnica.
- **Controle de acesso:** a autorização do cliente e as condições comerciais devem ser conferidas no servidor, nunca apenas por um campo ou botão do navegador.
- **Integração a definir:** mapear APIs, autenticação, estados e regras de reserva/baixa, além de prevenção de pedidos duplicados, antes de construir o checkout. Detalhamento: `FLUXOS-PEDIDOS-SITE-B2B.md`.
- Não adicionar pagamento online, cadastro obrigatório ou backend até haver necessidade comercial e avaliação de segurança/cotas.
- Preservar o acesso rápido ao WhatsApp em todos os fluxos.

## 2. Experiência corporativa e conversão

- [ ] Navegação e rodapé completos com acessos rápidos a catálogo, empresa, dúvidas, política de privacidade e atendimento.
- [ ] Versão mobile final: menu, tipografia, fotos, tabelas de produtos, modais e CTA.
- [ ] Melhorar a descoberta de produtos: busca, categorias e filtros já existem; validar fluxo com comerciantes reais.
- [ ] Páginas dedicadas de empresa, contato, política de privacidade e uma página de informações comerciais (conforme conteúdo aprovado).
- [ ] Informações comerciais por cidade: primeiro consulta humana; só automatizar cobertura após tabela oficial de rotas.
- [ ] Mensagens de atendimento claras, sem prometer prazo de resposta ou desconto sem confirmação.
- [ ] Feedback de carregamento, mensagens de erro e estados vazios; garantir navegação pelo teclado.
- [ ] Ícones e imagens oficiais; evitar fotos genéricas ou informações fictícias.

## 3. Desempenho, acessibilidade e descoberta

- [ ] Fazer auditoria real em Chrome/Edge, Lighthouse e dispositivos móveis (LCP, INP, CLS).
- [ ] Verificar os arquivos otimizados no navegador, sobretudo fotos de doces/bolos.
- [ ] Testar com rede lenta, zoom, teclado, leitor de tela e preferência por movimento reduzido.
- [ ] Consolidar/adiar scripts e estilos somente se as medições justificarem, sem quebrar animações.
- [ ] Conferir links internos, 404, todos os 91 produtos, filtros, modal e pré-preenchimento do formulário.
- [ ] SEO: metadados por página, links canônicos, sitemap, robots, Open Graph, dados estruturados sem campos não confirmados.
- [ ] Ativar Web Analytics no Pages após aprovação da política de privacidade. CSP já prevê o beacon do Cloudflare.
- [ ] Preferir métricas do Cloudflare sem adicionar rastreadores publicitários ou pop-ups desnecessários.

## 4. Privacidade, segurança e operação

- [ ] Revisar a política LGPD conforme o caminho real dos dados (formulário local -> confirmação do usuário -> WhatsApp).
- [ ] Informar finalidade, contato para solicitações do titular, período de armazenamento e operadores de dados, após validação jurídica.
- [ ] Sem login, pagamentos, CPF/CNPJ ou backend nesta fase: evitar custo e exposição sem uma necessidade concreta.
- [ ] Caso futuramente exista CRM, pedidos ou pagamentos, especificar integração, segurança, consentimento e retenção antes de criar APIs.
- [ ] Testar cabeçalhos de segurança no Pages e configurações DNS/HTTPS após abrir um ambiente de teste.
- [ ] Rotina de backup GitHub, controle de versões, checklist de regressão e rollback por commit.

## 5. Preparação Cloudflare Pages — sem lançamento agora

Veja `GUIA-CLOUDFLARE-PAGES.md`.

- [ ] Quando autorizado, criar projeto Pages vinculado ao GitHub `sabor-afk/sabordoalemao`.
- [ ] Framework: nenhum. Build command: em branco ou `exit 0`. Output directory: `.` (raiz).
- [ ] Branch principal (produção): `main`. Desenvolvimento: `design/premium-2026`.
- [ ] **Importante:** o projeto Pages terá endereço `*.pages.dev`, que poderá ser público. Restringir prévias via Cloudflare Access; se não quiser nenhuma presença pública, adiar a criação do projeto.
- [ ] Confirmar no painel que a prévia não é indexada por mecanismos de busca.
- [ ] Sem Pages Functions ou novas Workers: o catálogo e o formulário atuais são estáticos.
- [ ] Testes no Pages antes de apontar o domínio e ativar Analytics.
- [ ] Somente na data do lançamento: DNS da zona em Cloudflare, ativar `sabordoalemao.com.br` e `www`, HTTPS, redirecionamento canônico e Search Console.
- [ ] Revisão final e aprovação explícita antes de mover código para `main`.

## Padrão de aceitação para publicar

**Não lançar** com dados comerciais não confirmados, links quebrados, problemas críticos no mobile, política de privacidade imprecisa ou funcionamento do WhatsApp sem validação. Um catálogo bonito não substitui a confiança na informação. A versão aprovada deverá ter testes reais em computador e smartphone.

**Observação:** `netlify.toml` é legado do projeto anterior; Cloudflare Pages usa `_headers`, sem depender do Netlify Forms. O formulário atual é de mensagem revisável no WhatsApp e não grava leads sozinho.

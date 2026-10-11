# Sabor do Alemão — Pedidos B2B no site | Fluxo híbrido

**Decisão comercial aprovada em 10/10/2026:** no futuro site, clientes **autorizados** poderão enviar pedidos diretamente ao Bischof Vendas; clientes **novos ou sem autorização** terão seus pedidos submetidos à **aprovação comercial**. O canal institucional/WhatsApp continuará funcionando para todos.

**Autenticação definida (10/10/2026):** clientes terão conta **própria do site Sabor do Alemão**, com **e-mail e senha**. Esse login não será o mesmo login interno do Bischof Vendas. A autorização comercial continua separada do simples ato de criar a conta.

**Status deste documento:** especificação de proposta para implementação posterior. **Não há checkout, login, autorização nem API implantados neste repositório.** Não promover a produção nem apontar `sabordoalemao.com.br` sem aprovação.

## Login próprio e autorização comercial

- **Credenciais:** e-mail e senha exclusivos para a área do cliente no site, sem reutilizar credenciais internas do Bischof Vendas.
- **Separação de conceitos:** `conta criada` não significa `cliente autorizado`. A conta precisa estar vinculada ao cadastro comercial correto e receber permissão explícita.
- **Estados propostos:** `pendente` (pode consultar catálogo e enviar pedido para avaliação), `autorizado` (pode encaminhar diretamente após validação do servidor) e `suspenso` (sem pedidos diretos).
- **Experiência:** visitante não precisa de login para ver o catálogo e chamar pelo WhatsApp. Na área do cliente, oferecer login, recuperação de acesso, perfil, endereços e histórico de pedidos/solicitações conforme disponibilidade real de dados.
- **Segurança obrigatória:** senhas armazenadas só como hashes fortes com salt (por exemplo, Argon2id), verificação e recuperação de e-mail, proteção contra tentativas de login, sessão segura em cookie HttpOnly/Secure/SameSite, expiração e revogação de sessões, controle de acesso no servidor e auditoria das aprovações.
- **Cloudflare:** Pages hospeda o front-end público; a autenticação real requer backend, base de usuários e serviço de recuperação de senha. Avaliar integração segura com backend já existente ou Pages Functions/D1 considerando cotas e custo. Não implementar login apenas em JavaScript do navegador nem armazenar senhas no `localStorage`.
- **Vínculo com operações:** manter IDs do usuário/site e do cliente/empresa no Bischof Vendas distintos e vinculados de modo explícito. Jamais autorizar pedidos diretos com uma flag controlada pelo navegador.
- **Cadastro de contas:** ainda é preciso decidir se novos clientes podem se registrar no site e ficar aguardando liberação ou se a equipe criará/enviará convites para as contas.


## Separação operacional obrigatória: Sistema A / Sistema B

O Bischof Vendas deverá manter os pedidos separados por **Sistema A** e **Sistema B** sem confundir essa classificação com empresa, origem do pedido, vínculo de estoque ou status de aprovação comercial.

- **Sistema B:** pedido de venda apenas; não aciona a WTTI.
- **Sistema A:** pedido de venda elegível para futura integração fiscal com a WTTI, **somente se a WTTI confirmar uma forma suportada de integração e após homologação**. Enquanto isso, faturamento manual como hoje.
- **Câmara Fria:** a separação A/B não deve duplicar RESERVE/COMMIT/RETURN/RELEASE; os eventos existentes e as regras multiempresa precisam ser preservados.
- **Cliente, itens, quantidade e preços específicos:** preservar os valores comerciais e validar o tratamento fiscal antes de qualquer emissão de NF-e.
- A decisão sobre criar e aprovar contas no site é independente de A/B.

Leia `REGRAS-SISTEMA-A-B-WTTI.md` para as regras completas, perguntas ao suporte e etapas de implementação.

## Visão simplificada

```text
Visitante -> Catálogo institucional -> Carrinho -> Identificação
                                               |
                              +----------------+----------------+
                              |                                 |
                     Cliente autorizado                Cliente novo ou pendente
                              |                                 |
                    Validar regras/estoque               Solicitação comercial
                              |                                 |
                  Bischof Vendas (pedido)               Equipe analisa/aprova
                              |                                 |
                  Integração Câmara Fria           Se aprovado -> Bischof Vendas
                              |                                 |
                     Resposta ao cliente          Integração Câmara Fria, se aplicável
```

### A. Cliente autorizado — envio direto

1. Entra com e-mail e senha da conta própria do site. Uma sessão segura, validada no servidor, vincula o usuário à empresa/cliente correto no sistema comercial.
2. Seleciona produtos, quantidades/unidades e endereço cadastrado ou permitido.
3. O servidor verifica **na hora do envio** se o cliente está autorizado, se os produtos são vendidos para ele, preços/condições e regras de pedido vigentes.
4. O site usa uma integração **autenticada do servidor** com o Bischof Vendas. Nunca incluir tokens secretos no JavaScript público.
5. O Bischof Vendas aceita o pedido somente se as validações forem satisfeitas. Verificar tecnicamente como a integração atual com a Câmara Fria trata reserva, saldo, cancelamento e confirmação para evitar movimentação dupla.
6. O cliente recebe identificador do pedido e status **real retornado pelos sistemas** (não mostrar sucesso antes da confirmação de gravação).

### B. Novo cliente ou cliente ainda não autorizado — aprovação

1. Pode explorar o catálogo e montar um pedido, sem preço restrito ou dados de outros clientes.
2. Informa contato, estabelecimento e endereço comercial. Não solicitar CPF/CNPJ ou documento antes de haver justificativa e política apropriada.
3. A solicitação entra em fila para **análise comercial**. A equipe confere cobertura da rota, cadastro, quantidades, condições, preços e capacidade de atendimento.
4. A solicitação **não cria pedido operacional nem reserva/baixa estoque** antes da aprovação.
5. Se aprovada, a equipe autoriza o cliente conforme a política e confirma a solicitação; só então o pedido é criado no Bischof Vendas seguindo a regra operacional validada. Se recusada, informar o motivo aplicável, sem afetar o estoque.
6. Deixar explícito ao cliente: *solicitação enviada, aguardando confirmação*. Isso não equivale a pedido aprovado.

### C. WhatsApp institucional continua independente

- Manter acesso a catálogo, formulário comercial e link WhatsApp, inclusive sem login.
- Distinguir conversa informal, solicitação de atendimento e pedido operacional. Não declarar como registrado um pedido apenas porque abriu o WhatsApp.

## Requisitos obrigatórios de integração e segurança

- **Fonte de verdade:** confirmar com o código real do Bischof Vendas os dados mestres de clientes, produtos, preços, autorização e o evento que movimenta a Câmara Fria. Não copiar regras de estoque para o site.
- **Autorização:** confirmar a identidade com autenticação segura e checar a permissão **no servidor em cada pedido**; flags no navegador não autorizam compra direta.
- **Antiduplicidade:** usar chave de idempotência por envio; evitar novo pedido ou nova reserva no retry, duplo clique, recarregamento ou timeout.
- **Estado do pedido:** definir estados e transições com base nos sistemas reais. A UI não deve inventar IDs nem prometer entrega sem retorno do sistema.
- **Controle comercial:** distinguir solicitação, aprovação, pedido aceito e preparação/expedição/entrega; manter histórico de quem aprovou e quando.
- **Condições B2B:** validar preços por tabela/empresa, unidade e caixa, pedido mínimo real, cobertura por cidade e endereço, prazos de recebimento e regras de pagamento.
- **Segurança:** integração autenticada do lado do servidor via Pages Functions ou serviço existente, somente se necessário e avaliado quanto a custo/quotas. Cloudflare Pages para o site estático, sem criar nova Worker sem necessidade.
- **Falhas:** timeout, sem estoque e erro de integração devem preservar solicitação/carrinho quando possível, sem repetir baixas; apresentar mensagens claras.
- **LGPD:** controlar os dados pessoais necessários, consentimento/aviso, acesso, armazenamento e exclusão conforme política aprovada.

## Entregas por etapa

1. **Agora (site institucional):** finalizar páginas corporativas, catálogo, formulário, SEO e mobile, sem checkout operacional.
2. **Protótipo de pedidos:** carrinho/etapas em ambiente de testes com pedidos fictícios; não mexer em estoque.
3. **Levantamento técnico:** analisar o ZIP atual do Bischof Vendas e sua integração com Câmara Fria para mapear autorização, APIs, reservas, baixa e idempotência.
4. **Piloto de aprovação:** solicitações de clientes novos analisadas por equipe, sem movimentação antes de aceitar.
5. **Piloto de pedidos diretos:** liberar apenas para clientes cadastrados de teste, com limite e auditoria; validar pedido único e estoque.
6. **Lançamento geral:** após testes de segurança, performance, operação e aprovação comercial.

## Decisões futuras que precisam de confirmação

- Como o Bischof Vendas identifica o cadastro de clientes e suas permissões comerciais, para vincular à conta própria do site (sem reutilizar login interno).
- Se o cadastro da conta do site será aberto com aprovação posterior ou por convite criado pela equipe.
- Quem aprova novos cadastros e solicitações, e em qual sistema.
- Quando exatamente estoque é reservado e baixado no Bischof Vendas/Câmara Fria.
- Se preços por cliente poderão ser exibidos antes do login; mínimo de pedidos, condições e entrega.
- Se as solicitações devem ficar numa fila do Bischof Vendas ou em um serviço separado (preferir reaproveitar a fila existente, se houver).

**Não presumir que endpoints, permissões ou fila de aprovação já existam.** Eles serão conferidos na implementação.

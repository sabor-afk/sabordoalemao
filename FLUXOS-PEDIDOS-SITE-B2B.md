# Sabor do Alemão — Pedidos B2B no site | Fluxo híbrido

**Decisão comercial aprovada em 10/10/2026:** no futuro site, clientes **autorizados** poderão enviar pedidos diretamente ao Bischof Vendas; clientes **novos ou sem autorização** terão seus pedidos submetidos à **aprovação comercial**. O canal institucional/WhatsApp continuará funcionando para todos.

**Status deste documento:** especificação de proposta para implementação posterior. **Não há checkout, login, autorização nem API implantados neste repositório.** Não promover a produção nem apontar `sabordoalemao.com.br` sem aprovação.

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

1. Identifica-se por sessão segura, vinculada à empresa/cliente no sistema comercial.
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

- Como o Bischof Vendas identifica clientes autorizados hoje (login, vínculo com empresa, usuários e permissão).
- Quem aprova novos cadastros e solicitações, e em qual sistema.
- Quando exatamente estoque é reservado e baixado no Bischof Vendas/Câmara Fria.
- Se preços por cliente poderão ser exibidos antes do login; mínimo de pedidos, condições e entrega.
- Se as solicitações devem ficar numa fila do Bischof Vendas ou em um serviço separado (preferir reaproveitar a fila existente, se houver).

**Não presumir que endpoints, permissões ou fila de aprovação já existam.** Eles serão conferidos na implementação.

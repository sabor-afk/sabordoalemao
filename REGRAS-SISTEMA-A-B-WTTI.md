# Regras dos sistemas A/B — Bischof Vendas, Site e WTTI

**Contexto confirmado na conversa (11/10/2026):**
- O negócio utiliza Bischof Vendas para pedidos e Câmara Fria para o estoque; existe outro sistema chamado **WTTI**, usado para emissão de NF-e.
- Hoje o lançamento de notas no WTTI envolve informar manualmente cliente, cada item, quantidade e preço específico do cliente.
- O usuário consultará a WTTI na terça-feira sobre **possibilidade de integração**; não assumir que API ou importação estejam disponíveis.
- O usuário quer preservar a **classificação por sistema** ao receber pedidos no Bischof Vendas: **Sistema B: pedido somente de venda**; **Sistema A: pedido elegível para integração futura com a WTTI**, se essa possibilidade for confirmada.

**Status:** decisão de arquitetura documentada. **Nenhuma mudança funcional foi implementada no Bischof Vendas ou no WTTI.** Não publicar site, não alterar produção nem criar automação de nota sem análise e aprovação.

## Fluxo desejado

```text
Site Sabor do Alemão (catálogo / pedidos)
    |
    +-- Cliente novo / não autorizado --> solicitação para aprovação comercial
    |                                    (sem reserva/baixa automática)
    |
    +-- Cliente autorizado -------------> pedido Bischof Vendas
                                         |
                                         +-- SISTEMA B --> Pedido de venda
                                         |                Sem envio ao WTTI
                                         |
                                         +-- SISTEMA A --> Pedido de venda
                                                          |
                                                          +-- integração WTTI, SOMENTE
                                                              após viabilidade e homologação
                                                              |
                                                              +-- Nota fiscal pelo fluxo
                                                                  fiscal autorizado
```

## Três empresas emissoras no WTTI — vínculo fiscal do cliente

**Informação operacional fornecida:** existem três empresas cadastradas no WTTI, cada uma com sua própria carteira/cadastro fiscal de clientes:

1. **Bischof / Bischof Distribuidora** — Santa Catarina.
2. **Sabor do Alemão — Matriz** — Santa Catarina.
3. **Sabor do Alemão — Filial** — Paraná.

Os nomes acima são operacionais; confirmar razão social, CNPJ, códigos internos e relação matriz/filial no WTTI antes de implementar.

**Regra fundamental:** `Sistema A/B` é a modalidade/destino do **pedido**; `empresa emissora WTTI` é o estabelecimento fiscal cadastrado para aquele **cliente**. Essas duas dimensões NÃO são a mesma coisa, e a empresa emissora WTTI também não deve ser confundida com a empresa responsável pelo estoque na Câmara Fria.

### Preparar primeiro o cadastro de clientes

- No Bischof Vendas, prever vínculo fiscal do cliente com **uma das três empresas do WTTI**, usando identificadores estáveis (CNPJ/código da empresa e ID do cliente no WTTI, quando disponível); **não buscar só pelo nome**, pois há homônimos.
- Verificar onde esse relacionamento será mantido e sincronizado: se a WTTI não oferecer API/importação ou consulta de clientes, a correspondência poderá precisar ser cadastrada/validada **manualmente** no Bischof Vendas. Não afirmar que o sistema consegue consultar o WTTI automaticamente antes de confirmar a integração.
- Na hipótese de um cliente ter cadastro em **mais de uma** empresa emissora, a escolha deve ser inequívoca, controlada e validada por pedido. **Pendência para confirmar com a operação**.
- Nenhum pedido fiscal pode avançar com vínculo ausente, divergente ou ambíguo. Sinalizar `Cadastro fiscal pendente de conferência` e permitir correção apenas a usuário autorizado.
- Preservar no pedido a empresa emissora validada e o ID fiscal do cliente, como registro histórico; alterações posteriores no cadastro não podem mudar retroativamente pedidos existentes.

### Fluxo desejado para um pedido no Sistema A

1. Vendedor inicia um novo pedido e seleciona o cliente.
2. O PDV identifica a **empresa fiscal vinculada** ao cadastro do cliente (ex.: José → Sabor do Alemão Matriz/SC; Luiz → Sabor do Alemão Filial/PR).
3. O vendedor escolhe **Sistema A ou B** para **aquele pedido**; essa escolha independe do cliente. Se A, a tela mostra `Empresa emissora WTTI: [empresa do cliente]`, para conferência **antes de adicionar itens** ou de concluir.
4. Se for **Sistema A**, o pedido fica identificado para o fluxo fiscal da empresa encontrada; quando e somente quando existir conector WTTI homologado, o envio deverá usar tanto o ID da empresa emissora quanto o ID fiscal do cliente nessa empresa.
5. Se for **Sistema B**, o pedido continua somente de venda, sem integração WTTI, mesmo que o cliente tenha vínculo fiscal cadastrado.
6. Os eventos de estoque da Câmara Fria continuam seguindo as regras já existentes, **sem baixa duplicada** por causa do destino fiscal.

**Exemplos informados:** cliente vinculado à **Bischof** → empresa emissora Bischof; José vinculado à **Matriz/SC** → empresa emissora Matriz; Luiz vinculado à **Filial/PR** → empresa emissora Filial. Em todos os três casos, somente o pedido escolhido como **Sistema A** poderá seguir ao faturamento WTTI.

### Ordem de implementação, sem alterar a produção ainda

1. Confirmar as três empresas fiscais reais no WTTI e identificar seus IDs, CNPJs e cadastros de clientes.
2. Mapear os vínculos fiscais dos clientes existentes no Bischof Vendas, tratando duplicidade de nomes e cadastros entre empresas.
3. Mostrar no PDV **Cliente → Empresa fiscal identificada → escolha Sistema A/B → Produtos** (a posição visual de A/B pode ser ajustada, desde que a empresa emissora de A sempre apareça para conferência).
4. Validar que empresa fiscal, empresa do estoque e preço/tabela do cliente não sejam alterados indevidamente.
5. Só depois estudar o conector WTTI, sem presumir que a plataforma oferece API ou emissão automática de notas.

### Decisão confirmada — A/B deve ser escolhido por pedido, não por cliente

**Um mesmo cliente, vendedor ou empresa pode operar tanto pelo Sistema A quanto pelo Sistema B.** A classificação A/B pertence a **cada pedido**. Não vincular o cliente ou a empresa a um único sistema e não mudar pedidos antigos quando o cadastro for alterado.

**PDV proposto, ainda não implementado:**
1. Vendedor clica em **Novo pedido** e escolhe o cliente normalmente.
2. Logo após o cliente e **antes de incluir produtos**, aparece a seleção obrigatória **Destino do pedido: Sistema A / Sistema B**. Sem seleção, impedir a conclusão do pedido.
3. A seleção pode receber uma **sugestão visual** baseada no histórico ou preferência do cliente, mas deve exigir confirmação explícita do usuário em cada pedido. Para evitar erro fiscal, não salvar com A/B silenciosamente predefinido.
4. Selecionar A ou B **não pode trocar a empresa dona do estoque, os preços ou as quantidades**; apenas define o caminho comercial/fiscal aplicável ao pedido.
5. Mostrar o destino no resumo antes da confirmação e também no detalhe e na listagem de pedidos, com filtros A/B.
6. Depois de salvo, alterar o destino requer permissão, registro de auditoria e bloqueios para pedidos já faturados ou transmitidos ao WTTI.
7. **Site futuro:** não expor livremente essa escolha ao cliente final sem política comercial definida. O servidor deve atribuir/validar o destino por pedido; cliente autorizado ou não é outra regra independente.
8. Migração: pedidos antigos sem esse campo devem manter um estado **legado/indefinido** até decisão comercial; não converter todos para A ou B por suposição.

**Exemplo:** Mercado Exemplo pode ter `Pedido #101 — Sistema A` e `Pedido #102 — Sistema B` no mesmo dia, sem conflito, com os respectivos estados separados.

### Regras de negócio para o Bischof Vendas

1. Cada pedido deve ter identificação clara de **Sistema A** ou **Sistema B** (nomes internos até confirmação operacional); não é uma propriedade automática de todo pedido do site.
2. **Sistema B:** pedido de venda normal. Nunca disparar integração com a WTTI. **Não confundir pedido de venda com nota fiscal.**
3. **Sistema A:** pedido de venda que, **quando existir uma integração fiscal confirmada, configurada e homologada**, poderá ser encaminhado ao WTTI. Até lá, manter faturamento manual conforme a operação atual.
4. O canal de origem (`site`, `vendedor`, etc.), a empresa proprietária do estoque, o sistema A/B e a autorização comercial do cliente são **dimensões diferentes**. Não sobrescrever o vínculo com a empresa/Câmara Fria nem a tabela de preços ao selecionar A/B.
5. **Preço do cliente, itens e quantidades** devem ser preservados no pedido e enviados ao fiscal apenas pelo fluxo aplicável. O sistema fiscal deve conferir valores efetivos antes de emitir NF-e; não assumir que uma regra de preço do site seja fiscalmente válida.
6. **Sem dupla baixa:** integrar com a Câmara Fria só pelos eventos de reserva/conclusão/estorno já usados pelo Bischof Vendas, depois de revisar o comportamento existente. Enviar dados ao WTTI não pode repetir movimentações de estoque.
7. Guardar **estado fiscal separado do estado comercial**: `não aplicável` para Sistema B; para Sistema A, possíveis `pendente`, `enviado`, `erro`, `faturado` (só conforme comprovante/retorno real, se houver integração), `faturamento manual` antes disso.
8. Prevenir duplicidades ao reenviar ao WTTI com identificador estável/idempotência. Registrar tentativas, respostas e a pessoa responsável; não emitir nota duas vezes após timeout.
9. Só administradores autorizados podem corrigir Sistema A/B depois da criação, com histórico/auditoria; nunca trocar silenciosamente pedidos já faturados.
10. Se a WTTI **não** aceitar integração ou importação, a separação A/B continua útil para organizar o faturamento e o pedido continua utilizável dentro do Bischof Vendas.

### Visibilidade sugerida

- No Bischof Vendas: campo `Sistema: A / B`, etiqueta no pedido e filtros por sistema.
- Exibir ação `Enviar para WTTI` **somente no Sistema A e somente quando integração estiver homologada e ativa**.
- Para pedidos B, omitir funções fiscais. Para A sem integração, status `Faturamento manual`.
- Na área do cliente: exibir apenas os status comerciais confiáveis; dados fiscais e notas somente se integrados/confirmados.
- Separação por **empresa** e **estoque** deve continuar independente dessa classificação.

## Perguntas para o suporte WTTI (terça-feira)

1. O contrato/módulo atual permite receber **pedidos de um site próprio ou ERP externo** por API, integração ou importação? Qual documentação e quais custos?
2. É possível transferir **cliente, código do produto, quantidade e valor/preço específico do cliente**? Como tratar impostos, descontos e unidades?
3. O pedido recebido no WTTI pode ser revisado antes da emissão de NF-e, ou emite automaticamente?
4. Há retorno com ID, status e erro de processamento, e mecanismos de proteção contra duplicação?
5. Há homologação/testes sem gerar NF-e real?

## Próximos passos, sem interferir na operação

1. Suporte WTTI confirma ou nega capacidades por escrito.
2. Revisar o código e as migrações **atuais** do Bischof Vendas (sem presumir campo A/B ou vínculo fiscal já existente), mapeando as três empresas emissoras da WTTI, clientes por empresa, IDs fiscais, preços, pedidos e reservas Câmara Fria.
3. **Definido: selecionar A/B por pedido.** Antes de implementar, conferir no PDV existente onde inserir a escolha após o cliente e antes dos produtos, com confirmação explícita e sem alterar empresa/estoque.
4. Implementar filtro/etiqueta/classificação A/B no Bischof Vendas **com migração segura e compatibilidade dos pedidos existentes**, se aprovado.
5. Só depois criar e testar o conector WTTI para o Sistema A, inicialmente em homologação com registros fictícios.
6. Site no Cloudflare Pages permanece em desenvolvimento até aprovação formal.

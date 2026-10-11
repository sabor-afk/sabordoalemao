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
2. Revisar o código e as migrações **atuais** do Bischof Vendas (sem presumir campo A/B já existente), mapeando multiempresa, preços, pedidos e reservas Câmara Fria.
3. Definir se A/B é escolhido por pedido, pelo cliente ou pela empresa — com possibilidade de exceção controlada.
4. Implementar filtro/etiqueta/classificação A/B no Bischof Vendas **com migração segura e compatibilidade dos pedidos existentes**, se aprovado.
5. Só depois criar e testar o conector WTTI para o Sistema A, inicialmente em homologação com registros fictícios.
6. Site no Cloudflare Pages permanece em desenvolvimento até aprovação formal.

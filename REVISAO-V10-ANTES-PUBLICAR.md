# V10 — Checklist pré-publicação (branch de testes)

Data da revisão: 10/10/2026

## Revisões concluídas (V9)
- Scripts e HTML verificados estaticamente; fluxo de consulta do formulário revisto.
- Catálogo: 91 produtos, 30 com foto cadastrada. As imagens citadas no JSON existem no repositório.
- Botão WhatsApp: mensagem vazia agora é bloqueada; confirmação de envio continua no WhatsApp.
- Eventos de teclado antigos removidos; sitemap e robots revisados.

## Imagens
- O repositório contém 44 arquivos em img/ (~46,7 MB antes da otimização).
- Foram adicionados `tools/optimize_images.py` e um workflow **manual** em `.github/workflows/optimize-images-v10.yml`.
- **A otimização NÃO foi executada.** O workflow trabalha somente em `design/premium-2026`, compara dimensões e exige pelo menos 15% de economia e PSNR de 36 dB.
- Para rodar: disponibilizar o workflow em Actions, selecionar branch design/premium-2026 e executar manualmente quando estiver visível; se o GitHub não listar workflows novos presentes apenas em branch de testes, não executar em produção.

## Conferência comercial pendente — não alterar sem validação
- Código 8808: **Torta Limão** e **Torta Maracuja**
- Código 8810: **Bolo de Ninho Com Coco** aparece em dois registros
- Código 8813: **Torta Palha Italiana** aparece em dois registros
As duplicações são reais no JSON atual, mas podem representar variações/embalagens. Não deduplicar sem validar.
- Conferir número comercial do WhatsApp, regiões atendidas e domínio definitivo antes da publicação.
- A lista sugerida de cidades no formulário não confirma atendimento.

## Validação visual pendente
- Testar Edge desktop e mobile: scroll cinematográfico, quatro produtos, evolução do Embaixador, filtros, detalhes, tabela nutricional, formulário (endereço + prévia) e WhatsApp.
- Verificar alterações em imagens antes/depois da compressão manual e confirmar qualidade visual.
- Não mesclar em main nem publicar sem aprovação.

// Site Sabor do Alemão — verificações rápidas de conteúdo, carregamento e modais.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html=readFileSync('index.html','utf8');
const script=readFileSync('js/script.js','utf8');
const gallery=readFileSync('js/showcase.js','utf8');

test('no unverified fiscal or commercial terms are published through FAQ schema',()=>{
  assert.doesNotMatch(html,/"@type"\s*:\s*"FAQPage"/);
  assert.doesNotMatch(html,/O pedido mínimo é R\$\s*150,00/);
  assert.doesNotMatch(html,/prazos flexíveis conforme análise de crédito/);
});

test('breadcrumb CTA points to a real section',()=>{
  assert.match(html,/"item":\s*"https:\/\/sabordoalemao\.com\.br\/#fazer-pedido"/);
  assert.match(html,/\bid="fazer-pedido"/);
  assert.doesNotMatch(html,/https:\/\/sabordoalemao\.com\.br\/#pedido"/);
});

test('gallery zoom image is only loaded after viewer is opened',()=>{
  const image=html.match(/<img\b[^>]*\bid="storyInspectImage"[^>]*>/)?.[0] || '';
  assert.ok(image,'the inspection image must exist');
  assert.doesNotMatch(image,/\bsrc="/);
  assert.match(image,/\bdecoding="async"/);
  assert.match(gallery,/detailImage\.src\s*=\s*original\.getAttribute\('src'\)/);
  assert.match(gallery,/dialog\.showModal\(\)/);
});

test('modal close only unlocks scroll if that modal is actually open',()=>{
  assert.match(script,/if \(!modal \|\| modal\.style\.display !== 'flex'\) return;/);
  assert.match(script,/document\.body\.style\.overflow = privacyPreviousBodyOverflow/);
  assert.match(script,/privacyPreviousFocus\?\.isConnected/);
});

test('missing technical data does not become fabricated storage instructions',()=>{
  assert.match(script,/p\.validade \|\| 'Consulte a ficha técnica do produto'/);
  assert.match(script,/p\.conservacao \|\| 'Consulte a ficha técnica do produto'/);
  assert.doesNotMatch(script,/p\.validade \|\| '6 meses congelado'/);
  assert.doesNotMatch(script,/p\.conservacao \|\| 'Manter congelado a -18°C'/);
});

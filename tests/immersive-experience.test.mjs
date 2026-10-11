// A home mantém uma única vitrine imersiva em vez de duplicar carrosséis.
// Run: node --test tests/immersive-experience.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const css = readFileSync('css/showcase.css', 'utf8');
const js = readFileSync('js/showcase.js', 'utf8');
const section = html.match(/<section\b[^>]*class="story-feature"[\s\S]*?<\/section>/)?.[0] ?? '';
const dialog = html.match(/<dialog\b[^>]*id="storyInspectDialog"[\s\S]*?<\/dialog>/)?.[0] ?? '';

const count = (value,re) => [...value.matchAll(re)].length;

test('there is one editorial showcase, without a redundant immersive stage', () => {
  assert.equal(count(html, /class="story-feature"/g),1);
  assert.equal(count(html, /id="storyGallery"/g),1);
  assert.equal(count(html, /id="experiencia"/g),0);
  assert.ok(!html.includes('immersive-experience.css'));
  assert.ok(!html.includes('immersive-experience.js'));
  assert.ok(html.includes('href="css/showcase.css"'));
  assert.ok(html.includes('src="js/showcase.js"'));
  assert.ok(section.includes('PRATICIDADE'));
});

test('all original slides remain and product photos are local WebP files', () => {
  assert.equal(count(section, /class="story-slide"/g),4);
  const paths = [...section.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(paths.length,4);
  for(const path of paths){
    assert.match(path,/^img\/[\w.\-]+\.webp$/i);
    assert.ok(existsSync(path),path);
  }
  assert.equal(count(section, /\bstory-gallery-bars/g),1);
  assert.equal(count(section, /<video\b/g),0);
  assert.equal(count(section, /<canvas\b/g),0);
});

test('original gallery gains usable zoom and mobile navigation controls', () => {
  for(const id of ['storyInspect','storyPrev','storyNext']) {
    assert.ok(section.includes('id="'+id+'"'));
  }
  for(const id of ['storyInspectDialog','storyInspectClose','storyInspectStage','storyInspectImage','storyInspectTitle','storyZoomIn','storyZoomOut','storyZoomValue']) {
    assert.ok(dialog.includes('id="'+id+'"'));
  }
  assert.match(dialog,/\baria-labelledby="storyInspectTitle"/);
  assert.match(dialog,/\bdraggable="false"/);
  assert.match(js,/\.showModal\(\)/);
  assert.match(js,/\.close\(\)/);
  assert.match(js,/pointerdown/);
  assert.match(js,/pointerup/);
  assert.match(js,/Math\.abs\(dx\)>48/);
  assert.match(js,/pointermove/);
  assert.match(js,/detailImage\.alt/);
});

test('mobile navigation does not break existing desktop scroll progression', () => {
  assert.match(js,/const useManual = \(\) => mobile\.matches \|\| reduce\.matches/);
  assert.match(js,/story-gallery-manual/);
  assert.match(js,/section\.getBoundingClientRect\(\)/);
  assert.match(js,/requestAnimationFrame/);
  assert.match(js,/prefers-reduced-motion/);
  assert.match(css,/@media\(max-width:\s*968px\),\s*\(prefers-reduced-motion:/);
  assert.match(css,/@media\(prefers-reduced-motion:\s*reduce\)/);
  assert.ok(html.indexOf('id="storyGallery"') < html.indexOf('id="sobre"'));
  assert.ok(html.indexOf('id="sobre"') < html.indexOf('id="produtos"'));
});


test('home hero, floating details, highlighted cards and story use distinct photos', () => {
  const hero = html.match(/class="hero-main-product" src="([^"]+)"/)?.[1];
  const floating = [...html.matchAll(/class="hero-float [^"]+"\s*>\s*<img src="([^"]+)"/g)].map(m=>m[1]);
  const cards = [...html.matchAll(/class="cc-image"><img src="([^"]+)"/g)].map(m=>m[1]);
  const gallery = [...section.matchAll(/class="story-slide">\s*<img src="([^"]+)"/g)].map(m=>m[1]);
  const all = [hero,...floating,...cards,...gallery];
  assert.equal(floating.length,2);
  assert.equal(cards.length,4);
  assert.equal(gallery.length,4);
  assert.equal(all.length,11);
  assert.equal(new Set(all).size,11,'the homepage must not repeat a highlighted product photo');
  assert.ok(html.includes('<link rel="preload" as="image" href="'+hero+'">'));
  for(const path of all) {
    assert.match(path,/^img\/[^"<]+\.webp$/);
    assert.ok(existsSync(path),'missing product photo '+path);
  }
  // The commercial catalog remains the full source of products; these are highlights only.
  assert.ok(html.includes('id="produtosGrid"'));
  assert.ok(html.includes('href="#produtos"'));
});

// Lightweight checks for the self-contained immersive showcase.
// Run: node --test tests/immersive-experience.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const css = readFileSync('css/immersive-experience.css', 'utf8');
const js = readFileSync('js/immersive-experience.js', 'utf8');
const section = html.match(/<section\b[^>]*id="experiencia"[\s\S]*?<\/section>/)?.[0] ?? '';

function count(value, re) { return [...value.matchAll(re)].length; }
test('the showcase is mounted exactly once and its dependencies are linked', () => {
  assert.equal(count(html, /id="experiencia"/g), 1);
  assert.ok(html.includes('href="css/immersive-experience.css"'));
  assert.ok(html.includes('src="js/immersive-experience.js"'));
  assert.ok(html.indexOf('id="experiencia"') > html.indexOf('id="sobre"'));
  assert.ok(html.indexOf('id="experiencia"') < html.indexOf('id="produtos"'));
});
test('three accessible tabs correspond to three content panels and images', () => {
  assert.equal(count(section, /data-immersive-tab="\d"/g), 3);
  assert.equal(count(section, /data-immersive-panel="\d"/g), 3);
  assert.equal(count(section, /data-immersive-image="\d"/g), 3);
  for (let i = 0; i < 3; i += 1) {
    assert.ok(section.includes('id="immersive-tab-' + i + '"'));
    assert.ok(section.includes('id="immersive-panel-' + i + '"'));
    assert.ok(section.includes('aria-controls="immersive-panel-' + i + '"'));
    assert.ok(section.includes('aria-labelledby="immersive-tab-' + i + '"'));
  }
  assert.equal(count(section, /aria-selected="true"/g), 1);
  assert.equal(count(section, /\brole="tablist"/g), 1);
  assert.equal(count(section, /\brole="tabpanel"/g), 3);
});
test('every product photo exists locally; no new remote image or video', () => {
  const paths = [...section.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(paths.length, 3);
  for (const path of paths) {
    assert.match(path, /^img\/[\w.\-]+\.webp$/i);
    assert.ok(existsSync(path), path);
  }
  assert.ok(!section.includes('<video'));
  assert.ok(!section.includes('<canvas'));
});
test('motion is progressive, keyboard-operable, and optional', () => {
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /max-width:\s*620px/);
  assert.match(js, /IntersectionObserver/);
  assert.match(js, /requestAnimationFrame/);
  assert.match(js, /aria-selected/);
  assert.match(js, /event\.key === 'ArrowRight'/);
  assert.match(js, /document\.hidden/);
  assert.ok(section.includes('href="#produtos"'));
});
